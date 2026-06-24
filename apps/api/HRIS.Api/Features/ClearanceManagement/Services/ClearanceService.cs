using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.ClearanceManagement.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.ClearanceManagement.Services;

public class ClearanceService : IClearanceService
{
    private const string StatusPending = "Pending";
    private const string StatusInProgress = "InProgress";
    private const string StatusCompleted = "Completed";

    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public ClearanceService(
        AppDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<ClearanceDto>> GetAllAsync()
    {
        var clearances = await _context.EmployeeClearances
            .AsNoTracking()
            .Include(x => x.Employee)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        var employeeIds = clearances
            .Select(x => x.EmployeeId)
            .Distinct()
            .ToList();

        var assetRequirementMap =
            await ComputeAssetRequirementCompletedMapAsync(employeeIds);

        return clearances
            .Select(clearance => ToDto(
                clearance,
                assetRequirementMap.TryGetValue(clearance.EmployeeId, out var completed) && completed))
            .ToList();
    }

    public async Task<ClearanceDto> GetByIdAsync(int id)
    {
        var clearance = await _context.EmployeeClearances
            .AsNoTracking()
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (clearance is null)
        {
            throw new ApiException("Clearance record not found.", StatusCodes.Status404NotFound);
        }

        return await ToDtoAsync(clearance);
    }

    public async Task<ClearanceDto?> GetMyClearanceAsync(
        ClaimsPrincipal actor)
    {
        var userId = GetUserId(actor);

        if (!userId.HasValue)
        {
            return null;
        }

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        if (employee is null)
        {
            return null;
        }

        var clearance = await _context.EmployeeClearances
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x => x.EmployeeId == employee.Id)
            .OrderByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync();

        if (clearance is null)
        {
            return null;
        }

        return await ToDtoAsync(clearance);
    }

    public async Task<ClearanceDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateClearanceRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var remarks = NormalizeOptional(request.Remarks, 500, "Remarks cannot exceed 500 characters.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId);

        if (employee is null)
        {
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);
        }

        if (!employee.IsActive)
        {
            throw new ApiException("Inactive employees cannot be processed for clearance.", StatusCodes.Status400BadRequest);
        }

        var hasActiveClearance = await _context.EmployeeClearances
            .AnyAsync(x =>
                x.EmployeeId == request.EmployeeId &&
                x.Status != StatusCompleted);

        if (hasActiveClearance)
        {
            throw new ApiException("Employee already has an active clearance record.", StatusCodes.Status409Conflict);
        }

        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        var clearance = new EmployeeClearance
        {
            EmployeeId = employee.Id,
            LastWorkingDay = request.LastWorkingDay,
            DepartmentApproved = false,
            HrApproved = false,
            Status = StatusPending,
            Remarks = remarks,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.EmployeeClearances.Add(clearance);

        AddClearanceActivity(
            clearance,
            "CLEARANCE_CREATED",
            remarks,
            actor);

        await _context.SaveChangesAsync();

        AddActivityLog(
            actor,
            "CLEARANCE_CREATED",
            "CLEARANCE_MANAGEMENT",
            "EmployeeClearance",
            clearance.Id.ToString(),
            $"Created clearance record for {FormatEmployeeName(employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        clearance.Employee = employee;

        return await ToDtoAsync(clearance);
    }

    public async Task<ClearanceDto> UpdateDepartmentApprovalAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        UpdateDepartmentApprovalRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var clearance = await GetClearanceForUpdateAsync(clearanceId);
        var remarks = NormalizeOptional(request.Remarks, 500, "Remarks cannot exceed 500 characters.");

        EnsureNotCompleted(clearance);

        clearance.DepartmentApproved = request.Approved;
        clearance.Status = ResolveNonCompletedStatus(clearance);
        clearance.UpdatedAtUtc = DateTime.UtcNow;

        var action = request.Approved
            ? "CLEARANCE_DEPARTMENT_APPROVED"
            : "CLEARANCE_DEPARTMENT_APPROVAL_REVOKED";

        AddClearanceActivity(clearance, action, remarks, actor);

        AddActivityLog(
            actor,
            action,
            "CLEARANCE_MANAGEMENT",
            "EmployeeClearance",
            clearance.Id.ToString(),
            request.Approved
                ? $"Department clearance approved for {FormatEmployeeName(clearance.Employee)}."
                : $"Department clearance approval revoked for {FormatEmployeeName(clearance.Employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return await ToDtoAsync(clearance);
    }

    public async Task<ClearanceDto> UpdateHrApprovalAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        UpdateHrApprovalRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var clearance = await GetClearanceForUpdateAsync(clearanceId);
        var remarks = NormalizeOptional(request.Remarks, 500, "Remarks cannot exceed 500 characters.");

        EnsureNotCompleted(clearance);

        clearance.HrApproved = request.Approved;
        clearance.Status = ResolveNonCompletedStatus(clearance);
        clearance.UpdatedAtUtc = DateTime.UtcNow;

        var action = request.Approved
            ? "CLEARANCE_HR_APPROVED"
            : "CLEARANCE_HR_APPROVAL_REVOKED";

        AddClearanceActivity(clearance, action, remarks, actor);

        AddActivityLog(
            actor,
            action,
            "CLEARANCE_MANAGEMENT",
            "EmployeeClearance",
            clearance.Id.ToString(),
            request.Approved
                ? $"HR clearance approved for {FormatEmployeeName(clearance.Employee)}."
                : $"HR clearance approval revoked for {FormatEmployeeName(clearance.Employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return await ToDtoAsync(clearance);
    }

    public async Task<ClearanceDto> CompleteAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        CompleteClearanceRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var clearance = await GetClearanceForUpdateAsync(clearanceId);
        var remarks = NormalizeOptional(request.Remarks, 500, "Remarks cannot exceed 500 characters.");

        EnsureNotCompleted(clearance);

        var assetRequirementCompleted =
            await ComputeAssetRequirementCompletedAsync(clearance.EmployeeId);

        if (!assetRequirementCompleted)
        {
            throw new ApiException("Asset return requirement is not yet completed.", StatusCodes.Status400BadRequest);
        }

        if (!clearance.DepartmentApproved)
        {
            throw new ApiException("Department clearance approval is required.", StatusCodes.Status400BadRequest);
        }

        if (!clearance.HrApproved)
        {
            throw new ApiException("HR clearance approval is required.", StatusCodes.Status400BadRequest);
        }

        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        clearance.Status = StatusCompleted;
        clearance.CompletedAtUtc = DateTime.UtcNow;
        clearance.UpdatedAtUtc = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(remarks))
        {
            clearance.Remarks = remarks;
        }

        clearance.Employee.IsActive = false;
        clearance.Employee.UpdatedAtUtc = DateTime.UtcNow;

        AddClearanceActivity(
            clearance,
            "CLEARANCE_COMPLETED",
            remarks,
            actor);

        AddActivityLog(
            actor,
            "CLEARANCE_COMPLETED",
            "CLEARANCE_MANAGEMENT",
            "EmployeeClearance",
            clearance.Id.ToString(),
            $"Completed clearance for {FormatEmployeeName(clearance.Employee)} and marked employee inactive.",
            ipAddress,
            userAgent);

        AddActivityLog(
            actor,
            "EMPLOYEE_STATUS_UPDATED",
            "EMPLOYEE_MANAGEMENT",
            "Employee",
            clearance.Employee.Id.ToString(),
            $"Updated employee status {clearance.Employee.EmployeeNumber} -> Inactive.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        return await ToDtoAsync(clearance);
    }

    public async Task<IReadOnlyList<ClearanceActivityDto>> GetActivitiesAsync(
        int clearanceId)
    {
        var clearanceExists = await _context.EmployeeClearances
            .AsNoTracking()
            .AnyAsync(x => x.Id == clearanceId);

        if (!clearanceExists)
        {
            throw new ApiException("Clearance record not found.", StatusCodes.Status404NotFound);
        }

        var activities = await _context.EmployeeClearanceActivities
            .AsNoTracking()
            .Include(x => x.ActorUser)
            .Where(x => x.EmployeeClearanceId == clearanceId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.Id)
            .ToListAsync();

        return activities
            .Select(x => new ClearanceActivityDto
            {
                Id = x.Id,
                Action = x.Action,
                Remarks = x.Remarks,
                ActorUserId = x.ActorUserId,
                ActorUserName = x.ActorUser?.FullName,
                CreatedAtUtc = x.CreatedAtUtc
            })
            .ToList();
    }

    private async Task<EmployeeClearance> GetClearanceForUpdateAsync(int clearanceId)
    {
        var clearance = await _context.EmployeeClearances
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == clearanceId);

        if (clearance is null)
        {
            throw new ApiException("Clearance record not found.", StatusCodes.Status404NotFound);
        }

        return clearance;
    }

    private async Task<ClearanceDto> ToDtoAsync(EmployeeClearance clearance)
    {
        var assetRequirementCompleted =
            await ComputeAssetRequirementCompletedAsync(clearance.EmployeeId);

        return ToDto(clearance, assetRequirementCompleted);
    }

    private static ClearanceDto ToDto(
        EmployeeClearance clearance,
        bool assetRequirementCompleted)
    {
        return new ClearanceDto
        {
            Id = clearance.Id,
            EmployeeId = clearance.EmployeeId,
            EmployeeNumber = clearance.Employee.EmployeeNumber,
            EmployeeName = FormatEmployeeName(clearance.Employee),
            Department = clearance.Employee.Department ?? string.Empty,
            Position = clearance.Employee.Position ?? string.Empty,
            LastWorkingDay = clearance.LastWorkingDay,
            AssetRequirementCompleted = assetRequirementCompleted,
            DepartmentApproved = clearance.DepartmentApproved,
            HrApproved = clearance.HrApproved,
            Status = clearance.Status,
            Remarks = clearance.Remarks,
            CreatedAtUtc = clearance.CreatedAtUtc,
            UpdatedAtUtc = clearance.UpdatedAtUtc,
            CompletedAtUtc = clearance.CompletedAtUtc
        };
    }

    private async Task<bool> ComputeAssetRequirementCompletedAsync(
        Guid employeeId)
    {
        var activeAssignmentIds = await _context.AssetAssignments
            .AsNoTracking()
            .Where(x =>
                x.EmployeeId == employeeId &&
                x.IsActive)
            .Select(x => x.Id)
            .ToListAsync();

        if (activeAssignmentIds.Count == 0)
        {
            return true;
        }

        var returnedAssignmentIds = (await _context.AssetReturns
                .AsNoTracking()
                .Where(x => activeAssignmentIds.Contains(x.AssetAssignmentId))
                .Select(x => x.AssetAssignmentId)
                .Distinct()
                .ToListAsync())
            .ToHashSet();

        return activeAssignmentIds.All(returnedAssignmentIds.Contains);
    }

    private async Task<Dictionary<Guid, bool>> ComputeAssetRequirementCompletedMapAsync(
        IReadOnlyCollection<Guid> employeeIds)
    {
        var result = employeeIds.ToDictionary(
            employeeId => employeeId,
            _ => true);

        if (employeeIds.Count == 0)
        {
            return result;
        }

        var activeAssignments = await _context.AssetAssignments
            .AsNoTracking()
            .Where(x =>
                employeeIds.Contains(x.EmployeeId) &&
                x.IsActive)
            .Select(x => new
            {
                x.Id,
                x.EmployeeId
            })
            .ToListAsync();

        if (activeAssignments.Count == 0)
        {
            return result;
        }

        var activeAssignmentIds = activeAssignments
            .Select(x => x.Id)
            .ToList();

        var returnedAssignmentIds = (await _context.AssetReturns
                .AsNoTracking()
                .Where(x => activeAssignmentIds.Contains(x.AssetAssignmentId))
                .Select(x => x.AssetAssignmentId)
                .Distinct()
                .ToListAsync())
            .ToHashSet();

        foreach (var group in activeAssignments.GroupBy(x => x.EmployeeId))
        {
            result[group.Key] = group.All(x => returnedAssignmentIds.Contains(x.Id));
        }

        return result;
    }

    private static string ResolveNonCompletedStatus(EmployeeClearance clearance)
    {
        return clearance.DepartmentApproved || clearance.HrApproved
            ? StatusInProgress
            : StatusPending;
    }

    private static void EnsureNotCompleted(EmployeeClearance clearance)
    {
        if (clearance.Status == StatusCompleted)
        {
            throw new ApiException("Completed clearance records cannot be modified.", StatusCodes.Status400BadRequest);
        }
    }

    private void AddClearanceActivity(
        EmployeeClearance clearance,
        string action,
        string? remarks,
        ClaimsPrincipal actor)
    {
        _context.EmployeeClearanceActivities.Add(new EmployeeClearanceActivity
        {
            EmployeeClearance = clearance,
            Action = action,
            Remarks = remarks,
            ActorUserId = GetUserId(actor),
            CreatedAtUtc = DateTime.UtcNow
        });
    }

    private void AddActivityLog(
        ClaimsPrincipal actor,
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary,
        string? ipAddress,
        string? userAgent)
    {
        var log = _activityLogger.Build(
            actor,
            action,
            module,
            targetType,
            targetId,
            summary,
            ipAddress,
            userAgent);

        if (log is not null)
        {
            _context.ActivityLogs.Add(log);
        }
    }

    private static long? GetUserId(ClaimsPrincipal actor)
    {
        var value =
            actor.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? actor.FindFirstValue("sub")
            ?? actor.FindFirstValue("userId")
            ?? actor.FindFirstValue("id");

        return long.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private static string? NormalizeOptional(
        string? value,
        int maxLength,
        string tooLongMessage)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        if (normalized.Length > maxLength)
        {
            throw new ApiException(tooLongMessage, StatusCodes.Status400BadRequest);
        }

        return normalized;
    }

    private static string FormatEmployeeName(Employee employee)
    {
        return string.Join(
            " ",
            new[]
            {
                employee.FirstName,
                employee.MiddleName,
                employee.LastName
            }.Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}
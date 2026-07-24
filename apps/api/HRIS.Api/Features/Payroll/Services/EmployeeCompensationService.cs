using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Payroll.Services;

public class EmployeeCompensationService : IEmployeeCompensationService
{
    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    private static readonly string[] AllowedCompensationTypes = ["Monthly", "Daily"];

    public EmployeeCompensationService(AppDbContext context, IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<EmployeeCompensationDto>> GetAllAsync()
    {
        return await _context.EmployeeCompensations
            .AsNoTracking()
            .Include(x => x.Employee)
            .OrderBy(x => x.Employee.LastName)
            .ThenBy(x => x.Employee.FirstName)
            .ThenByDescending(x => x.IsActive)
            .ThenByDescending(x => x.EffectiveFrom)
            .Select(x => ToDto(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<EmployeeCompensationDto>> GetByEmployeeAsync(Guid employeeId)
    {
        var employeeExists = await _context.Employees
            .AsNoTracking()
            .AnyAsync(x => x.Id == employeeId);

        if (!employeeExists)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        return await _context.EmployeeCompensations
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x => x.EmployeeId == employeeId)
            .OrderByDescending(x => x.IsActive)
            .ThenByDescending(x => x.EffectiveFrom)
            .Select(x => ToDto(x))
            .ToListAsync();
    }

    public async Task<EmployeeCompensationDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateEmployeeCompensationRequest request,
        string? ipAddress,
        string? userAgent)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId);

        if (employee is null)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        var compensationType = NormalizeCompensationType(request.CompensationType);
        ValidateDateRange(request.EffectiveFrom, request.EffectiveTo);

        if (request.IsActive)
            await DeactivateCurrentCompensationsAsync(request.EmployeeId);

        var compensation = new EmployeeCompensation
        {
            EmployeeId = request.EmployeeId,
            CompensationType = compensationType,
            BaseAmount = request.BaseAmount,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.EmployeeCompensations.Add(compensation);

        AddActivityLog(
            actor,
            "EMPLOYEE_COMPENSATION_CREATED",
            "PAYROLL",
            "EmployeeCompensation",
            null,
            $"Created {compensationType} compensation for {FormatEmployeeName(employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        compensation.Employee = employee;

        return ToDto(compensation);
    }

    public async Task<EmployeeCompensationDto> UpdateAsync(
        ClaimsPrincipal actor,
        int id,
        UpdateEmployeeCompensationRequest request,
        string? ipAddress,
        string? userAgent)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var compensation = await _context.EmployeeCompensations
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (compensation is null)
            throw new ApiException("Employee compensation not found.", StatusCodes.Status404NotFound);

        var compensationType = NormalizeCompensationType(request.CompensationType);
        ValidateDateRange(request.EffectiveFrom, request.EffectiveTo);

        if (request.IsActive)
            await DeactivateCurrentCompensationsAsync(compensation.EmployeeId, compensation.Id);

        compensation.CompensationType = compensationType;
        compensation.BaseAmount = request.BaseAmount;
        compensation.EffectiveFrom = request.EffectiveFrom;
        compensation.EffectiveTo = request.EffectiveTo;
        compensation.IsActive = request.IsActive;
        compensation.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "EMPLOYEE_COMPENSATION_UPDATED",
            "PAYROLL",
            "EmployeeCompensation",
            compensation.Id.ToString(),
            $"Updated compensation for {FormatEmployeeName(compensation.Employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return ToDto(compensation);
    }

    private async Task DeactivateCurrentCompensationsAsync(Guid employeeId, int? exceptId = null)
    {
        var activeCompensations = await _context.EmployeeCompensations
            .Where(x => x.EmployeeId == employeeId && x.IsActive && (!exceptId.HasValue || x.Id != exceptId.Value))
            .ToListAsync();

        foreach (var compensation in activeCompensations)
        {
            compensation.IsActive = false;
            compensation.UpdatedAtUtc = DateTime.UtcNow;
        }
    }

    private static string NormalizeCompensationType(string compensationType)
    {
        var normalized = compensationType.Trim();

        var match = AllowedCompensationTypes.FirstOrDefault(x =>
            string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (match is null)
            throw new ApiException("Invalid compensation type.");

        return match;
    }

    private static void ValidateDateRange(DateOnly effectiveFrom, DateOnly? effectiveTo)
    {
        if (effectiveFrom == default)
            throw new ApiException("Effective start date is required.");

        if (effectiveTo.HasValue && effectiveTo.Value == default)
            throw new ApiException("Effective end date is invalid.");

        if (effectiveTo.HasValue && effectiveTo.Value < effectiveFrom)
            throw new ApiException("Effective end date cannot be earlier than effective start date.");
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
            _context.ActivityLogs.Add(log);
    }

    private static EmployeeCompensationDto ToDto(EmployeeCompensation compensation)
    {
        return new EmployeeCompensationDto
        {
            Id = compensation.Id,
            EmployeeId = compensation.EmployeeId,
            EmployeeNumber = compensation.Employee?.EmployeeNumber ?? string.Empty,
            EmployeeName = compensation.Employee is null ? string.Empty : FormatEmployeeName(compensation.Employee),
            Department = compensation.Employee?.Department ?? string.Empty,
            Position = compensation.Employee?.Position ?? string.Empty,
            CompensationType = compensation.CompensationType,
            BaseAmount = compensation.BaseAmount,
            EffectiveFrom = compensation.EffectiveFrom,
            EffectiveTo = compensation.EffectiveTo,
            IsActive = compensation.IsActive,
            CreatedAtUtc = compensation.CreatedAtUtc,
            UpdatedAtUtc = compensation.UpdatedAtUtc
        };
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
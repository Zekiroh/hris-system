using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.AssetManagement.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.AssetManagement.Services;

public class AssetService : IAssetService
{
    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    private static readonly string[] AllowedAssetStatuses =
    [
        "Available",
        "In Use",
        "Maintenance",
        "Retired",
        "Lost"
    ];

    private static readonly string[] AllowedReturnConditions =
    [
        "Good",
        "Needs Repair",
        "Damaged"
    ];

    public AssetService(AppDbContext context, IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<AssetDto>> GetAllAsync()
    {
        return await _context.Assets
            .AsNoTracking()
            .Include(a => a.Assignments.Where(x => x.IsActive))
                .ThenInclude(x => x.Employee)
            .OrderBy(a => a.AssetCode)
            .Select(a => ToAssetDto(a))
            .ToListAsync();
    }

    public async Task<AssetDto> GetByIdAsync(int id)
    {
        var asset = await _context.Assets
            .AsNoTracking()
            .Include(a => a.Assignments.Where(x => x.IsActive))
                .ThenInclude(x => x.Employee)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset is null)
            throw new ApiException("Asset not found.", StatusCodes.Status404NotFound);

        return ToAssetDto(asset);
    }

    public async Task<IReadOnlyList<AssetAssignmentDto>> GetByEmployeeAsync(Guid employeeId)
    {
        var employeeExists = await _context.Employees
            .AsNoTracking()
            .AnyAsync(e => e.Id == employeeId);

        if (!employeeExists)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        return await _context.AssetAssignments
            .AsNoTracking()
            .Include(x => x.Asset)
            .Include(x => x.Employee)
            .Include(x => x.AssignedByUser)
            .Where(x => x.EmployeeId == employeeId && x.IsActive)
            .OrderByDescending(x => x.AssignedDate)
            .ThenBy(x => x.Asset.AssetCode)
            .Select(x => ToAssignmentDto(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<AssetAssignmentDto>> GetMyAssetsAsync(ClaimsPrincipal actor)
    {
        var userId = GetUserId(actor);

        if (!userId.HasValue)
            throw new ApiException("Authenticated user could not be resolved.", StatusCodes.Status401Unauthorized);

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(e => e.UserId == userId.Value);

        if (employee is null)
            throw new ApiException("Employee profile is not linked to this user.", StatusCodes.Status404NotFound);

        return await GetByEmployeeAsync(employee.Id);
    }

    public async Task<AssetDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateAssetRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var assetCode = NormalizeRequired(request.AssetCode, "Asset code is required.");
        var assetName = NormalizeRequired(request.AssetName, "Asset name is required.");
        var category = NormalizeRequired(request.Category, "Category is required.");
        var status = NormalizeStatus(request.Status ?? "Available");

        var assetCodeExists = await _context.Assets
            .AsNoTracking()
            .AnyAsync(a => a.AssetCode == assetCode);

        if (assetCodeExists)
            throw new ApiException("Asset code already exists.", StatusCodes.Status409Conflict);

        var asset = new Asset
        {
            AssetCode = assetCode,
            AssetName = assetName,
            Category = category,
            Brand = NormalizeOptional(request.Brand),
            Model = NormalizeOptional(request.Model),
            SerialNumber = NormalizeOptional(request.SerialNumber),
            PurchaseDate = request.PurchaseDate,
            Status = status,
            Notes = NormalizeOptional(request.Notes),
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Assets.Add(asset);

        AddActivityLog(
            actor,
            "ASSET_CREATED",
            "ASSET_MANAGEMENT",
            "Asset",
            null,
            $"Created asset {asset.AssetCode} - {asset.AssetName}.",
            ipAddress,
            userAgent);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            throw new ApiException("Asset code already exists.", StatusCodes.Status409Conflict);
        }

        return ToAssetDto(asset);
    }

    public async Task<AssetDto> UpdateAsync(
        ClaimsPrincipal actor,
        int id,
        UpdateAssetRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var asset = await _context.Assets
            .Include(a => a.Assignments.Where(x => x.IsActive))
                .ThenInclude(x => x.Employee)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (asset is null)
            throw new ApiException("Asset not found.", StatusCodes.Status404NotFound);

        var assetName = NormalizeRequired(request.AssetName, "Asset name is required.");
        var category = NormalizeRequired(request.Category, "Category is required.");
        var status = NormalizeStatus(request.Status);

        if (asset.Assignments.Any(x => x.IsActive) && status == "Available")
            throw new ApiException("Assigned assets cannot be marked as available until returned.");

        asset.AssetName = assetName;
        asset.Category = category;
        asset.Brand = NormalizeOptional(request.Brand);
        asset.Model = NormalizeOptional(request.Model);
        asset.SerialNumber = NormalizeOptional(request.SerialNumber);
        asset.PurchaseDate = request.PurchaseDate;
        asset.Status = status;
        asset.Notes = NormalizeOptional(request.Notes);
        asset.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "ASSET_UPDATED",
            "ASSET_MANAGEMENT",
            "Asset",
            asset.Id.ToString(),
            $"Updated asset {asset.AssetCode} - {asset.AssetName}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return ToAssetDto(asset);
    }

    public async Task<AssetAssignmentDto> AssignAsync(
        ClaimsPrincipal actor,
        int assetId,
        AssignAssetRequest request,
        string? ipAddress,
        string? userAgent)
    {
        if (request.EmployeeId == Guid.Empty)
            throw new ApiException("EmployeeId is required.", StatusCodes.Status400BadRequest);

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var asset = await _context.Assets
            .Include(a => a.Assignments.Where(x => x.IsActive))
            .FirstOrDefaultAsync(a => a.Id == assetId);

        if (asset is null)
            throw new ApiException("Asset not found.", StatusCodes.Status404NotFound);

        if (asset.Assignments.Any(x => x.IsActive))
            throw new ApiException("Asset is already assigned.");

        if (!string.Equals(asset.Status, "Available", StringComparison.OrdinalIgnoreCase))
            throw new ApiException("Only available assets can be assigned.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId);

        if (employee is null)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        if (!employee.IsActive)
            throw new ApiException("Inactive employees cannot be assigned assets.");

        var assignment = new AssetAssignment
        {
            AssetId = asset.Id,
            EmployeeId = employee.Id,
            AssignedDate = request.AssignedDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            AssignedByUserId = GetUserId(actor),
            Remarks = NormalizeOptional(request.Remarks),
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        asset.Status = "In Use";
        asset.UpdatedAtUtc = DateTime.UtcNow;

        _context.AssetAssignments.Add(assignment);

        AddActivityLog(
            actor,
            "ASSET_ASSIGNED",
            "ASSET_MANAGEMENT",
            "Asset",
            asset.Id.ToString(),
            $"Assigned asset {asset.AssetCode} - {asset.AssetName} to {FormatEmployeeName(employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        assignment.Asset = asset;
        assignment.Employee = employee;

        return ToAssignmentDto(assignment);
    }

    public async Task<AssetReturnDto> ReturnAsync(
        ClaimsPrincipal actor,
        int assetId,
        ReturnAssetRequest request,
        string? ipAddress,
        string? userAgent)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var assignment = await _context.AssetAssignments
            .Include(x => x.Asset)
            .Include(x => x.Employee)
            .Include(x => x.AssignedByUser)
            .FirstOrDefaultAsync(x => x.AssetId == assetId && x.IsActive);

        if (assignment is null)
            throw new ApiException("Active asset assignment not found.", StatusCodes.Status404NotFound);

        var existingReturn = await _context.AssetReturns
            .AsNoTracking()
            .AnyAsync(x => x.AssetAssignmentId == assignment.Id);

        if (existingReturn)
            throw new ApiException("Asset assignment has already been returned.");

        var condition = NormalizeReturnCondition(request.Condition);

        var assetReturn = new AssetReturn
        {
            AssetAssignmentId = assignment.Id,
            ReturnedDate = request.ReturnedDate ?? DateOnly.FromDateTime(DateTime.UtcNow),
            ReceivedByUserId = GetUserId(actor),
            Condition = condition,
            Remarks = NormalizeOptional(request.Remarks),
            CreatedAtUtc = DateTime.UtcNow
        };

        assignment.IsActive = false;
        assignment.UpdatedAtUtc = DateTime.UtcNow;

        assignment.Asset.Status = condition is "Needs Repair" or "Damaged"
            ? "Maintenance"
            : "Available";

        assignment.Asset.UpdatedAtUtc = DateTime.UtcNow;

        _context.AssetReturns.Add(assetReturn);

        AddActivityLog(
            actor,
            "ASSET_RETURNED",
            "ASSET_MANAGEMENT",
            "Asset",
            assignment.Asset.Id.ToString(),
            $"Returned asset {assignment.Asset.AssetCode} - {assignment.Asset.AssetName} from {FormatEmployeeName(assignment.Employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        assetReturn.AssetAssignment = assignment;

        return ToReturnDto(assetReturn);
    }

    private static AssetDto ToAssetDto(Asset asset)
    {
        var activeAssignment = asset.Assignments.FirstOrDefault(x => x.IsActive);

        return new AssetDto
        {
            Id = asset.Id,
            AssetCode = asset.AssetCode,
            AssetName = asset.AssetName,
            Category = asset.Category,
            Brand = asset.Brand,
            Model = asset.Model,
            SerialNumber = asset.SerialNumber,
            PurchaseDate = asset.PurchaseDate,
            Status = asset.Status,
            Notes = asset.Notes,
            ActiveAssignmentId = activeAssignment?.Id,
            AssignedEmployeeId = activeAssignment?.EmployeeId,
            AssignedEmployeeNumber = activeAssignment?.Employee?.EmployeeNumber,
            AssignedEmployeeName = activeAssignment?.Employee is null ? null : FormatEmployeeName(activeAssignment.Employee),
            AssignedDate = activeAssignment?.AssignedDate,
            CreatedAtUtc = asset.CreatedAtUtc,
            UpdatedAtUtc = asset.UpdatedAtUtc
        };
    }

    private static AssetAssignmentDto ToAssignmentDto(AssetAssignment assignment)
    {
        return new AssetAssignmentDto
        {
            Id = assignment.Id,
            AssetId = assignment.AssetId,
            AssetCode = assignment.Asset?.AssetCode ?? string.Empty,
            AssetName = assignment.Asset?.AssetName ?? string.Empty,
            Category = assignment.Asset?.Category ?? string.Empty,
            Brand = assignment.Asset?.Brand,
            Model = assignment.Asset?.Model,
            SerialNumber = assignment.Asset?.SerialNumber,
            EmployeeId = assignment.EmployeeId,
            EmployeeNumber = assignment.Employee?.EmployeeNumber ?? string.Empty,
            EmployeeName = assignment.Employee is null ? string.Empty : FormatEmployeeName(assignment.Employee),
            AssignedDate = assignment.AssignedDate,
            AssignedByUserId = assignment.AssignedByUserId,
            AssignedByUserName = assignment.AssignedByUser?.FullName,
            Remarks = assignment.Remarks,
            IsActive = assignment.IsActive,
            CreatedAtUtc = assignment.CreatedAtUtc,
            UpdatedAtUtc = assignment.UpdatedAtUtc
        };
    }

    private static AssetReturnDto ToReturnDto(AssetReturn assetReturn)
    {
        return new AssetReturnDto
        {
            Id = assetReturn.Id,
            AssetAssignmentId = assetReturn.AssetAssignmentId,
            AssetId = assetReturn.AssetAssignment.AssetId,
            AssetCode = assetReturn.AssetAssignment.Asset?.AssetCode ?? string.Empty,
            AssetName = assetReturn.AssetAssignment.Asset?.AssetName ?? string.Empty,
            EmployeeId = assetReturn.AssetAssignment.EmployeeId,
            EmployeeNumber = assetReturn.AssetAssignment.Employee?.EmployeeNumber ?? string.Empty,
            EmployeeName = assetReturn.AssetAssignment.Employee is null
                ? string.Empty
                : FormatEmployeeName(assetReturn.AssetAssignment.Employee),
            ReturnedDate = assetReturn.ReturnedDate,
            ReceivedByUserId = assetReturn.ReceivedByUserId,
            ReceivedByUserName = assetReturn.ReceivedByUser?.FullName,
            Condition = assetReturn.Condition,
            Remarks = assetReturn.Remarks,
            CreatedAtUtc = assetReturn.CreatedAtUtc,
            UpdatedAtUtc = assetReturn.UpdatedAtUtc
        };
    }

    private static string NormalizeStatus(string status)
    {
        var normalized = NormalizeRequired(status, "Asset status is required.");

        var match = AllowedAssetStatuses.FirstOrDefault(x =>
            string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (match is null)
            throw new ApiException("Invalid asset status.");

        return match;
    }

    private static string NormalizeReturnCondition(string condition)
    {
        var normalized = NormalizeRequired(condition, "Return condition is required.");

        var match = AllowedReturnConditions.FirstOrDefault(x =>
            string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (match is null)
            throw new ApiException("Condition must be Good, Needs Repair, or Damaged.", StatusCodes.Status400BadRequest);

        return match;
    }

    private static string NormalizeRequired(string? value, string message)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
            throw new ApiException(message);

        return normalized;
    }

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();

        return string.IsNullOrWhiteSpace(normalized)
            ? null
            : normalized;
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

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        var message = exception.InnerException?.Message ?? exception.Message;

        return message.Contains("Duplicate entry", StringComparison.OrdinalIgnoreCase)
            || message.Contains("UNIQUE", StringComparison.OrdinalIgnoreCase)
            || message.Contains("IX_Assets_AssetCode", StringComparison.OrdinalIgnoreCase);
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
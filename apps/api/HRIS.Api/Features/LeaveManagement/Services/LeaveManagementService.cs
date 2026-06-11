using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Features.LeaveManagement.DTOs;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.LeaveManagement.Services;

public class LeaveManagementService : ILeaveManagementService
{
    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    private const decimal DefaultVacationCredits = 15;
    private const decimal DefaultSickCredits = 15;
    private const decimal DefaultEmergencyCredits = 5;

    private static readonly string[] AllowedLeaveTypes = ["Vacation", "Sick", "Emergency"];

    public LeaveManagementService(AppDbContext context, IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<LeaveBalanceDto>> GetMyBalancesAsync(long userId)
    {
        var employee = await GetEmployeeByUserIdAsync(userId);
        await EnsureDefaultBalancesAsync(employee.Id);

        return await _context.LeaveBalances
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x => x.EmployeeId == employee.Id)
            .OrderBy(x => x.LeaveType)
            .Select(x => ToBalanceDto(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LeaveRequestDto>> GetMyRequestsAsync(long userId)
    {
        var employee = await GetEmployeeByUserIdAsync(userId);
        await EnsureDefaultBalancesAsync(employee.Id);

        return await _context.LeaveRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .Where(x => x.EmployeeId == employee.Id)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => ToRequestDto(x))
            .ToListAsync();
    }

    public async Task<LeaveRequestDto> CreateRequestAsync(
        long userId,
        ClaimsPrincipal actor,
        CreateLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent)
    {
        var employee = await GetEmployeeByUserIdAsync(userId);
        await EnsureDefaultBalancesAsync(employee.Id);

        var leaveType = NormalizeLeaveType(dto.LeaveType);
        ValidateDateRange(dto.StartDate, dto.EndDate);

        var daysRequested = CalculateDaysRequested(dto.StartDate, dto.EndDate);

        var balance = await GetBalanceAsync(employee.Id, leaveType);
        if (balance.RemainingCredits < daysRequested)
            throw new ApiException("Insufficient leave balance.");

        await EnsureNoOverlappingRequestAsync(employee.Id, dto.StartDate, dto.EndDate);

        var request = new LeaveRequest
        {
            EmployeeId = employee.Id,
            LeaveType = leaveType,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            DaysRequested = daysRequested,
            Reason = dto.Reason?.Trim(),
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.LeaveRequests.Add(request);
        AddActivityLog(
            actor,
            "LEAVE_REQUEST_SUBMITTED",
            "LEAVE_MANAGEMENT",
            "LeaveRequest",
            null,
            $"{FormatEmployeeName(employee)} submitted a {leaveType} leave request.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return await GetRequestDtoByIdAsync(request.Id);
    }

    public async Task<LeaveRequestDto> CancelRequestAsync(
        long userId,
        ClaimsPrincipal actor,
        int requestId,
        string? ipAddress,
        string? userAgent)
    {
        var employee = await GetEmployeeByUserIdAsync(userId);
        await EnsureDefaultBalancesAsync(employee.Id);

        var request = await _context.LeaveRequests
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .FirstOrDefaultAsync(x => x.Id == requestId && x.EmployeeId == employee.Id);

        if (request is null)
            throw new ApiException("Leave request not found.", StatusCodes.Status404NotFound);

        if (request.Status != "Pending")
            throw new ApiException("Only pending leave requests can be cancelled.");

        request.Status = "Cancelled";
        request.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "LEAVE_REQUEST_CANCELLED",
            "LEAVE_MANAGEMENT",
            "LeaveRequest",
            request.Id.ToString(),
            $"{FormatEmployeeName(employee)} cancelled a {request.LeaveType} leave request.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return ToRequestDto(request);
    }

    public async Task<IReadOnlyList<LeaveBalanceTransactionDto>> GetMyHistoryAsync(long userId)
    {
        var employee = await GetEmployeeByUserIdAsync(userId);
        await EnsureDefaultBalancesAsync(employee.Id);

        return await GetEmployeeHistoryAsync(employee.Id);
    }

    public async Task<IReadOnlyList<LeaveRequestDto>> GetAllRequestsAsync()
    {
        return await _context.LeaveRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => ToRequestDto(x))
            .ToListAsync();
    }

    public async Task<LeaveRequestDto> ApproveRequestAsync(
        long reviewerUserId,
        ClaimsPrincipal actor,
        int requestId,
        ReviewLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent)
    {
        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        var request = await _context.LeaveRequests
            .FromSqlInterpolated($@"
                SELECT *
                FROM `LeaveRequests`
                WHERE `Id` = {requestId}
                LIMIT 1
                FOR UPDATE
            ")
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .FirstOrDefaultAsync();

        if (request is null)
            throw new ApiException("Leave request not found.", StatusCodes.Status404NotFound);

        await EnsureEmployeeHasShiftAssignmentAsync(request.EmployeeId);
        await EnsureDefaultBalancesAsync(request.EmployeeId);

        if (request.Status != "Pending")
            throw new ApiException("Only pending leave requests can be approved.");

        var balance = await GetBalanceForUpdateAsync(request.EmployeeId, request.LeaveType);

        if (balance.RemainingCredits < request.DaysRequested)
            throw new ApiException("Insufficient leave balance.");

        balance.UsedCredits += request.DaysRequested;
        balance.RemainingCredits -= request.DaysRequested;
        balance.UpdatedAtUtc = DateTime.UtcNow;

        var balanceTransaction = new LeaveBalanceTransaction
        {
            EmployeeId = request.EmployeeId,
            LeaveBalance = balance,
            LeaveType = request.LeaveType,
            TransactionType = "Debit",
            Days = request.DaysRequested,
            Remarks = $"Approved leave request #{request.Id}",
            CreatedByUserId = reviewerUserId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.LeaveBalanceTransactions.Add(balanceTransaction);

        request.Status = "Approved";
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewRemarks = dto.Remarks?.Trim();
        request.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "LEAVE_REQUEST_APPROVED",
            "LEAVE_MANAGEMENT",
            "LeaveRequest",
            request.Id.ToString(),
            $"{FormatEmployeeName(request.Employee)} {request.LeaveType} leave request approved.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        return await GetRequestDtoByIdAsync(request.Id);
    }

    public async Task<LeaveRequestDto> RejectRequestAsync(
        long reviewerUserId,
        ClaimsPrincipal actor,
        int requestId,
        ReviewLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent)
    {
        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        var request = await _context.LeaveRequests
            .FromSqlInterpolated($@"
                SELECT *
                FROM `LeaveRequests`
                WHERE `Id` = {requestId}
                LIMIT 1
                FOR UPDATE
            ")
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .FirstOrDefaultAsync();

        if (request is null)
            throw new ApiException("Leave request not found.", StatusCodes.Status404NotFound);

        await EnsureEmployeeHasShiftAssignmentAsync(request.EmployeeId);
        await EnsureDefaultBalancesAsync(request.EmployeeId);

        if (request.Status != "Pending")
            throw new ApiException("Only pending leave requests can be rejected.");

        request.Status = "Rejected";
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewRemarks = dto.Remarks?.Trim();
        request.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "LEAVE_REQUEST_REJECTED",
            "LEAVE_MANAGEMENT",
            "LeaveRequest",
            request.Id.ToString(),
            $"{FormatEmployeeName(request.Employee)} {request.LeaveType} leave request rejected.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        return await GetRequestDtoByIdAsync(request.Id);
    }

    public async Task<IReadOnlyList<LeaveBalanceDto>> GetEmployeeBalancesAsync(Guid employeeId)
    {
        await EnsureEmployeeExistsAsync(employeeId);
        await EnsureEmployeeHasShiftAssignmentAsync(employeeId);
        await EnsureDefaultBalancesAsync(employeeId);

        return await _context.LeaveBalances
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x => x.EmployeeId == employeeId)
            .OrderBy(x => x.LeaveType)
            .Select(x => ToBalanceDto(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LeaveBalanceTransactionDto>> GetEmployeeHistoryAsync(Guid employeeId)
    {
        await EnsureEmployeeExistsAsync(employeeId);
        await EnsureEmployeeHasShiftAssignmentAsync(employeeId);
        await EnsureDefaultBalancesAsync(employeeId);

        return await _context.LeaveBalanceTransactions
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Where(x => x.EmployeeId == employeeId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .Select(x => ToTransactionDto(x))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<LeaveBalanceDto>> GetAllBalancesAsync()
    {
        return await _context.LeaveBalances
            .AsNoTracking()
            .Include(x => x.Employee)
            .OrderBy(x => x.Employee.LastName)
            .ThenBy(x => x.Employee.FirstName)
            .ThenBy(x => x.LeaveType)
            .Select(x => ToBalanceDto(x))
            .ToListAsync();
    }

    public async Task<LeaveBalanceDto> CreditBalanceAsync(
        long adminUserId,
        ClaimsPrincipal actor,
        CreditLeaveBalanceDto dto,
        string? ipAddress,
        string? userAgent)
    {
        var leaveType = NormalizeLeaveType(dto.LeaveType);

        await EnsureEmployeeExistsAsync(dto.EmployeeId);
        await EnsureEmployeeHasShiftAssignmentAsync(dto.EmployeeId);
        await EnsureDefaultBalancesAsync(dto.EmployeeId);

        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        var balance = await GetBalanceForUpdateAsync(dto.EmployeeId, leaveType);

        balance.TotalCredits += dto.Days;
        balance.RemainingCredits += dto.Days;
        balance.UpdatedAtUtc = DateTime.UtcNow;

        _context.LeaveBalanceTransactions.Add(new LeaveBalanceTransaction
        {
            EmployeeId = dto.EmployeeId,
            LeaveBalance = balance,
            LeaveType = leaveType,
            TransactionType = "Credit",
            Days = dto.Days,
            Remarks = dto.Remarks?.Trim(),
            CreatedByUserId = adminUserId,
            CreatedAtUtc = DateTime.UtcNow
        });

        AddActivityLog(
            actor,
            "LEAVE_BALANCE_CREDITED",
            "LEAVE_MANAGEMENT",
            "Employee",
            dto.EmployeeId.ToString(),
            $"{dto.Days} {leaveType} leave credits added.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        return await GetBalanceDtoByEmployeeAndTypeAsync(dto.EmployeeId, leaveType);
    }

    public async Task<LeaveBalanceDto> AdjustBalanceAsync(
        long adminUserId,
        ClaimsPrincipal actor,
        AdjustLeaveBalanceDto dto,
        string? ipAddress,
        string? userAgent)
    {
        var leaveType = NormalizeLeaveType(dto.LeaveType);

        await EnsureEmployeeExistsAsync(dto.EmployeeId);
        await EnsureEmployeeHasShiftAssignmentAsync(dto.EmployeeId);
        await EnsureDefaultBalancesAsync(dto.EmployeeId);

        await using var transactionScope = await _context.Database.BeginTransactionAsync();

        var balance = await GetBalanceForUpdateAsync(dto.EmployeeId, leaveType);

        balance.TotalCredits += dto.Days;
        balance.RemainingCredits += dto.Days;

        if (balance.TotalCredits < 0 || balance.RemainingCredits < 0)
            throw new ApiException("Leave balance cannot be negative.");

        balance.UpdatedAtUtc = DateTime.UtcNow;

        _context.LeaveBalanceTransactions.Add(new LeaveBalanceTransaction
        {
            EmployeeId = dto.EmployeeId,
            LeaveBalance = balance,
            LeaveType = leaveType,
            TransactionType = "Adjustment",
            Days = dto.Days,
            Remarks = dto.Remarks?.Trim(),
            CreatedByUserId = adminUserId,
            CreatedAtUtc = DateTime.UtcNow
        });

        AddActivityLog(
            actor,
            "LEAVE_BALANCE_ADJUSTED",
            "LEAVE_MANAGEMENT",
            "Employee",
            dto.EmployeeId.ToString(),
            $"{leaveType} leave balance adjusted by {dto.Days} days.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();
        await transactionScope.CommitAsync();

        return await GetBalanceDtoByEmployeeAndTypeAsync(dto.EmployeeId, leaveType);
    }

    private async Task<Employee> GetEmployeeByUserIdAsync(long userId)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId && x.IsActive);

        if (employee is null)
            throw new ApiException("Employee record is not linked to this user.", StatusCodes.Status403Forbidden);

        await EnsureEmployeeHasShiftAssignmentAsync(employee.Id);

        return employee;
    }

    private async Task EnsureEmployeeExistsAsync(Guid employeeId)
    {
        var exists = await _context.Employees.AnyAsync(x => x.Id == employeeId && x.IsActive);

        if (!exists)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);
    }

    private async Task EnsureEmployeeHasShiftAssignmentAsync(Guid employeeId)
    {
        var hasShiftAssignment = await _context.EmployeeShiftAssignments
            .AnyAsync(x => x.EmployeeId == employeeId && x.IsActive);

        if (!hasShiftAssignment)
            throw new ApiException(
                "Employee is not eligible for leave management without an assigned shift.",
                StatusCodes.Status403Forbidden);
    }

    private async Task EnsureDefaultBalancesAsync(Guid employeeId)
    {
        await EnsureEmployeeHasShiftAssignmentAsync(employeeId);

        var now = DateTime.UtcNow;

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Vacation",
            DefaultVacationCredits,
            now);

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Sick",
            DefaultSickCredits,
            now);

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Emergency",
            DefaultEmergencyCredits,
            now);
    }

    private async Task InsertDefaultBalanceIfMissingAsync(
        Guid employeeId,
        string leaveType,
        decimal defaultCredits,
        DateTime now)
    {
        await _context.Database.ExecuteSqlInterpolatedAsync($@"
            INSERT IGNORE INTO `LeaveBalances`
                (`EmployeeId`, `LeaveType`, `TotalCredits`, `UsedCredits`, `RemainingCredits`, `CreatedAtUtc`)
            SELECT
                {employeeId.ToString()}, {leaveType}, {defaultCredits}, {0m}, {defaultCredits}, {now}
            WHERE NOT EXISTS
            (
                SELECT 1
                FROM `LeaveBalances`
                WHERE `EmployeeId` = {employeeId.ToString()}
                  AND LOWER(`LeaveType`) = LOWER({leaveType})
            );
        ");
    }

    private async Task<LeaveBalance> GetBalanceAsync(Guid employeeId, string leaveType)
    {
        var balance = await _context.LeaveBalances
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.LeaveType == leaveType);

        if (balance is null)
            throw new ApiException($"{leaveType} leave balance not found.");

        return balance;
    }

    private async Task<LeaveBalance> GetBalanceForUpdateAsync(Guid employeeId, string leaveType)
    {
        var balance = await _context.LeaveBalances
            .FromSqlInterpolated($@"
                SELECT *
                FROM `LeaveBalances`
                WHERE `EmployeeId` = {employeeId.ToString()}
                  AND LOWER(`LeaveType`) = LOWER({leaveType})
                LIMIT 1
                FOR UPDATE
            ")
            .FirstOrDefaultAsync();

        if (balance is null)
            throw new ApiException($"{leaveType} leave balance not found.");

        return balance;
    }

    private async Task<LeaveBalanceDto> GetBalanceDtoByEmployeeAndTypeAsync(Guid employeeId, string leaveType)
    {
        var balance = await _context.LeaveBalances
            .AsNoTracking()
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x =>
                x.EmployeeId == employeeId &&
                x.LeaveType == leaveType);

        if (balance is null)
            throw new ApiException($"{leaveType} leave balance not found.");

        return ToBalanceDto(balance);
    }

    private async Task EnsureNoOverlappingRequestAsync(Guid employeeId, DateOnly startDate, DateOnly endDate)
    {
        var hasOverlap = await _context.LeaveRequests.AnyAsync(x =>
            x.EmployeeId == employeeId &&
            (x.Status == "Pending" || x.Status == "Approved") &&
            x.StartDate <= endDate &&
            x.EndDate >= startDate);

        if (hasOverlap)
            throw new ApiException("Leave request overlaps with an existing pending or approved request.");
    }

    private async Task<LeaveRequestDto> GetRequestDtoByIdAsync(int requestId)
    {
        var request = await _context.LeaveRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewedByUser)
            .FirstAsync(x => x.Id == requestId);

        return ToRequestDto(request);
    }

    private static string NormalizeLeaveType(string leaveType)
    {
        var normalized = leaveType.Trim();

        var match = AllowedLeaveTypes.FirstOrDefault(x =>
            string.Equals(x, normalized, StringComparison.OrdinalIgnoreCase));

        if (match is null)
            throw new ApiException("Invalid leave type.");

        return match;
    }

    private static void ValidateDateRange(DateOnly startDate, DateOnly endDate)
    {
        if (endDate < startDate)
            throw new ApiException("End date cannot be earlier than start date.");
    }

    private static decimal CalculateDaysRequested(DateOnly startDate, DateOnly endDate)
    {
        return endDate.DayNumber - startDate.DayNumber + 1;
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

    private static LeaveBalanceDto ToBalanceDto(LeaveBalance balance)
    {
        return new LeaveBalanceDto
        {
            EmployeeId = balance.EmployeeId,
            EmployeeName = balance.Employee is null ? string.Empty : FormatEmployeeName(balance.Employee),
            LeaveType = balance.LeaveType,
            TotalCredits = balance.TotalCredits,
            UsedCredits = balance.UsedCredits,
            RemainingCredits = balance.RemainingCredits
        };
    }

    private static LeaveRequestDto ToRequestDto(LeaveRequest request)
    {
        return new LeaveRequestDto
        {
            Id = request.Id,
            EmployeeId = request.EmployeeId,
            EmployeeName = FormatEmployeeName(request.Employee),
            LeaveType = request.LeaveType,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            DaysRequested = request.DaysRequested,
            Reason = request.Reason,
            Status = request.Status,
            ReviewedByUserId = request.ReviewedByUserId,
            ReviewedByName = request.ReviewedByUser?.FullName,
            ReviewRemarks = request.ReviewRemarks,
            CreatedAtUtc = request.CreatedAtUtc,
            ReviewedAtUtc = request.ReviewedAtUtc
        };
    }

    private static LeaveBalanceTransactionDto ToTransactionDto(LeaveBalanceTransaction transaction)
    {
        return new LeaveBalanceTransactionDto
        {
            Id = transaction.Id,
            LeaveType = transaction.LeaveType,
            TransactionType = transaction.TransactionType,
            Days = transaction.Days,
            Remarks = transaction.Remarks,
            CreatedByName = transaction.CreatedByUser?.FullName,
            CreatedAtUtc = transaction.CreatedAtUtc
        };
    }

    private static string FormatEmployeeName(Employee employee)
    {
        return $"{employee.FirstName} {employee.LastName}".Trim();
    }
}
using HRIS.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.LeaveManagement.Services;

public class LeaveBalanceInitializer : ILeaveBalanceInitializer
{
    private readonly AppDbContext _context;

    private const decimal DefaultVacationCredits = 15;
    private const decimal DefaultSickCredits = 15;
    private const decimal DefaultEmergencyCredits = 5;

    public LeaveBalanceInitializer(AppDbContext context)
    {
        _context = context;
    }

    public async Task EnsureDefaultBalancesAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        var hasShiftAssignment = await HasActiveShiftAssignmentAsync(
            employeeId,
            cancellationToken);

        if (!hasShiftAssignment)
            return;

        var now = DateTime.UtcNow;

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Vacation",
            DefaultVacationCredits,
            now,
            cancellationToken);

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Sick",
            DefaultSickCredits,
            now,
            cancellationToken);

        await InsertDefaultBalanceIfMissingAsync(
            employeeId,
            "Emergency",
            DefaultEmergencyCredits,
            now,
            cancellationToken);
    }

    private async Task<bool> HasActiveShiftAssignmentAsync(
        Guid employeeId,
        CancellationToken cancellationToken)
    {
        return await _context.EmployeeShiftAssignments
            .AnyAsync(
                x => x.EmployeeId == employeeId && x.IsActive,
                cancellationToken);
    }

    private async Task InsertDefaultBalanceIfMissingAsync(
        Guid employeeId,
        string leaveType,
        decimal defaultCredits,
        DateTime now,
        CancellationToken cancellationToken)
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
        ", cancellationToken);
    }
}
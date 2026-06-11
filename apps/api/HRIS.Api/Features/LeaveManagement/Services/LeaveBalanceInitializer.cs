using HRIS.Api.Data;
using HRIS.Api.Models;
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
        var existingLeaveTypes = await _context.LeaveBalances
            .Where(x => x.EmployeeId == employeeId)
            .Select(x => x.LeaveType)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        AddMissingBalance(
            employeeId,
            existingLeaveTypes,
            "Vacation",
            DefaultVacationCredits,
            now);

        AddMissingBalance(
            employeeId,
            existingLeaveTypes,
            "Sick",
            DefaultSickCredits,
            now);

        AddMissingBalance(
            employeeId,
            existingLeaveTypes,
            "Emergency",
            DefaultEmergencyCredits,
            now);

        await _context.SaveChangesAsync(cancellationToken);
    }

    private void AddMissingBalance(
        Guid employeeId,
        IReadOnlyCollection<string> existingLeaveTypes,
        string leaveType,
        decimal defaultCredits,
        DateTime now)
    {
        if (existingLeaveTypes.Contains(leaveType))
            return;

        _context.LeaveBalances.Add(new LeaveBalance
        {
            EmployeeId = employeeId,
            LeaveType = leaveType,
            TotalCredits = defaultCredits,
            UsedCredits = 0,
            RemainingCredits = defaultCredits,
            CreatedAtUtc = now
        });
    }
}
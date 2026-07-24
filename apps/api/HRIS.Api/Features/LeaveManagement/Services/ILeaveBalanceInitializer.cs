namespace HRIS.Api.Features.LeaveManagement.Services;

public interface ILeaveBalanceInitializer
{
    Task EnsureDefaultBalancesAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
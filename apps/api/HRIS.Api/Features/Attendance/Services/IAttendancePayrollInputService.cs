using HRIS.Api.Features.Attendance.DTOs;

namespace HRIS.Api.Features.Attendance.Services;

public interface IAttendancePayrollInputService
{
    Task<IReadOnlyList<PayrollAttendanceInputDto>> GetPayrollInputsAsync(
        IReadOnlyCollection<Guid> employeeIds,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken ct);
}

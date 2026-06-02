using System.Security.Claims;
using HRIS.Api.Features.Attendance.DTOs;

namespace HRIS.Api.Features.Attendance.Services;

public interface IShiftAssignmentsService
{
    Task<EmployeeShiftAssignmentDto> AssignAsync(
        ClaimsPrincipal user,
        AssignShiftRequest request,
        CancellationToken ct);

    Task<EmployeeShiftAssignmentDto?> GetCurrentAsync(Guid employeeId, CancellationToken ct);

    Task<ShiftDto?> GetCurrentUserShiftAsync(long userId, CancellationToken ct);

    Task<List<EmployeeShiftAssignmentDto>> GetByShiftAsync(int shiftId, CancellationToken ct);

    Task UnassignAsync(
        ClaimsPrincipal user,
        int assignmentId,
        CancellationToken ct);
}
using System.Security.Claims;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Models;

namespace HRIS.Api.Features.Attendance.Services;

public interface IAttendanceLogsService
{
    Task<AttendanceLog> TimeInAsync(ClaimsPrincipal user, CancellationToken ct);
    Task<AttendanceLog> TimeOutAsync(ClaimsPrincipal user, CancellationToken ct);

    Task<PagedAttendanceLogsResponse> GetLogsAsync(GetAttendanceLogsQuery query, CancellationToken ct);
    Task<PagedAttendanceLogsResponse> GetMonitoringAsync(GetAttendanceLogsQuery query, CancellationToken ct);
    Task<AttendanceSummaryDto> GetSummaryAsync(GetAttendanceLogsQuery query, CancellationToken ct);

    Task<byte[]> ExportCsvAsync(GetAttendanceLogsQuery query, CancellationToken ct);
}
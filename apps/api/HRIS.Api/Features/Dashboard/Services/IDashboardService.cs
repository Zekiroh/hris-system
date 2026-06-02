using System.Security.Claims;
using HRIS.Api.Features.Dashboard.DTOs;

namespace HRIS.Api.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<List<MonthlyAttendanceTrendDto>> GetMonthlyAttendanceTrendsAsync(
        int year,
        CancellationToken ct);

    Task<List<MyMonthlyAttendanceTrendDto>> GetMyMonthlyAttendanceTrendsAsync(
        ClaimsPrincipal user,
        int year,
        CancellationToken ct);
}
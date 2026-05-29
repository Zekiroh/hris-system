using HRIS.Api.Features.Dashboard.DTOs;

namespace HRIS.Api.Features.Dashboard.Services;

public interface IDashboardService
{
    Task<List<MonthlyAttendanceTrendDto>> GetMonthlyAttendanceTrendsAsync(
        int year,
        CancellationToken ct);
}
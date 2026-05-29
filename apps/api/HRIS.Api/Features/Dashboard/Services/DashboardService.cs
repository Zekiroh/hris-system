using HRIS.Api.Data;
using HRIS.Api.Features.Dashboard.DTOs;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Dashboard.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _db;

    public DashboardService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<MonthlyAttendanceTrendDto>> GetMonthlyAttendanceTrendsAsync(
        int year,
        CancellationToken ct)
    {
        var logs = await _db.AttendanceLogs
            .AsNoTracking()
            .Where(x => x.Date.Year == year)
            .GroupBy(x => x.Date.Month)
            .Select(g => new
            {
                Month = g.Key,
                PresentCount = g.Count(x => x.IsPresent),
                LateCount = g.Count(x => x.LateMinutes > 0),
                OvertimeCount = g.Count(x => x.OvertimeMinutes > 0),
                AbsentCount = g.Count(x => !x.IsPresent)
            })
            .ToListAsync(ct);

        var lookup = logs.ToDictionary(x => x.Month);

        return Enumerable.Range(1, 12)
            .Select(month =>
            {
                lookup.TryGetValue(month, out var item);

                return new MonthlyAttendanceTrendDto
                {
                    Month = month,
                    MonthLabel = new DateTime(year, month, 1).ToString("MMM"),
                    PresentCount = item?.PresentCount ?? 0,
                    LateCount = item?.LateCount ?? 0,
                    OvertimeCount = item?.OvertimeCount ?? 0,
                    AbsentCount = item?.AbsentCount ?? 0
                };
            })
            .ToList();
    }
}
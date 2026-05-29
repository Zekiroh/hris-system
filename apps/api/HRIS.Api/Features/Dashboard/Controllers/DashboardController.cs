using HRIS.Api.Features.Dashboard.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Dashboard.Controllers;

[ApiController]
[Route("dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboard;

    public DashboardController(IDashboardService dashboard)
    {
        _dashboard = dashboard;
    }

    [HttpGet("admin/attendance-trends")]
    public async Task<IActionResult> GetAttendanceTrends(
        [FromQuery] int year,
        CancellationToken ct)
    {
        var result = await _dashboard.GetMonthlyAttendanceTrendsAsync(year, ct);
        return Ok(result);
    }
}
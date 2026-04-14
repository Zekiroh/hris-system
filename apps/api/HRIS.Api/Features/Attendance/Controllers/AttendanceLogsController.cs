using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Attendance.Services;
using HRIS.Api.Features.IAM.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Attendance.Controllers;

[ApiController]
[Route("attendance/logs")]
public class AttendanceLogsController : ControllerBase
{
    private readonly IAttendanceLogsService _service;

    public AttendanceLogsController(IAttendanceLogsService service)
    {
        _service = service;
    }

    [HttpPost("time-in")]
    [Authorize(Roles = "USER")]
    public async Task<IActionResult> TimeIn(CancellationToken ct)
    {
        var result = await _service.TimeInAsync(User, ct);
        return Ok(result);
    }

    [HttpPost("time-out")]
    [Authorize(Roles = "USER")]
    public async Task<IActionResult> TimeOut(CancellationToken ct)
    {
        var result = await _service.TimeOutAsync(User, ct);
        return Ok(result);
    }

    [HttpGet]
    [Authorize]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetLogs([FromQuery] GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var result = await _service.GetLogsAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("monitoring")]
    [Authorize]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetMonitoring([FromQuery] GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var result = await _service.GetMonitoringAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("summary")]
    [Authorize]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetSummary([FromQuery] GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var result = await _service.GetSummaryAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("export")]
    [Authorize]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> Export([FromQuery] GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var bytes = await _service.ExportCsvAsync(query, ct);

        var fileName = $"attendance-logs-{DateTime.UtcNow:yyyyMMddHHmmss}.csv";

        return File(bytes, "text/csv", fileName);
    }
}
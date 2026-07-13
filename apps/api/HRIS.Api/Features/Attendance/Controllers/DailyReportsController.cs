using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Attendance.Services;
using HRIS.Api.Features.IAM.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Attendance.Controllers;

[ApiController]
[Route("api/daily-reports")]
[Authorize]
public class DailyReportsController : ControllerBase
{
    private readonly IDailyReportsService _service;

    public DailyReportsController(IDailyReportsService service) => _service = service;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDailyReportRequest request)
    {
        var result = await _service.CreateAsync(User, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateDailyReportRequest request)
    {
        var result = await _service.UpdateAsync(id, User, request);
        return Ok(result);
    }

    [HttpPatch("{id}/supervisor-remarks")]
    [PermissionAuthorize("ATTENDANCE", "Update")]
    public async Task<IActionResult> AddSupervisorRemarks(int id, [FromBody] SupervisorRemarksRequest request)
    {
        var result = await _service.AddSupervisorRemarksAsync(id, request);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetAll([FromQuery] GetDailyReportsQuery query)
    {
        var result = await _service.GetAllAsync(query);
        return Ok(result);
    }
}
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Attendance.Services;
using HRIS.Api.Features.IAM.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Attendance.Controllers;

[ApiController]
[Route("attendance/assignments")]
public class ShiftAssignmentsController : ControllerBase
{
    private readonly IShiftAssignmentsService _service;

    public ShiftAssignmentsController(IShiftAssignmentsService service)
    {
        _service = service;
    }

    [HttpPost]
    [PermissionAuthorize("ATTENDANCE", "Create")]
    public async Task<IActionResult> Assign([FromBody] AssignShiftRequest request, CancellationToken ct)
    {
        var result = await _service.AssignAsync(request, ct);
        return Ok(result);
    }

    [HttpGet("current/{employeeId}")]
    [PermissionAuthorize("ATTENDANCE", "View")]
    public async Task<IActionResult> GetCurrent(Guid employeeId, CancellationToken ct)
    {
        var result = await _service.GetCurrentAsync(employeeId, ct);
        return result == null ? NotFound() : Ok(result);
    }
}
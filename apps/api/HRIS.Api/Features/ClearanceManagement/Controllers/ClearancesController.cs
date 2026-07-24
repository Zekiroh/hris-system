using HRIS.Api.Features.ClearanceManagement.DTOs;
using HRIS.Api.Features.ClearanceManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.ClearanceManagement.Controllers;

[ApiController]
[Route("api/clearances")]
[Authorize]
public class ClearancesController : ControllerBase
{
    private readonly IClearanceService _clearanceService;

    public ClearancesController(IClearanceService clearanceService)
    {
        _clearanceService = clearanceService;
    }

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<ClearanceDto>>> GetAll()
    {
        var clearances = await _clearanceService.GetAllAsync();

        return Ok(clearances);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<ClearanceDto>> GetById(int id)
    {
        var clearance = await _clearanceService.GetByIdAsync(id);

        return Ok(clearance);
    }

    [HttpGet("my")]
    public async Task<ActionResult<ClearanceDto?>> GetMyClearance()
    {
        var clearance = await _clearanceService.GetMyClearanceAsync(User);

        return Ok(clearance);
    }

    [HttpGet("{id:int}/activities")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<ClearanceActivityDto>>> GetActivities(
        int id)
    {
        var activities = await _clearanceService.GetActivitiesAsync(id);

        return Ok(activities);
    }

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<ClearanceDto>> Create(
        CreateClearanceRequest request)
    {
        var clearance = await _clearanceService.CreateAsync(
            User,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return CreatedAtAction(
            nameof(GetById),
            new { id = clearance.Id },
            clearance);
    }

    [HttpPatch("{id:int}/department-approval")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<ClearanceDto>> UpdateDepartmentApproval(
        int id,
        UpdateDepartmentApprovalRequest request)
    {
        var clearance = await _clearanceService.UpdateDepartmentApprovalAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(clearance);
    }

    [HttpPatch("{id:int}/hr-approval")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<ClearanceDto>> UpdateHrApproval(
        int id,
        UpdateHrApprovalRequest request)
    {
        var clearance = await _clearanceService.UpdateHrApprovalAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(clearance);
    }

    [HttpPost("{id:int}/complete")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<ClearanceDto>> Complete(
        int id,
        CompleteClearanceRequest request)
    {
        var clearance = await _clearanceService.CompleteAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(clearance);
    }
}
using System.Security.Claims;
using HRIS.Api.Features.LeaveManagement.DTOs;
using HRIS.Api.Features.LeaveManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.LeaveManagement.Controllers;

[Authorize]
[ApiController]
[Route("api/leave")]
public class LeaveManagementController : ControllerBase
{
    private readonly ILeaveManagementService _service;

    public LeaveManagementController(ILeaveManagementService service)
    {
        _service = service;
    }

    [HttpGet("balances")]
    public async Task<IActionResult> GetMyBalances()
    {
        var userId = GetUserId();
        var result = await _service.GetMyBalancesAsync(userId);
        return Ok(result);
    }

    [HttpGet("requests")]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = GetUserId();
        var result = await _service.GetMyRequestsAsync(userId);
        return Ok(result);
    }

    [HttpPost("requests")]
    public async Task<IActionResult> CreateRequest([FromBody] CreateLeaveRequestDto dto)
    {
        var userId = GetUserId();

        var result = await _service.CreateRequestAsync(
            userId,
            User,
            dto,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [HttpPut("requests/{id:int}/cancel")]
    public async Task<IActionResult> CancelRequest(int id)
    {
        var userId = GetUserId();

        var result = await _service.CancelRequestAsync(
            userId,
            User,
            id,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetMyHistory()
    {
        var userId = GetUserId();
        var result = await _service.GetMyHistoryAsync(userId);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("admin/requests")]
    public async Task<IActionResult> GetAllRequests()
    {
        var result = await _service.GetAllRequestsAsync();
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPut("admin/requests/{id:int}/approve")]
    public async Task<IActionResult> ApproveRequest(int id, [FromBody] ReviewLeaveRequestDto dto)
    {
        var reviewerUserId = GetUserId();

        var result = await _service.ApproveRequestAsync(
            reviewerUserId,
            User,
            id,
            dto,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPut("admin/requests/{id:int}/reject")]
    public async Task<IActionResult> RejectRequest(int id, [FromBody] ReviewLeaveRequestDto dto)
    {
        var reviewerUserId = GetUserId();

        var result = await _service.RejectRequestAsync(
            reviewerUserId,
            User,
            id,
            dto,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("admin/balances")]
    public async Task<IActionResult> GetAllBalances()
    {
        var result = await _service.GetAllBalancesAsync();
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("admin/employees/{employeeId:guid}/balances")]
    public async Task<IActionResult> GetEmployeeBalances(Guid employeeId)
    {
        var result = await _service.GetEmployeeBalancesAsync(employeeId);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("admin/employees/{employeeId:guid}/history")]
    public async Task<IActionResult> GetEmployeeHistory(Guid employeeId)
    {
        var result = await _service.GetEmployeeHistoryAsync(employeeId);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("admin/balances/credit")]
    public async Task<IActionResult> CreditBalance([FromBody] CreditLeaveBalanceDto dto)
    {
        var adminUserId = GetUserId();

        var result = await _service.CreditBalanceAsync(
            adminUserId,
            User,
            dto,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("admin/balances/adjust")]
    public async Task<IActionResult> AdjustBalance([FromBody] AdjustLeaveBalanceDto dto)
    {
        var adminUserId = GetUserId();

        var result = await _service.AdjustBalanceAsync(
            adminUserId,
            User,
            dto,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    private long GetUserId()
    {
        var value =
            User.FindFirstValue("userId") ??
            User.FindFirstValue("id") ??
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue("sub");

        if (!long.TryParse(value, out var userId))
            throw new UnauthorizedAccessException();

        return userId;
    }

    private string? GetIpAddress()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private string? GetUserAgent()
    {
        return Request.Headers.UserAgent.ToString();
    }
}
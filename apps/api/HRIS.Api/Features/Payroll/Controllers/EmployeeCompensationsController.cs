using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Features.Payroll.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Payroll.Controllers;

[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
[ApiController]
[Route("api/payroll/compensations")]
public class EmployeeCompensationsController : ControllerBase
{
    private readonly IEmployeeCompensationService _service;

    public EmployeeCompensationsController(IEmployeeCompensationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("employees/{employeeId:guid}")]
    public async Task<IActionResult> GetByEmployee(Guid employeeId)
    {
        var result = await _service.GetByEmployeeAsync(employeeId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateEmployeeCompensationRequest request)
    {
        var result = await _service.CreateAsync(
            User,
            request,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeCompensationRequest request)
    {
        var result = await _service.UpdateAsync(
            User,
            id,
            request,
            GetIpAddress(),
            GetUserAgent());

        return Ok(result);
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
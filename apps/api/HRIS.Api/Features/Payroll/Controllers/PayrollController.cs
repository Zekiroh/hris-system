using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Features.Payroll.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Payroll.Controllers;

[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
[ApiController]
[Route("api/payroll")]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _service;

    public PayrollController(IPayrollService service)
    {
        _service = service;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayroll([FromBody] ProcessPayrollRequest request)
    {
        var result = await _service.ProcessPayrollAsync(request);
        return Ok(result);
    }

    [HttpGet("periods")]
    public async Task<IActionResult> GetPayrollPeriods()
    {
        var result = await _service.GetPayrollPeriodsAsync();
        return Ok(result);
    }

    [HttpGet("records/{periodId:int}")]
    public async Task<IActionResult> GetPayrollRecords(int periodId)
    {
        var result = await _service.GetPayrollRecordsAsync(periodId);
        return Ok(result);
    }

    [HttpGet("payslips/{employeeId:guid}")]
    public async Task<IActionResult> GetPayslips(Guid employeeId)
    {
        var result = await _service.GetPayslipsAsync(employeeId);
        return Ok(result);
    }
}
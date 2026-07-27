using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Features.Payroll.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Payroll.Controllers;

[ApiController]
[Route("api/payroll")]
[Authorize]
public class PayrollController : ControllerBase
{
    private readonly IPayrollService _service;

    public PayrollController(IPayrollService service)
    {
        _service = service;
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayroll(
        [FromBody] ProcessPayrollRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _service.ProcessPayrollAsync(request, cancellationToken);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpPost("periods/{id:int}/release")]
    public async Task<IActionResult> ReleasePayrollPeriod(int id)
    {
        var result = await _service.ReleasePayrollPeriodAsync(id);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("periods")]
    public async Task<IActionResult> GetPayrollPeriods()
    {
        var result = await _service.GetPayrollPeriodsAsync();
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("records/{periodId:int}")]
    public async Task<IActionResult> GetPayrollRecords(int periodId)
    {
        var result = await _service.GetPayrollRecordsAsync(periodId);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("13th-month/{year:int}")]
    public async Task<IActionResult> GetThirteenthMonthPay(int year)
    {
        var result = await _service.GetThirteenthMonthPayAsync(year);
        return Ok(result);
    }

    [Authorize(Roles = "ADMIN,SUPER_ADMIN")]
    [HttpGet("payslips/{employeeId:guid}")]
    public async Task<IActionResult> GetPayslips(Guid employeeId)
    {
        var result = await _service.GetPayslipsAsync(employeeId);
        return Ok(result);
    }

    [HttpGet("my-payslips")]
    public async Task<IActionResult> GetMyPayslips()
    {
        var result = await _service.GetMyPayslipsAsync(User);
        return Ok(result);
    }

    [HttpGet("payslips/{recordId:int}/pdf")]
    public async Task<IActionResult> DownloadPayslipPdf(int recordId)
    {
        var pdfBytes = await _service.GeneratePayslipPdfAsync(recordId, User);
        var fileName = $"payslip-{recordId}.pdf";

        return File(pdfBytes, "application/pdf", fileName);
    }
}

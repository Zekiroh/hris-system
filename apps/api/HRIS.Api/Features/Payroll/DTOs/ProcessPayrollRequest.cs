namespace HRIS.Api.Features.Payroll.DTOs;

public sealed class ProcessPayrollRequest
{
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
}
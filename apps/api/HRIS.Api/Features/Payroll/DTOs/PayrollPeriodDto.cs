namespace HRIS.Api.Features.Payroll.DTOs;

public sealed class PayrollPeriodDto
{
    public int Id { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime? ProcessedAtUtc { get; set; }
    public DateTime? ReleasedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
namespace HRIS.Api.Features.Payroll.DTOs;

public sealed class PayrollRecordItemDto
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
}
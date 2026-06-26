namespace HRIS.Api.Features.Payroll.DTOs;

public class PayrollRecordDto
{
    public int Id { get; set; }

    public int PayrollPeriodId { get; set; }

    public DateOnly PayrollPeriodStartDate { get; set; }

    public DateOnly PayrollPeriodEndDate { get; set; }

    public Guid EmployeeId { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public decimal GrossPay { get; set; }

    public decimal TotalDeductions { get; set; }

    public decimal NetPay { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? ReleasedAtUtc { get; set; }

    public List<PayrollRecordItemDto> Items { get; set; } = new();
}
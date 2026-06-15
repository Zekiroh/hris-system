using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class PayrollRecord
{
    public int Id { get; set; }

    public int PayrollPeriodId { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public decimal GrossPay { get; set; }

    public decimal TotalDeductions { get; set; }

    public decimal NetPay { get; set; }

    [Required]
    public string Status { get; set; } = "Processed";

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public PayrollPeriod PayrollPeriod { get; set; } = null!;

    public Employee Employee { get; set; } = null!;

    public ICollection<PayrollRecordItem> Items { get; set; } = new List<PayrollRecordItem>();
}
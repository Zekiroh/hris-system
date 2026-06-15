using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class PayrollPeriod
{
    public int Id { get; set; }

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    [Required]
    public string Status { get; set; } = "Draft";

    public DateTime? ProcessedAtUtc { get; set; }

    public DateTime? ReleasedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<PayrollRecord> PayrollRecords { get; set; } = new List<PayrollRecord>();
}
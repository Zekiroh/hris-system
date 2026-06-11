using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class LeaveBalance
{
    public int Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    [Required]
    [MaxLength(30)]
    public string LeaveType { get; set; } = string.Empty;

    public decimal TotalCredits { get; set; } = 0;

    public decimal UsedCredits { get; set; } = 0;

    public decimal RemainingCredits { get; set; } = 0;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<LeaveBalanceTransaction> Transactions { get; set; } =
        new List<LeaveBalanceTransaction>();
}
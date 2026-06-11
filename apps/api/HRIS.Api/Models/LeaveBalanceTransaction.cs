using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class LeaveBalanceTransaction
{
    public int Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public int? LeaveBalanceId { get; set; }

    public LeaveBalance? LeaveBalance { get; set; }

    [Required]
    [MaxLength(30)]
    public string LeaveType { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string TransactionType { get; set; } = string.Empty;

    public decimal Days { get; set; }

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public long? CreatedByUserId { get; set; }

    public User? CreatedByUser { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
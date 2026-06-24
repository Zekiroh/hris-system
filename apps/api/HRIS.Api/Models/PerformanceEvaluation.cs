using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class PerformanceEvaluation
{
    public Guid Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public long? ReviewerUserId { get; set; }

    public User? ReviewerUser { get; set; }

    [Required]
    [MaxLength(100)]
    public string ReviewPeriod { get; set; } = string.Empty;

    public decimal Score { get; set; }

    [Required]
    [MaxLength(50)]
    public string Rating { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Remarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}
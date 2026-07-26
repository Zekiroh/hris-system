using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class EmploymentStatusHistory
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }

    [MaxLength(50)]
    public string? PreviousEmploymentStatus { get; set; }

    [Required]
    [MaxLength(50)]
    public string NewEmploymentStatus { get; set; } = string.Empty;

    public bool? PreviousIsActive { get; set; }

    public bool NewIsActive { get; set; }

    public DateTime ChangedAtUtc { get; set; } = DateTime.UtcNow;

    public long? ChangedByUserId { get; set; }

    public Employee Employee { get; set; } = null!;

    public User? ChangedByUser { get; set; }
}

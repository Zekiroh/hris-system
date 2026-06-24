using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class EmployeeClearanceActivity
{
    public int Id { get; set; }

    [Required]
    public int EmployeeClearanceId { get; set; }

    public EmployeeClearance EmployeeClearance { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public long? ActorUserId { get; set; }

    public User? ActorUser { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
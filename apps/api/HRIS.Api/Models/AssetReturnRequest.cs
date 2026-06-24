using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class AssetReturnRequest
{
    public int Id { get; set; }

    [Required]
    public int AssetAssignmentId { get; set; }

    public AssetAssignment AssetAssignment { get; set; } = null!;

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateOnly RequestedDate { get; set; }

    [Required]
    [MaxLength(500)]
    public string Reason { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Pending";

    public long? ReviewedByUserId { get; set; }

    public User? ReviewedByUser { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }

    [MaxLength(500)]
    public string? ReviewRemarks { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
}
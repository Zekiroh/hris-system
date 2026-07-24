using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class AssetReturn
{
    public int Id { get; set; }

    [Required]
    public int AssetAssignmentId { get; set; }

    public AssetAssignment AssetAssignment { get; set; } = null!;

    public DateOnly ReturnedDate { get; set; }

    public long? ReceivedByUserId { get; set; }

    public User? ReceivedByUser { get; set; }

    [Required]
    [MaxLength(50)]
    public string Condition { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class Asset
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string AssetCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string AssetName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Brand { get; set; }

    [MaxLength(100)]
    public string? Model { get; set; }

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    public DateOnly? PurchaseDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string Status { get; set; } = "Available";

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<AssetAssignment> Assignments { get; set; } = new List<AssetAssignment>();
}
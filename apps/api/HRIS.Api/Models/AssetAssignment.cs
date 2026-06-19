using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class AssetAssignment
{
    public int Id { get; set; }

    [Required]
    public int AssetId { get; set; }

    public Asset Asset { get; set; } = null!;

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateOnly AssignedDate { get; set; }

    public long? AssignedByUserId { get; set; }

    public User? AssignedByUser { get; set; }

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<AssetReturn> Returns { get; set; } = new List<AssetReturn>();
}
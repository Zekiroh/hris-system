using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class EmployeeCompensation
{
    public int Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    [Required]
    public string CompensationType { get; set; } = string.Empty;

    public decimal BaseAmount { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public Employee Employee { get; set; } = null!;
}
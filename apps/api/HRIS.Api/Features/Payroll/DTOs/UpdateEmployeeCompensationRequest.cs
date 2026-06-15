using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Payroll.DTOs;

public class UpdateEmployeeCompensationRequest
{
    [Required]
    public string CompensationType { get; set; } = string.Empty;

    [Range(0.01, double.MaxValue)]
    public decimal BaseAmount { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;
}
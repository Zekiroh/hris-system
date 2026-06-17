using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class CreateSssContributionBracketRequest : IValidatableObject
{
    [Range(0, double.MaxValue)]
    public decimal SalaryFrom { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? SalaryTo { get; set; }

    [Range(0, double.MaxValue)]
    public decimal EmployeeShare { get; set; }

    [Range(0, double.MaxValue)]
    public decimal EmployerShare { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (SalaryTo is not null && SalaryTo < SalaryFrom)
        {
            yield return new ValidationResult(
                "SalaryTo must be greater than or equal to SalaryFrom.",
                [nameof(SalaryTo)]);
        }

        if (EffectiveTo is not null && EffectiveTo < EffectiveFrom)
        {
            yield return new ValidationResult(
                "EffectiveTo must be on or after EffectiveFrom.",
                [nameof(EffectiveTo)]);
        }
    }
}
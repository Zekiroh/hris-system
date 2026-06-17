using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class UpdatePagIbigContributionRuleRequest : IValidatableObject
{
    [Range(0, 1)]
    public decimal EmployeeRate { get; set; }

    [Range(0, 1)]
    public decimal EmployerRate { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MinimumContribution { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MaximumContribution { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (MaximumContribution < MinimumContribution)
        {
            yield return new ValidationResult(
                "MaximumContribution must be greater than or equal to MinimumContribution.",
                [nameof(MaximumContribution)]);
        }

        if (EffectiveTo is not null && EffectiveTo < EffectiveFrom)
        {
            yield return new ValidationResult(
                "EffectiveTo must be on or after EffectiveFrom.",
                [nameof(EffectiveTo)]);
        }
    }
}
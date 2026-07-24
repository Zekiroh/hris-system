using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class UpdateWithholdingTaxBracketRequest : IValidatableObject
{
    [Range(0, double.MaxValue)]
    public decimal CompensationFrom { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? CompensationTo { get; set; }

    [Range(0, double.MaxValue)]
    public decimal BaseTax { get; set; }

    [Range(0, double.MaxValue)]
    public decimal ExcessOver { get; set; }

    [Range(0, 1)]
    public decimal TaxRate { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (CompensationTo is not null && CompensationTo < CompensationFrom)
        {
            yield return new ValidationResult(
                "CompensationTo must be greater than or equal to CompensationFrom.",
                [nameof(CompensationTo)]);
        }

        if (EffectiveTo is not null && EffectiveTo < EffectiveFrom)
        {
            yield return new ValidationResult(
                "EffectiveTo must be on or after EffectiveFrom.",
                [nameof(EffectiveTo)]);
        }
    }
}
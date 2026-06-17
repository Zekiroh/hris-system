namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class UpdateWithholdingTaxBracketRequest
{
    public decimal CompensationFrom { get; set; }

    public decimal? CompensationTo { get; set; }

    public decimal BaseTax { get; set; }

    public decimal ExcessOver { get; set; }

    public decimal TaxRate { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; }
}
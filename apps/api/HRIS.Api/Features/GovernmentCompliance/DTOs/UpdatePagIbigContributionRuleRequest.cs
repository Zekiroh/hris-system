namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class UpdatePagIbigContributionRuleRequest
{
    public decimal EmployeeRate { get; set; }

    public decimal EmployerRate { get; set; }

    public decimal MinimumContribution { get; set; }

    public decimal MaximumContribution { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; }
}
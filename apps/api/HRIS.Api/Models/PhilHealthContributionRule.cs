namespace HRIS.Api.Models;

public sealed class PhilHealthContributionRule
{
    public int Id { get; set; }

    public decimal ContributionRate { get; set; }

    public decimal MinimumContribution { get; set; }

    public decimal MaximumContribution { get; set; }

    public decimal EmployeeSharePercent { get; set; }

    public decimal EmployerSharePercent { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;
}
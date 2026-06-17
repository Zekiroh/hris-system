namespace HRIS.Api.Models;

public sealed class PagIbigContributionRule
{
    public int Id { get; set; }

    public decimal EmployeeRate { get; set; }

    public decimal EmployerRate { get; set; }

    public decimal MinimumContribution { get; set; }

    public decimal MaximumContribution { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; } = true;
}
namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class SssContributionBracketDto
{
    public int Id { get; set; }

    public decimal SalaryFrom { get; set; }

    public decimal? SalaryTo { get; set; }

    public decimal EmployeeShare { get; set; }

    public decimal EmployerShare { get; set; }

    public DateOnly EffectiveFrom { get; set; }

    public DateOnly? EffectiveTo { get; set; }

    public bool IsActive { get; set; }
}
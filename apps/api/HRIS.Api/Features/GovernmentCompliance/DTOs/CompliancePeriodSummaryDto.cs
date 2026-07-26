namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class CompliancePeriodSummaryDto
{
    public int PayrollPeriodId { get; set; }
    public DateOnly PayrollPeriodStartDate { get; set; }
    public DateOnly PayrollPeriodEndDate { get; set; }
    public string PayrollPeriodStatus { get; set; } = string.Empty;
    public int PayrollRecordCount { get; set; }
    public decimal GrossPayTotal { get; set; }
    public decimal SssEmployeeTotal { get; set; }
    public decimal? SssEmployerTotal { get; set; }
    public decimal? SssContributionTotal { get; set; }
    public int MissingSssNumberCount { get; set; }
    public decimal PhilHealthEmployeeTotal { get; set; }
    public decimal? PhilHealthEmployerTotal { get; set; }
    public decimal? PhilHealthContributionTotal { get; set; }
    public int MissingPhilHealthNumberCount { get; set; }
    public decimal PagIbigEmployeeTotal { get; set; }
    public decimal? PagIbigEmployerTotal { get; set; }
    public decimal? PagIbigContributionTotal { get; set; }
    public int MissingPagIbigNumberCount { get; set; }
}

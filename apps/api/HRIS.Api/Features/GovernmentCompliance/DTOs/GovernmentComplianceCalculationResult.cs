namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class GovernmentComplianceCalculationResult
{
    public decimal SssEmployeeShare { get; set; }

    public decimal SssEmployerShare { get; set; }

    public decimal PhilHealthEmployeeShare { get; set; }

    public decimal PhilHealthEmployerShare { get; set; }

    public decimal PagIbigEmployeeShare { get; set; }

    public decimal PagIbigEmployerShare { get; set; }

    public decimal WithholdingTax { get; set; }

    public decimal TotalEmployeeDeductions =>
        SssEmployeeShare +
        PhilHealthEmployeeShare +
        PagIbigEmployeeShare +
        WithholdingTax;
}
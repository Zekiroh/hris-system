namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class Bir2316TrackingDto
{
    public int Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? TinNumber { get; set; }
    public int TaxYear { get; set; }
    public decimal AnnualTaxableCompensation { get; set; }
    public decimal AnnualWithholdingTax { get; set; }
    public string Status { get; set; } = string.Empty;
    public Guid? EmployeeDocumentId { get; set; }
    public string? EmployeeDocumentName { get; set; }
    public DateTime? PreparedAtUtc { get; set; }
    public DateTime? ReleasedAtUtc { get; set; }
    public DateTime? AcknowledgedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}

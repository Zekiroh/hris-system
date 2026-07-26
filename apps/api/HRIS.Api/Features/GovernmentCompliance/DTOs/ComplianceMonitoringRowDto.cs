namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class ComplianceMonitoringRowDto
{
    public int PayrollRecordId { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? GovernmentNumber { get; set; }
    public decimal GrossPay { get; set; }
    public decimal EmployeeContribution { get; set; }
    public decimal? EmployerContribution { get; set; }
    public decimal? TotalContribution { get; set; }
    public string PayrollStatus { get; set; } = string.Empty;
}

namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class ComplianceMonitoringResponseDto
{
    public CompliancePeriodSummaryDto? Summary { get; set; }
    public IReadOnlyList<ComplianceMonitoringRowDto> Items { get; set; } =
        Array.Empty<ComplianceMonitoringRowDto>();
}

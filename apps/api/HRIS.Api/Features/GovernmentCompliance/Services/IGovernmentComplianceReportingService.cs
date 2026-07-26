using HRIS.Api.Features.GovernmentCompliance.DTOs;

namespace HRIS.Api.Features.GovernmentCompliance.Services;

public interface IGovernmentComplianceReportingService
{
    Task<CompliancePeriodSummaryDto?> GetComplianceSummaryAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default);

    Task<ComplianceMonitoringResponseDto> GetSssMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default);

    Task<ComplianceMonitoringResponseDto> GetPhilHealthMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default);

    Task<ComplianceMonitoringResponseDto> GetPagIbigMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Bir2316TrackingDto>> GetBir2316TrackingsAsync(
        int taxYear,
        string? search,
        CancellationToken cancellationToken = default);

    Task<Bir2316TrackingDto?> UpdateBir2316TrackingAsync(
        int id,
        UpdateBir2316TrackingRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<EmploymentStatusHistoryDto>> GetEmploymentStatusHistoryAsync(
        Guid? employeeId,
        string? search,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        CancellationToken cancellationToken = default);
}

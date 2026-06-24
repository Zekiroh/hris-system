namespace HRIS.Api.Features.PerformanceManagement.DTOs;

public class CreatePerformanceEvaluationRequest
{
    public Guid EmployeeId { get; set; }

    public string ReviewPeriod { get; set; } = string.Empty;

    public decimal Score { get; set; }

    public string Rating { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}
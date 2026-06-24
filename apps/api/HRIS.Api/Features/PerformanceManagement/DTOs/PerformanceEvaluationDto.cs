namespace HRIS.Api.Features.PerformanceManagement.DTOs;

public class PerformanceEvaluationDto
{
    public Guid Id { get; set; }

    public Guid EmployeeId { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public long? ReviewerUserId { get; set; }

    public string? ReviewerName { get; set; }

    public string ReviewPeriod { get; set; } = string.Empty;

    public decimal Score { get; set; }

    public string Rating { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}
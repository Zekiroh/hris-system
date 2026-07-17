namespace HRIS.Api.Features.Attendance.DTOs;

public class UpdateDailyReportRequest
{
    // Section 4
    public string? KeyAccomplishments { get; set; }
    public string? BlockersIssues { get; set; }
    public string? RisksEarlyWarnings { get; set; }
    public string? PlanForTomorrow { get; set; }
    public string? SupportEscalationNeeded { get; set; }

    // Section 5
    public bool? CodeCommitted { get; set; }
    public bool? TicketsUpdated { get; set; }
    public bool? PullRequestCreated { get; set; }
    public bool? DocumentationUpdated { get; set; }
    public bool? TestsPassing { get; set; }
    public bool? ReportSubmittedOnTime { get; set; }

    // Section 6
    public string? WorkArrangementTomorrow { get; set; }
    public TimeOnly? ExpectedTimeIn { get; set; }
    public string? LeaveAbsenceNotice { get; set; }
}
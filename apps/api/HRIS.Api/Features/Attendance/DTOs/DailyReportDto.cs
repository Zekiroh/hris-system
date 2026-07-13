namespace HRIS.Api.Features.Attendance.DTOs;

public class DailyReportDto
{
    public int Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public DateOnly ReportDate { get; set; }
    public string WorkArrangement { get; set; } = string.Empty;
    public DateTime SubmissionTime { get; set; }
    public string Project { get; set; } = string.Empty;
    public string? SprintIteration { get; set; }
    public string? TeamUnit { get; set; }
    public int? SubmittedToUserId { get; set; }
    public TimeOnly? TimeIn { get; set; }
    public TimeOnly? TimeOut { get; set; }
    public int BreakDurationMinutes { get; set; }
    public bool AttendedStandup { get; set; }
    public bool ReachableViaComms { get; set; }
    public string? AvgResponseTime { get; set; }
    public string? ConnectivityIssues { get; set; }
    public string? CollaborationLog { get; set; }

    // Section 4
    public string? KeyAccomplishments { get; set; }
    public string? BlockersIssues { get; set; }
    public string? RisksEarlyWarnings { get; set; }
    public string? PlanForTomorrow { get; set; }
    public string? SupportEscalationNeeded { get; set; }

    // Section 5
    public bool CodeCommitted { get; set; }
    public bool TicketsUpdated { get; set; }
    public bool PullRequestCreated { get; set; }
    public bool DocumentationUpdated { get; set; }
    public bool TestsPassing { get; set; }
    public bool ReportSubmittedOnTime { get; set; }
    public int ChecklistCompletedCount { get; set; }

    // Section 6
    public string? WorkArrangementTomorrow { get; set; }
    public TimeOnly? ExpectedTimeIn { get; set; }
    public string? LeaveAbsenceNotice { get; set; }

    // Section 7
    public string? SupervisorNotes { get; set; }
    public string? PerformanceRating { get; set; }
    public bool FollowUpRequired { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public string? ManagerActionItems { get; set; }

    // Section 8
    public string? ReviewedBy { get; set; }
    public DateOnly? DateReviewed { get; set; }

    public List<DailyReportTaskDto> Tasks { get; set; } = new();
}

public class DailyReportTaskDto
{
    public int Id { get; set; }
    public int TaskNumber { get; set; }
    public bool IsCarryOver { get; set; }
    public string Priority { get; set; } = string.Empty;
    public string TaskType { get; set; } = string.Empty;
    public string? TicketRefNo { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Module { get; set; }
    public string Status { get; set; } = string.Empty;
    public int PercentDone { get; set; }
    public decimal EstimatedHours { get; set; }
    public decimal ActualHours { get; set; }
    public string? OutputDeliverable { get; set; }
    public string? CommitPrLink { get; set; }
    public string? BlockedByRemarks { get; set; }
}
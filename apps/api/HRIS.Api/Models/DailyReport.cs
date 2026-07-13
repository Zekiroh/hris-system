namespace HRIS.Api.Models;

public class DailyReport
{
    public int Id { get; set; }

    // Section 1 – Developer Information
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;
    public DateOnly ReportDate { get; set; }
    public string WorkArrangement { get; set; } = string.Empty; // Onsite / WFH / Hybrid
    public DateTime SubmissionTime { get; set; }
    public string Project { get; set; } = string.Empty;
    public string? SprintIteration { get; set; }
    public string? TeamUnit { get; set; }
    public int? SubmittedToUserId { get; set; }
    public User? SubmittedTo { get; set; }
    public TimeOnly? TimeIn { get; set; }
    public TimeOnly? TimeOut { get; set; }
    public int BreakDurationMinutes { get; set; } = 60;

    // Section 2 – Availability & Connectivity
    public bool AttendedStandup { get; set; }
    public bool ReachableViaComms { get; set; }
    public string? AvgResponseTime { get; set; }
    public string? ConnectivityIssues { get; set; }
    public string? CollaborationLog { get; set; }

    // Section 4 – End-of-Day Summary
    public string? KeyAccomplishments { get; set; }
    public string? BlockersIssues { get; set; }
    public string? RisksEarlyWarnings { get; set; }
    public string? PlanForTomorrow { get; set; }
    public string? SupportEscalationNeeded { get; set; }

    // Section 5 – End-of-Day Checklist
    public bool CodeCommitted { get; set; }
    public bool TicketsUpdated { get; set; }
    public bool PullRequestCreated { get; set; }
    public bool DocumentationUpdated { get; set; }
    public bool TestsPassing { get; set; }
    public bool ReportSubmittedOnTime { get; set; }

    // Section 6 – Tomorrow's Plan
    public string? WorkArrangementTomorrow { get; set; }
    public TimeOnly? ExpectedTimeIn { get; set; }
    public string? LeaveAbsenceNotice { get; set; }

    // Section 7 – Supervisor Remarks
    public string? SupervisorNotes { get; set; }
    public string? PerformanceRating { get; set; }
    public bool FollowUpRequired { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public string? ManagerActionItems { get; set; }

    // Section 8 – Acknowledgment
    public string? ReviewedBy { get; set; }
    public DateOnly? DateReviewed { get; set; }

    // Navigation
    public ICollection<DailyReportTask> Tasks { get; set; } = new List<DailyReportTask>();
}
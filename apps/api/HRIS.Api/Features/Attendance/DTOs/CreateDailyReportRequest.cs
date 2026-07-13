public class CreateDailyReportRequest
{
    // Section 1
    public DateOnly ReportDate { get; set; }
    public string WorkArrangement { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string? SprintIteration { get; set; }
    public string? TeamUnit { get; set; }
    public int? SubmittedToUserId { get; set; }
    public TimeOnly? TimeIn { get; set; }
    public TimeOnly? TimeOut { get; set; }
    public int BreakDurationMinutes { get; set; } = 60;

    // Section 2
    public bool AttendedStandup { get; set; }
    public bool ReachableViaComms { get; set; }
    public string? AvgResponseTime { get; set; }
    public string? ConnectivityIssues { get; set; }
    public string? CollaborationLog { get; set; }

    // Section 3
    public List<CreateDailyReportTaskRequest> Tasks { get; set; } = new();
}

public class CreateDailyReportTaskRequest
{
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
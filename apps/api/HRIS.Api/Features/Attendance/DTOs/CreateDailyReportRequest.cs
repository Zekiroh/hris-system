namespace HRIS.Api.Features.Attendance.DTOs;

public class CreateDailyReportRequest
{
    public DateOnly ReportDate { get; set; }
    public string WorkArrangement { get; set; } = string.Empty;
    public string Project { get; set; } = string.Empty;
    public string? SprintIteration { get; set; }
    public string? TeamUnit { get; set; }
    public long? SubmittedToUserId { get; set; }
    public TimeOnly? TimeIn { get; set; }
    public TimeOnly? TimeOut { get; set; }
    [System.ComponentModel.DataAnnotations.Range(0, 1440)]
    public int BreakDurationMinutes { get; set; } = 60;
    public bool AttendedStandup { get; set; }
    public bool ReachableViaComms { get; set; }
    public string? AvgResponseTime { get; set; }
    public string? ConnectivityIssues { get; set; }
    public string? CollaborationLog { get; set; }
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

    [System.ComponentModel.DataAnnotations.Range(0, 100)]
    public int PercentDone { get; set; }

    [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue)]
    public decimal EstimatedHours { get; set; }

    [System.ComponentModel.DataAnnotations.Range(0, double.MaxValue)]
    public decimal ActualHours { get; set; }

    public string? OutputDeliverable { get; set; }
    public string? CommitPrLink { get; set; }
    public string? BlockedByRemarks { get; set; }
}

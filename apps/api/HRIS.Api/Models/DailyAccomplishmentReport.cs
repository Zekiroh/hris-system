namespace HRIS.Api.Models;

public class DailyAccomplishmentReport
{
    public int Id { get; set; }

    // ─── Section 1: Developer Information ────────────────────────────────────
    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly Date { get; set; }
    public string WorkArrangement { get; set; } = string.Empty;  // "On-site" | "Remote" | "Hybrid"
    public TimeOnly SubmissionTime { get; set; }

    public string ProjectSystem { get; set; } = string.Empty;
    public string? SprintIteration { get; set; }
    public string? TeamUnit { get; set; }
    public string SubmittedTo { get; set; } = string.Empty;

    public TimeOnly TimeIn { get; set; }
    public TimeOnly TimeOut { get; set; }
    public int BreakDurationMinutes { get; set; } = 60;

    // Stored for record integrity even though they're computable
    public decimal GrossDurationHours { get; set; }
    public decimal NetProductiveHours { get; set; }

    // ─── Section 2: Availability & Connectivity ───────────────────────────────
    public string StandupAttended { get; set; } = string.Empty;  // "Yes" | "No" | "N/A"
    public string Reachable { get; set; } = string.Empty;        // "Yes" | "Partial" | "No"
    public string? AvgResponseTime { get; set; }
    public string? ConnectivityIssues { get; set; }
    public string? CollaborationLog { get; set; }

    // ─── Section 3: Time Breakdown ────────────────────────────────────────────
    public decimal? DevHours { get; set; }
    public decimal? MeetingHours { get; set; }
    public decimal? IdleHours { get; set; }

    // ─── Navigation ──────────────────────────────────────────────────────────
    public ICollection<DarTask> Tasks { get; set; } = new List<DarTask>();

    // ─── Audit ───────────────────────────────────────────────────────────────
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

namespace HRIS.Api.Models;

public class DailyReportTask
{
    public int Id { get; set; }
    public int DailyReportId { get; set; }
    public DailyReport DailyReport { get; set; } = null!;

    // Section 3 – Task row fields
    public int TaskNumber { get; set; }       // 1–10
    public bool IsCarryOver { get; set; }
    public string Priority { get; set; } = string.Empty;   // High / Med / Low
    public string TaskType { get; set; } = string.Empty;   // Dev / Review / Meeting / etc.
    public string? TicketRefNo { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Module { get; set; }
    public string Status { get; set; } = string.Empty;     // Done / In Progress / Blocked
    public int PercentDone { get; set; }
    public decimal EstimatedHours { get; set; }
    public decimal ActualHours { get; set; }
    public string? OutputDeliverable { get; set; }
    public string? CommitPrLink { get; set; }
    public string? BlockedByRemarks { get; set; }
}
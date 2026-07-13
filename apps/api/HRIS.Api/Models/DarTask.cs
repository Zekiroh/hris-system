namespace HRIS.Api.Models;

public class DarTask
{
    public int Id { get; set; }

    public int DailyAccomplishmentReportId { get; set; }
    public DailyAccomplishmentReport DailyAccomplishmentReport { get; set; } = null!;

    public int RowNumber { get; set; }  // preserves the order shown in the table

    // Matches the 14 columns in the frontend table exactly
    public string? CarryOver { get; set; }       // "" | "Yes" | "No"
    public string? Priority { get; set; }         // "" | "High" | "Medium" | "Low"
    public string? TaskType { get; set; }         // "" | "Development" | "Bug Fix" | "Testing" | "Review" | "Documentation" | "Meeting" | "Research"
    public string? TicketRef { get; set; }
    public string? Description { get; set; }
    public string? Module { get; set; }
    public string? Status { get; set; }           // "" | "done" | "ip" | "blocked" | "todo"
    public int? PercentDone { get; set; }
    public decimal? EstimatedHours { get; set; }
    public decimal? ActualHours { get; set; }
    public string? Output { get; set; }
    public string? CommitLink { get; set; }
    public string? Remarks { get; set; }
}

namespace HRIS.Api.Features.Attendance.DTOs;

public class SupervisorRemarksRequest
{
    // Section 7 – Supervisor Remarks
    public string? SupervisorNotes { get; set; }
    public string? PerformanceRating { get; set; }
    public bool FollowUpRequired { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public string? ManagerActionItems { get; set; }

    // Section 8 – Acknowledgment
    public string? ReviewedBy { get; set; }
    public DateOnly? DateReviewed { get; set; }
}
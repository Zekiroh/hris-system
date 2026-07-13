namespace HRIS.Api.Features.Attendance.DTOs;

public class SupervisorRemarksRequest
{
    public string? SupervisorNotes { get; set; }
    public string? PerformanceRating { get; set; }
    public bool? FollowUpRequired { get; set; }
    public DateOnly? ReviewDate { get; set; }
    public string? ManagerActionItems { get; set; }
    public string? ReviewedBy { get; set; }
    public DateOnly? DateReviewed { get; set; }
}
namespace HRIS.Api.Features.Attendance.DTOs;

public class GetDailyReportsQuery
{
    public Guid? EmployeeId { get; set; }
    public DateOnly? Date { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
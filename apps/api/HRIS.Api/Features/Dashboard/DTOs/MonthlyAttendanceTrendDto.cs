namespace HRIS.Api.Features.Dashboard.DTOs;

public class MonthlyAttendanceTrendDto
{
    public int Month { get; set; }
    public string MonthLabel { get; set; } = "";
    public int PresentCount { get; set; }
    public int LateCount { get; set; }
    public int OvertimeCount { get; set; }
    public int AbsentCount { get; set; }
}
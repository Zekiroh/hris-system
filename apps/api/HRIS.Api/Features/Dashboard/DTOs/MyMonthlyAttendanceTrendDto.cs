namespace HRIS.Api.Features.Dashboard.DTOs;

public class MyMonthlyAttendanceTrendDto
{
    public int Month { get; set; }

    public string MonthLabel { get; set; } = string.Empty;

    public int PresentCount { get; set; }

    public int LateCount { get; set; }

    public int OvertimeCount { get; set; }
}
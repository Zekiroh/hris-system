namespace HRIS.Api.Features.Attendance.DTOs;

public class AttendanceLogDto
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }
    public string EmployeeNumber { get; set; } = null!;
    public string EmployeeName { get; set; } = null!;

    public DateOnly Date { get; set; }

    public TimeOnly? TimeIn { get; set; }
    public TimeOnly? TimeOut { get; set; }

    public int LateMinutes { get; set; }
    public int UndertimeMinutes { get; set; }
    public int OvertimeMinutes { get; set; }
    public int RenderedMinutes { get; set; }

    public bool IsPresent { get; set; }
}
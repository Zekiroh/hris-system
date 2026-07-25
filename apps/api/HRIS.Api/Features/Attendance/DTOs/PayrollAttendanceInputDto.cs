namespace HRIS.Api.Features.Attendance.DTOs;

public sealed class PayrollAttendanceInputDto
{
    public Guid EmployeeId { get; set; }

    public DateOnly Date { get; set; }

    public bool IsScheduledWorkDate { get; set; }

    public bool IsPresent { get; set; }

    public bool IsAbsent { get; set; }

    public bool IsHoliday { get; set; }

    public string? HolidayName { get; set; }

    public bool IsNonRequiredDate { get; set; }

    public int LateMinutes { get; set; }

    public int UndertimeMinutes { get; set; }

    public int CreditedApprovedOvertimeMinutes { get; set; }
}

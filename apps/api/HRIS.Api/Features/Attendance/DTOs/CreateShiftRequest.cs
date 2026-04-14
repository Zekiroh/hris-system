namespace HRIS.Api.Features.Attendance.DTOs;

public class CreateShiftRequest
{
    public string Code { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int LateGraceMinutes { get; set; } = 0;

    public bool IsFlexible { get; set; } = false;
}
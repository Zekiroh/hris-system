using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Attendance.DTOs;

public class SubmitOvertimeRequest
{
    [Required]
    public int AttendanceLogId { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int RequestedMinutes { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class CreateLeaveRequestDto
{
    [Required]
    [MaxLength(30)]
    public string LeaveType { get; set; } = string.Empty;

    [Required]
    public DateOnly StartDate { get; set; }

    [Required]
    public DateOnly EndDate { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
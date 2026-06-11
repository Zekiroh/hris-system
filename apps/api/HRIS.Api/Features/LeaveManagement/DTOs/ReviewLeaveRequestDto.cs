using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class ReviewLeaveRequestDto
{
    [MaxLength(500)]
    public string? Remarks { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class AdjustLeaveBalanceDto
{
    [Required]
    public Guid EmployeeId { get; set; }

    [Required]
    [MaxLength(30)]
    public string LeaveType { get; set; } = string.Empty;

    [Range(-999, 999)]
    public decimal Days { get; set; }

    [MaxLength(500)]
    public string? Remarks { get; set; }
}
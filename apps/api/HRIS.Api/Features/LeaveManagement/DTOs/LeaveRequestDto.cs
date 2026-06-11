namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class LeaveRequestDto
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public string LeaveType { get; set; } = string.Empty;

    public DateOnly StartDate { get; set; }

    public DateOnly EndDate { get; set; }

    public decimal DaysRequested { get; set; }

    public string? Reason { get; set; }

    public string Status { get; set; } = string.Empty;

    public long? ReviewedByUserId { get; set; }

    public string? ReviewedByName { get; set; }

    public string? ReviewRemarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }
}
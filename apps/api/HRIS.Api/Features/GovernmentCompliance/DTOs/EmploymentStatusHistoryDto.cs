namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class EmploymentStatusHistoryDto
{
    public int Id { get; set; }
    public Guid EmployeeId { get; set; }
    public string EmployeeNumber { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string? PreviousEmploymentStatus { get; set; }
    public string NewEmploymentStatus { get; set; } = string.Empty;
    public bool? PreviousIsActive { get; set; }
    public bool NewIsActive { get; set; }
    public DateTime ChangedAtUtc { get; set; }
    public long? ChangedByUserId { get; set; }
    public string? ChangedByUserName { get; set; }
    public string? ChangedByUserEmail { get; set; }
}

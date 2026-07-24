namespace HRIS.Api.Features.ClearanceManagement.DTOs;

public class ClearanceDto
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public DateOnly LastWorkingDay { get; set; }

    public bool AssetRequirementCompleted { get; set; }

    public bool DepartmentApproved { get; set; }

    public bool HrApproved { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public DateTime? CompletedAtUtc { get; set; }
}
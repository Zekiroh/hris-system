namespace HRIS.Api.Features.AssetManagement.DTOs;

public class AssetReturnDto
{
    public int Id { get; set; }

    public int AssetAssignmentId { get; set; }

    public int AssetId { get; set; }

    public string AssetCode { get; set; } = string.Empty;

    public string AssetName { get; set; } = string.Empty;

    public Guid EmployeeId { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public DateOnly ReturnedDate { get; set; }

    public long? ReceivedByUserId { get; set; }

    public string? ReceivedByUserName { get; set; }

    public string Condition { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}
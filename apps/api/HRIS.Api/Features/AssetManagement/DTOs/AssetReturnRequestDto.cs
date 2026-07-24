namespace HRIS.Api.Features.AssetManagement.DTOs;

public class AssetReturnRequestDto
{
    public int Id { get; set; }

    public int AssetAssignmentId { get; set; }

    public int AssetId { get; set; }

    public string AssetCode { get; set; } = string.Empty;

    public string AssetName { get; set; } = string.Empty;

    public Guid RequestedByEmployeeId { get; set; }

    public string RequestedByEmployeeNumber { get; set; } = string.Empty;

    public string RequestedByEmployeeName { get; set; } = string.Empty;

    public DateOnly RequestedDate { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public long? ReviewedByUserId { get; set; }

    public string? ReviewedByUserName { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }

    public string? ReviewRemarks { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}
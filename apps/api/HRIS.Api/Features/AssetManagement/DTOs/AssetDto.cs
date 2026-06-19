namespace HRIS.Api.Features.AssetManagement.DTOs;

public class AssetDto
{
    public int Id { get; set; }

    public string AssetCode { get; set; } = string.Empty;

    public string AssetName { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string? Brand { get; set; }

    public string? Model { get; set; }

    public string? SerialNumber { get; set; }

    public DateOnly? PurchaseDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }

    public int? ActiveAssignmentId { get; set; }

    public Guid? AssignedEmployeeId { get; set; }

    public string? AssignedEmployeeNumber { get; set; }

    public string? AssignedEmployeeName { get; set; }

    public DateOnly? AssignedDate { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.AssetManagement.DTOs;

public class AssignAssetRequest
{
    [Required]
    public Guid EmployeeId { get; set; }

    public DateOnly? AssignedDate { get; set; }

    [MaxLength(500)]
    public string? Remarks { get; set; }
}
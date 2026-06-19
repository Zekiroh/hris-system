using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.AssetManagement.DTOs;

public class ReturnAssetRequest
{
    public DateOnly? ReturnedDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string Condition { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Remarks { get; set; }
}
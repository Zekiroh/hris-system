using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.GovernmentCompliance.DTOs;

public sealed class UpdateBir2316TrackingRequest
{
    [Required]
    [RegularExpression("^(Pending|Prepared|Released|Acknowledged)$")]
    public string Status { get; set; } = string.Empty;

    public Guid? EmployeeDocumentId { get; set; }
}

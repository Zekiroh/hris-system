namespace HRIS.Api.Features.ClearanceManagement.DTOs;

public class UpdateHrApprovalRequest
{
    public bool Approved { get; set; }

    public string? Remarks { get; set; }
}
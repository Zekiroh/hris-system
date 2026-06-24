namespace HRIS.Api.Features.ClearanceManagement.DTOs;

public class UpdateDepartmentApprovalRequest
{
    public bool Approved { get; set; }

    public string? Remarks { get; set; }
}
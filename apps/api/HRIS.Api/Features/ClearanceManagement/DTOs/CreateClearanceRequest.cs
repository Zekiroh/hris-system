namespace HRIS.Api.Features.ClearanceManagement.DTOs;

public class CreateClearanceRequest
{
    public Guid EmployeeId { get; set; }

    public DateOnly LastWorkingDay { get; set; }

    public string? Remarks { get; set; }
}
namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class LeaveBalanceDto
{
    public string LeaveType { get; set; } = string.Empty;

    public decimal TotalCredits { get; set; }

    public decimal UsedCredits { get; set; }

    public decimal RemainingCredits { get; set; }
}
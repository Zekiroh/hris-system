namespace HRIS.Api.Features.LeaveManagement.DTOs;

public class LeaveBalanceTransactionDto
{
    public int Id { get; set; }

    public string LeaveType { get; set; } = string.Empty;

    public string TransactionType { get; set; } = string.Empty;

    public decimal Days { get; set; }

    public string? Remarks { get; set; }

    public string? CreatedByName { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
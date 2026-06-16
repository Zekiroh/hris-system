using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class PayrollRecordItem
{
    public int Id { get; set; }

    public int PayrollRecordId { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public PayrollRecord PayrollRecord { get; set; } = null!;
}
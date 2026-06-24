using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class EmployeeClearance
{
    public int Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateOnly LastWorkingDay { get; set; }

    public bool DepartmentApproved { get; set; }

    public bool HrApproved { get; set; }

    [Required]
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";

    [MaxLength(500)]
    public string? Remarks { get; set; }

    public DateTime? CompletedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<EmployeeClearanceActivity> Activities { get; set; } = [];
}
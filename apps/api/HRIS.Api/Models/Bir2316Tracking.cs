using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class Bir2316Tracking
{
    public int Id { get; set; }

    public Guid EmployeeId { get; set; }

    public int TaxYear { get; set; }

    [Required]
    public string Status { get; set; } = "Pending";

    public Guid? EmployeeDocumentId { get; set; }

    public DateTime? PreparedAtUtc { get; set; }

    public DateTime? ReleasedAtUtc { get; set; }

    public DateTime? AcknowledgedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }

    public Employee Employee { get; set; } = null!;

    public EmployeeDocument? EmployeeDocument { get; set; }
}

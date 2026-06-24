using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class AnnouncementRead
{
    public Guid Id { get; set; }

    [Required]
    public Guid AnnouncementId { get; set; }

    public Announcement Announcement { get; set; } = null!;

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = null!;

    public DateTime ReadAtUtc { get; set; }
}
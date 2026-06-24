namespace HRIS.Api.Features.AnnouncementManagement.DTOs;

public class AnnouncementDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public long? CreatedByUserId { get; set; }

    public string? CreatedByUserName { get; set; }

    public DateTime? PublishedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public bool IsRead { get; set; }
}
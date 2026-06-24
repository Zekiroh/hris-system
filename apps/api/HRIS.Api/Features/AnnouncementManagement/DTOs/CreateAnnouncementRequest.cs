namespace HRIS.Api.Features.AnnouncementManagement.DTOs;

public class CreateAnnouncementRequest
{
    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;

    public bool PublishImmediately { get; set; }
}
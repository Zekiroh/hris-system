using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.AnnouncementManagement.DTOs;

public class CreateAnnouncementRequest
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(4000)]
    public string Content { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Priority { get; set; } = string.Empty;

    public bool PublishImmediately { get; set; }
}
namespace HRIS.Api.Features.ClearanceManagement.DTOs;

public class ClearanceActivityDto
{
    public int Id { get; set; }

    public string Action { get; set; } = string.Empty;

    public string? Remarks { get; set; }

    public long? ActorUserId { get; set; }

    public string? ActorUserName { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
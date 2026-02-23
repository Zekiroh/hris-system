using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class ActivityLog
{
    public int Id { get; set; }

    // Who did it
    public int ActorUserId { get; set; }

    [Required, MaxLength(255)]
    public string ActorEmail { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string ActorRole { get; set; } = string.Empty;

    // What happened
    [Required, MaxLength(100)]
    public string Action { get; set; } = string.Empty; // e.g. USER_CREATE, USER_UPDATE, PASSWORD_RESET, PERMISSION_UPDATE

    [Required, MaxLength(50)]
    public string Module { get; set; } = string.Empty; // e.g. IAM

    [MaxLength(50)]
    public string? TargetType { get; set; } // e.g. User, Permission

    [MaxLength(64)]
    public string? TargetId { get; set; } // store as string to support future GUIDs/etc.

    // Optional context (keep small + safe)
    public string? Summary { get; set; } // short human-readable message

    public string? MetadataJson { get; set; } // optional JSON blob (serialize small diffs, not full entities)

    [MaxLength(45)]
    public string? IpAddress { get; set; } // IPv4/IPv6

    [MaxLength(512)]
    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
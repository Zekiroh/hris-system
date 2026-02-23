using System.Security.Claims;
using HRIS.Api.Models;

namespace HRIS.Api.Features.IAM.Services;

public interface IActivityLogger
{
    ActivityLog? Build(
        ClaimsPrincipal user,
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary,
        string? ipAddress,
        string? userAgent
    );
}

public class ActivityLogger : IActivityLogger
{
    public ActivityLog? Build(
        ClaimsPrincipal user,
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary,
        string? ipAddress,
        string? userAgent
    )
    {
        var actorUserId = TryGetActorUserId(user);
        if (actorUserId is null) return null;

        var email =
            user.FindFirst("email")?.Value ??
            user.FindFirst(ClaimTypes.Email)?.Value ??
            "unknown";

        var role =
            user.FindFirst("role")?.Value ??
            user.FindFirst(ClaimTypes.Role)?.Value ??
            "unknown";

        return new ActivityLog
        {
            ActorUserId = actorUserId.Value,
            ActorEmail = email,
            ActorRole = role,
            Action = action,
            Module = module,
            TargetType = targetType,
            TargetId = targetId,
            Summary = summary,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };
    }

    private static int? TryGetActorUserId(ClaimsPrincipal user)
    {
        var raw =
            user.FindFirst("userId")?.Value ??
            user.FindFirst("id")?.Value ??
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            user.FindFirst("sub")?.Value;

        return int.TryParse(raw, out var id) ? id : null;
    }
}
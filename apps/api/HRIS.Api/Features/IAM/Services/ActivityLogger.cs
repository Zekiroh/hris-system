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
        string? userAgent,
        long? overrideUserId = null,
        string? overrideEmail = null,
        string? overrideRole = null
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
        string? userAgent,
        long? overrideUserId = null,
        string? overrideEmail = null,
        string? overrideRole = null
    )
    {
        var hasActorOverride = overrideUserId.HasValue;

        var actorUserId = hasActorOverride
            ? overrideUserId
            : TryGetActorUserId(user);

        if (actorUserId is null) return null;

        if (actorUserId.Value > int.MaxValue)
        {
            return null;
        }

        var email = hasActorOverride
            ? (overrideEmail ?? "system@unknown.local")
            : (user.FindFirst("email")?.Value ??
            user.FindFirst(ClaimTypes.Email)?.Value ??
            "system@unknown.local");

        var role = hasActorOverride
            ? (overrideRole ?? "SYSTEM")
            : (user.FindFirst("role")?.Value ??
            user.FindFirst(ClaimTypes.Role)?.Value ??
            "SYSTEM");

        return new ActivityLog
        {
            ActorUserId = (int)actorUserId.Value,
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

    private static long? TryGetActorUserId(ClaimsPrincipal user)
    {
        var raw =
            user.FindFirst("userId")?.Value ??
            user.FindFirst("id")?.Value ??
            user.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            user.FindFirst("sub")?.Value;

        return long.TryParse(raw, out var id) ? id : null;
    }
}
using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("admin/permissions")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN")]
public class AdminPermissionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminPermissionsController(AppDbContext db)
    {
        _db = db;
    }

    public record UpdatePermissionRequest(
        bool CanView,
        bool CanCreate,
        bool CanUpdate,
        bool CanArchive
    );

    private ActivityLog? BuildActivityLog(
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary)
    {
        var userIdClaim =
            User.FindFirst("userId")?.Value ??
            User.FindFirst("id")?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var actorUserId))
            return null;

        var emailClaim =
            User.FindFirst("email")?.Value ??
            User.FindFirst(ClaimTypes.Email)?.Value;

        var roleClaim =
            User.FindFirst("role")?.Value ??
            User.FindFirst(ClaimTypes.Role)?.Value;

        return new ActivityLog
        {
            ActorUserId = actorUserId,
            ActorEmail = emailClaim ?? "unknown",
            ActorRole = roleClaim ?? "unknown",
            Action = action,
            Module = module,
            TargetType = targetType,
            TargetId = targetId,
            Summary = summary,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = Request.Headers["User-Agent"].ToString(),
            CreatedAt = DateTime.UtcNow
        };
    }

    [PermissionAuthorize("IAM", "View")]
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var rows = await _db.Permissions
            .AsNoTracking()
            .OrderBy(p => p.RoleId)
            .ThenBy(p => p.Module)
            .Select(p => new
            {
                id = p.Id,
                roleId = p.RoleId,
                module = p.Module,
                canView = p.CanView,
                canCreate = p.CanCreate,
                canUpdate = p.CanUpdate,
                canArchive = p.CanArchive,
                updatedAt = p.UpdatedAt
            })
            .ToListAsync();

        return Ok(rows);
    }

    [PermissionAuthorize("IAM", "Update")]
    [HttpPatch("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePermissionRequest request)
    {
        var permission = await _db.Permissions.FirstOrDefaultAsync(p => p.Id == id);
        if (permission is null)
            return NotFound("Permission not found.");

        permission.CanView = request.CanView;
        permission.CanCreate = request.CanCreate;
        permission.CanUpdate = request.CanUpdate;
        permission.CanArchive = request.CanArchive;
        permission.UpdatedAt = DateTime.UtcNow;

        var log = BuildActivityLog(
            action: "PERMISSION_UPDATE",
            module: "IAM",
            targetType: "Permission",
            targetId: permission.Id.ToString(),
            summary: $"Updated permissions for RoleId={permission.RoleId}, Module={permission.Module}"
        );

        if (log is not null)
            _db.ActivityLogs.Add(log);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = permission.Id,
            roleId = permission.RoleId,
            module = permission.Module,
            canView = permission.CanView,
            canCreate = permission.CanCreate,
            canUpdate = permission.CanUpdate,
            canArchive = permission.CanArchive,
            updatedAt = permission.UpdatedAt
        });
    }
}
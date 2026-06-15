using HRIS.Api.Data;
using HRIS.Api.Features.IAM.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("activity-logs/me")]
[Authorize]
public class UserActivityLogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IActivityLogger _logger;

    public UserActivityLogsController(AppDbContext db, IActivityLogger logger)
    {
        _db = db;
        _logger = logger;
    }

    public sealed record CreateActivityLogRequest(
        string Action,
        string Module,
        string? Summary,
        string? TargetType,
        string? TargetId
    );

    [HttpPost("/activity-logs")]
    public async Task<IActionResult> Create([FromBody] CreateActivityLogRequest req)
    {
        var log = _logger.Build(
            user: User,
            action: req.Action,
            module: req.Module,
            targetType: req.TargetType,
            targetId: req.TargetId,
            summary: req.Summary,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString(),
            userAgent: Request.Headers["User-Agent"].ToString()
        );

        if (log is null)
            return BadRequest(new { message = "Could not build activity log." });

        try
        {
            _db.ActivityLogs.Add(log);
            await _db.SaveChangesAsync();
        }
        catch
        {
            // do not break user flow if audit logging fails
        }

        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        // Kunin ang current logged-in user's ID at email
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier)
                        ?? User.FindFirstValue("sub");

        var userEmail = User.FindFirstValue(ClaimTypes.Email)
                        ?? User.FindFirstValue("email");

        if (string.IsNullOrWhiteSpace(userIdStr) && string.IsNullOrWhiteSpace(userEmail))
            return Unauthorized();

        // I-filter ang logs para sa current user lang
        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(userEmail))
            query = query.Where(a => a.ActorEmail != null &&
                                     a.ActorEmail.ToLower() == userEmail.ToLower());
        else if (int.TryParse(userIdStr, out var userId))
            query = query.Where(a => a.ActorUserId == userId);

        query = query.Where(a => a.Action != "EMPLOYEE_UPDATED");

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmed = search.Trim().ToLower();
            query = query.Where(a =>
                (a.Action != null && a.Action.ToLower().Contains(trimmed)) ||
                (a.Summary != null && a.Summary.ToLower().Contains(trimmed))
            );
        }

        var totalCount = await query.CountAsync();

        var logs = await query
            .OrderByDescending(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                id = a.Id,
                actorUserId = a.ActorUserId,
                actorEmail = a.ActorEmail,
                actorRole = a.ActorRole,
                action = a.Action,
                module = a.Module,
                targetType = a.TargetType,
                targetId = a.TargetId,
                summary = a.Summary,
                createdAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            data = logs
        });
    }
}
using System.Text;
using HRIS.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("admin/activity-logs")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN")]
public class AdminActivityLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminActivityLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? module,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(module))
            query = query.Where(a => a.Module == module);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

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

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] string? module,
        [FromQuery] string? action)
    {
        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(module))
            query = query.Where(a => a.Module == module);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        var rows = await query
            .OrderByDescending(a => a.Id)
            .Take(5000) // safety cap
            .Select(a => new
            {
                a.Id,
                a.ActorUserId,
                a.ActorEmail,
                a.ActorRole,
                a.Action,
                a.Module,
                a.TargetType,
                a.TargetId,
                a.Summary,
                a.IpAddress,
                a.UserAgent,
                a.CreatedAt
            })
            .ToListAsync();

        static string Esc(string? s)
        {
            s ??= "";
            s = s.Replace("\"", "\"\"");
            return $"\"{s}\"";
        }

        var sb = new StringBuilder();
        sb.AppendLine("Id,ActorUserId,ActorEmail,ActorRole,Action,Module,TargetType,TargetId,Summary,IpAddress,UserAgent,CreatedAt");

        foreach (var r in rows)
        {
            sb.Append(r.Id).Append(',');
            sb.Append(r.ActorUserId).Append(',');
            sb.Append(Esc(r.ActorEmail)).Append(',');
            sb.Append(Esc(r.ActorRole)).Append(',');
            sb.Append(Esc(r.Action)).Append(',');
            sb.Append(Esc(r.Module)).Append(',');
            sb.Append(Esc(r.TargetType)).Append(',');
            sb.Append(Esc(r.TargetId)).Append(',');
            sb.Append(Esc(r.Summary)).Append(',');
            sb.Append(Esc(r.IpAddress)).Append(',');
            sb.Append(Esc(r.UserAgent)).Append(',');
            sb.Append(Esc(r.CreatedAt.ToString("O")));
            sb.AppendLine();
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", "activity-logs.csv");
    }
}
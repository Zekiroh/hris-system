using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.IAM.DTOs;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("admin/users")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IActivityLogger _logger;

    public AdminUsersController(AppDbContext db, IActivityLogger logger)
    {
        _db = db;
        _logger = logger;
    }

    private bool IsAdminCaller()
    {
        var role =
            User.FindFirst("role")?.Value ??
            User.FindFirst(ClaimTypes.Role)?.Value;

        return string.Equals(role, "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    private void AddAudit(string action, string? targetType, string? targetId, string? summary)
    {
        var log = _logger.Build(
            user: User,
            action: action,
            module: "IAM",
            targetType: targetType,
            targetId: targetId,
            summary: summary,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString(),
            userAgent: Request.Headers["User-Agent"].ToString()
        );

        if (log is not null)
            _db.ActivityLogs.Add(log);
    }

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var users = await _db.Users
            .AsNoTracking()
            .OrderBy(u => u.Id)
            .Select(u => new
            {
                id = u.Id,
                fullName = u.FullName,
                email = u.Email,
                roleId = u.RoleId,
                isActive = u.IsActive,
                updatedAt = u.UpdatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (request is null) return BadRequest("Request body is required.");
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("FullName is required.");
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and Password are required.");
        if (request.Password.Length < 8) return BadRequest("Password must be at least 8 characters.");

        var fullName = request.FullName.Trim();
        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var exists = await _db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
        if (exists) return Conflict("Email already exists.");

        var roleExists = await _db.Roles.AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists) return BadRequest("Invalid role.");

        var user = new User
        {
            FullName = fullName,
            Email = email,
            NormalizedEmail = normalizedEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = null
        };

        _db.Users.Add(user);

        AddAudit(
            action: "USER_CREATE",
            targetType: "User",
            targetId: user.Id.ToString(),
            summary: $"Created user {user.Email} (RoleId={user.RoleId})"
        );

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            roleId = user.RoleId,
            isActive = user.IsActive,
            updatedAt = user.UpdatedAt
        });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound("User not found.");

        // ADMIN cannot modify SUPER_ADMIN
        if (IsAdminCaller() && user.RoleId == 1) return Forbid();

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        AddAudit(
            action: "USER_STATUS_UPDATE",
            targetType: "User",
            targetId: user.Id.ToString(),
            summary: $"Set user {user.Email} IsActive={user.IsActive}"
        );

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            roleId = user.RoleId,
            isActive = user.IsActive,
            updatedAt = user.UpdatedAt
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserRequest request)
    {
        if (request is null) return BadRequest("Request body is required.");
        if (string.IsNullOrWhiteSpace(request.FullName)) return BadRequest("FullName is required.");
        if (string.IsNullOrWhiteSpace(request.Email)) return BadRequest("Email is required.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound("User not found.");

        // ADMIN cannot modify SUPER_ADMIN
        if (IsAdminCaller() && user.RoleId == 1) return Forbid();

        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var duplicate = await _db.Users.AnyAsync(u => u.Id != id && u.NormalizedEmail == normalizedEmail);
        if (duplicate) return Conflict("Email already exists.");

        var roleExists = await _db.Roles.AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists) return BadRequest("Invalid role.");

        user.FullName = request.FullName.Trim();
        user.Email = email;
        user.NormalizedEmail = normalizedEmail;
        user.RoleId = request.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

        AddAudit(
            action: "USER_UPDATE",
            targetType: "User",
            targetId: user.Id.ToString(),
            summary: $"Updated user {user.Email} (RoleId={user.RoleId})"
        );

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            roleId = user.RoleId,
            isActive = user.IsActive,
            updatedAt = user.UpdatedAt
        });
    }

    [HttpPatch("{id:int}/password")]
    public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordRequest request)
    {
        if (request is null) return BadRequest("Request body is required.");
        if (string.IsNullOrWhiteSpace(request.NewPassword)) return BadRequest("New password is required.");
        if (request.NewPassword.Length < 8) return BadRequest("Password must be at least 8 characters.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound("User not found.");

        // ADMIN cannot modify SUPER_ADMIN
        if (IsAdminCaller() && user.RoleId == 1) return Forbid();

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        AddAudit(
            action: "USER_PASSWORD_RESET",
            targetType: "User",
            targetId: user.Id.ToString(),
            summary: $"Reset password for user {user.Email}"
        );

        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            message = "Password reset successful."
        });
    }
}
using System.Data;
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
    private const int SuperAdminRoleId = 1;

    private readonly AppDbContext _db;
    private readonly IActivityLogger _logger;
    private readonly IAdminUsersService _adminUsersService;

    public AdminUsersController(
        AppDbContext db,
        IActivityLogger logger,
        IAdminUsersService adminUsersService)
    {
        _db = db;
        _logger = logger;
        _adminUsersService = adminUsersService;
    }

    private string? GetCallerRole()
    {
        return
            User.FindFirst("role")?.Value ??
            User.FindFirst(ClaimTypes.Role)?.Value;
    }

    private bool IsAdminCaller()
    {
        return string.Equals(GetCallerRole(), "ADMIN", StringComparison.OrdinalIgnoreCase);
    }

    private int? GetCallerUserId()
    {
        var raw =
            User.FindFirst("userId")?.Value ??
            User.FindFirst("id")?.Value ??
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        return int.TryParse(raw, out var id) ? id : null;
    }

    private bool IsAdminTryingToAssignSuperAdmin(int requestedRoleId)
    {
        return IsAdminCaller() && requestedRoleId == SuperAdminRoleId;
    }

    private bool IsAdminTryingToModifySuperAdmin(User targetUser)
    {
        return IsAdminCaller() && targetUser.RoleId == SuperAdminRoleId;
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
        var users = await _adminUsersService.GetAdminUsersAsync();
        return Ok(users);
    }

    [HttpGet("available-for-employee")]
    public async Task<IActionResult> GetAvailableUsersForEmployee()
    {
        var users = await _adminUsersService.GetAvailableUsersForEmployeeAsync();
        return Ok(users);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserRequest request)
    {
        if (request is null) return BadRequest("Request body is required.");
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return BadRequest("FirstName and LastName are required.");
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and Password are required.");
        if (request.Password.Length < 8)
            return BadRequest("Password must be at least 8 characters.");

        if (IsAdminTryingToAssignSuperAdmin(request.RoleId))
            return Forbid();

        var firstName = request.FirstName.Trim();
        var middleName = string.IsNullOrWhiteSpace(request.MiddleName) ? null : request.MiddleName.Trim();
        var lastName = request.LastName.Trim();

        var fullName = string.Join(" ", new[] { firstName, middleName, lastName }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var exists = await _db.Users.AnyAsync(u => u.NormalizedEmail == normalizedEmail);
        if (exists) return Conflict("Email already exists.");

        var roleExists = await _db.Roles.AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists) return BadRequest("Invalid role.");

        var user = new User
        {
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
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
        await _db.SaveChangesAsync();

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

        if (IsAdminTryingToModifySuperAdmin(user))
            return Forbid();

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
        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
            return BadRequest("FirstName and LastName are required.");
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        await using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound("User not found.");

        if (IsAdminTryingToModifySuperAdmin(user))
            return Forbid();

        if (IsAdminTryingToAssignSuperAdmin(request.RoleId))
            return Forbid();

        if (user.RoleId == SuperAdminRoleId && request.RoleId != SuperAdminRoleId)
        {
            var superAdminCount = await _db.Users.CountAsync(u => u.RoleId == SuperAdminRoleId);
            if (superAdminCount <= 1)
                return BadRequest("Cannot demote the last super admin.");
        }

        var firstName = request.FirstName.Trim();
        var middleName = string.IsNullOrWhiteSpace(request.MiddleName) ? null : request.MiddleName.Trim();
        var lastName = request.LastName.Trim();

        var fullName = string.Join(" ", new[] { firstName, middleName, lastName }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var duplicate = await _db.Users.AnyAsync(u => u.Id != id && u.NormalizedEmail == normalizedEmail);
        if (duplicate) return Conflict("Email already exists.");

        var roleExists = await _db.Roles.AnyAsync(r => r.Id == request.RoleId);
        if (!roleExists) return BadRequest("Invalid role.");

        user.FirstName = firstName;
        user.MiddleName = middleName;
        user.LastName = lastName;
        user.FullName = fullName;
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
        await tx.CommitAsync();

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
    public async Task<IActionResult> ResetPassword(int id, [FromBody] AdminResetUserPasswordRequest request)
    {
        if (request is null) return BadRequest("Request body is required.");
        if (string.IsNullOrWhiteSpace(request.NewPassword)) return BadRequest("New password is required.");
        if (request.NewPassword.Length < 8) return BadRequest("Password must be at least 8 characters.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null) return NotFound("User not found.");

        if (IsAdminTryingToModifySuperAdmin(user))
            return Forbid();

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
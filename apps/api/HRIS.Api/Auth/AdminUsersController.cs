using HRIS.Api.Data;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Auth;

[ApiController]
[Route("admin/users")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminUsersController(AppDbContext db)
    {
        _db = db;
    }

    public record CreateUserRequest(
        string FullName,
        string Email,
        string Password,
        int RoleId
    );

    public record UpdateUserStatusRequest(bool IsActive);

    public record UpdateUserRequest(
        string FullName,
        string Email,
        int RoleId
    );

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
        if (request is null)
            return BadRequest("Request body is required.");

        if (string.IsNullOrWhiteSpace(request.FullName))
            return BadRequest("FullName is required.");

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest("Email and Password are required.");

        if (request.Password.Length < 8)
            return BadRequest("Password must be at least 8 characters.");

        var fullName = request.FullName.Trim();
        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var exists = await _db.Users
            .AnyAsync(u => u.NormalizedEmail == normalizedEmail);

        if (exists)
            return Conflict("Email already exists.");

        var roleExists = await _db.Roles
            .AnyAsync(r => r.Id == request.RoleId);

        if (!roleExists)
            return BadRequest("Invalid role.");

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

        if (user is null)
            return NotFound("User not found.");

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

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
        if (request is null)
            return BadRequest("Request body is required.");

        if (string.IsNullOrWhiteSpace(request.FullName))
            return BadRequest("FullName is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest("Email is required.");

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user is null)
            return NotFound("User not found.");

        var email = request.Email.Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var duplicate = await _db.Users
            .AnyAsync(u => u.Id != id && u.NormalizedEmail == normalizedEmail);

        if (duplicate)
            return Conflict("Email already exists.");

        var roleExists = await _db.Roles
            .AnyAsync(r => r.Id == request.RoleId);

        if (!roleExists)
            return BadRequest("Invalid role.");

        user.FullName = request.FullName.Trim();
        user.Email = email;
        user.NormalizedEmail = normalizedEmail;
        user.RoleId = request.RoleId;
        user.UpdatedAt = DateTime.UtcNow;

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
}
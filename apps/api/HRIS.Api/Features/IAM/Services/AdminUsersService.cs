using HRIS.Api.Data;
using HRIS.Api.Features.IAM.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Services;

public class AdminUsersService : IAdminUsersService
{
    private readonly AppDbContext _db;

    public AdminUsersService(AppDbContext db)
    {
        _db = db;
    }

    // GET USERS
    public async Task<List<AdminUserListItemDto>> GetAdminUsersAsync()
    {
        var rawUsers = await _db.Users
            .AsNoTracking()
            .OrderBy(u => u.Id)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.RoleId,
                u.IsActive,
                u.UpdatedAt,
                LastActive = _db.ActivityLogs
                    .Where(a => (long)a.ActorUserId == u.Id)
                    .Max(a => (DateTime?)a.CreatedAt)
            })
            .ToListAsync();

        return rawUsers.Select(u => new AdminUserListItemDto
        {
            Id = u.Id,
            FullName = u.FullName,
            Email = u.Email,
            RoleId = u.RoleId,
            IsActive = u.IsActive,
            UpdatedAt = u.UpdatedAt,
            LastActive = u.LastActive.HasValue
                ? DateTime.SpecifyKind(u.LastActive.Value, DateTimeKind.Utc).ToString("o")
                : null
        }).ToList();
    }

    // CREATE USER
    public async Task<AdminUserListItemDto> CreateUserAsync(CreateUserRequest request)
    {
        var email = (request.Email ?? string.Empty).Trim();

        var firstName = (request.FirstName ?? string.Empty).Trim();
        var middleName = string.IsNullOrWhiteSpace(request.MiddleName)
            ? null
            : request.MiddleName.Trim();
        var lastName = (request.LastName ?? string.Empty).Trim();

        var user = new User
        {
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            FullName = BuildFullName(firstName, middleName, lastName),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AdminUserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleId = user.RoleId,
            IsActive = user.IsActive
        };
    }

    // UPDATE USER
    public async Task<AdminUserListItemDto?> UpdateUserAsync(long id, UpdateUserRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return null;

        var email = (request.Email ?? string.Empty).Trim();

        var firstName = (request.FirstName ?? string.Empty).Trim();
        var middleName = string.IsNullOrWhiteSpace(request.MiddleName)
            ? null
            : request.MiddleName.Trim();
        var lastName = (request.LastName ?? string.Empty).Trim();

        user.FirstName = firstName;
        user.MiddleName = middleName;
        user.LastName = lastName;
        user.FullName = BuildFullName(firstName, middleName, lastName);
        user.Email = email;
        user.NormalizedEmail = email.ToUpperInvariant();
        user.RoleId = request.RoleId;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return new AdminUserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            RoleId = user.RoleId,
            IsActive = user.IsActive,
            UpdatedAt = user.UpdatedAt
        };
    }

    // UPDATE USER STATUS
    public async Task<bool> UpdateUserStatusAsync(long id, UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return false;

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    // RESET USER PASSWORD
    public async Task<bool> ResetUserPasswordAsync(long id, string newPassword)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

    private static string BuildFullName(string firstName, string? middleName, string lastName)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(firstName))
            parts.Add(firstName.Trim());

        if (!string.IsNullOrWhiteSpace(middleName))
            parts.Add(middleName.Trim());

        if (!string.IsNullOrWhiteSpace(lastName))
            parts.Add(lastName.Trim());

        return string.Join(" ", parts);
    }
}
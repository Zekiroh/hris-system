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
            LastActive = u.LastActive
        }).ToList();
    }

    // CREATE USER
    public async Task<AdminUserListItemDto> CreateUserAsync(CreateUserRequest request)
    {
        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            IsActive = true,
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

        user.FullName = request.FullName.Trim();
        user.Email = request.Email.Trim();
        user.RoleId = request.RoleId;
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
}
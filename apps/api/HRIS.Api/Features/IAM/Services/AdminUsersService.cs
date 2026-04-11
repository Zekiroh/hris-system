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

    public async Task<List<AdminUserListItemDto>> GetAdminUsersAsync(
        string? sortBy,
        string? sortOrder,
        int? roleId,
        bool? isActive)
    {
        var normalizedSortBy = string.IsNullOrWhiteSpace(sortBy)
            ? "createdAt"
            : sortBy.Trim().ToLowerInvariant();

        var normalizedSortOrder = string.IsNullOrWhiteSpace(sortOrder)
            ? "desc"
            : sortOrder.Trim().ToLowerInvariant();

        var query = _db.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.FirstName,
                u.MiddleName,
                u.LastName,
                u.Suffix,
                u.Email,
                u.RoleId,
                RoleName = u.Role.Name,
                u.IsActive,
                u.UpdatedAt,
                u.CreatedAt,
                HasEmployee = _db.Employees.Any(e => e.UserId == u.Id),
                LastActive = _db.ActivityLogs
                    .Where(a => (long)a.ActorUserId == u.Id)
                    .Max(a => (DateTime?)a.CreatedAt)
            });

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        query = (normalizedSortBy, normalizedSortOrder) switch
        {
            ("createdat", "asc") => query.OrderBy(u => u.CreatedAt),
            ("createdat", "desc") => query.OrderByDescending(u => u.CreatedAt),
            _ => query.OrderByDescending(u => u.CreatedAt)
        };

        var rawUsers = await query.ToListAsync();

        return rawUsers.Select(u => new AdminUserListItemDto
        {
            Id = u.Id,
            FullName = u.FullName,
            FirstName = u.FirstName,
            MiddleName = u.MiddleName,
            LastName = u.LastName,
            Suffix = u.Suffix,
            Email = u.Email,
            RoleId = u.RoleId,
            RoleName = u.RoleName,
            IsActive = u.IsActive,
            HasEmployee = u.HasEmployee,
            UpdatedAt = u.UpdatedAt,
            LastActive = u.LastActive.HasValue
                ? DateTime.SpecifyKind(u.LastActive.Value, DateTimeKind.Utc).ToString("o")
                : null
        }).ToList();
    }

    public async Task<List<AdminUserListItemDto>> GetAvailableUsersForEmployeeAsync()
    {
        return await _db.Users
            .AsNoTracking()
            .Include(u => u.Role)
            .Where(u =>
                u.Role.Name == "User" &&
                u.IsActive &&
                !_db.Employees.Any(e => e.UserId == u.Id)
            )
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserListItemDto
            {
                Id = u.Id,
                FullName = u.FullName,
                FirstName = u.FirstName,
                MiddleName = u.MiddleName,
                LastName = u.LastName,
                Suffix = u.Suffix,
                Email = u.Email,
                RoleId = u.RoleId,
                RoleName = u.Role.Name,
                IsActive = u.IsActive,
                HasEmployee = false,
                UpdatedAt = u.UpdatedAt,
                LastActive = null
            })
            .ToListAsync();
    }

    public async Task<AdminUserListItemDto> CreateUserAsync(CreateUserRequest request)
    {
        var email = (request.Email ?? string.Empty).Trim();

        var firstName = (request.FirstName ?? string.Empty).Trim();
        var middleName = string.IsNullOrWhiteSpace(request.MiddleName)
            ? null
            : request.MiddleName.Trim();
        var lastName = (request.LastName ?? string.Empty).Trim();
        var suffix = string.IsNullOrWhiteSpace(request.Suffix)
            ? null
            : request.Suffix.Trim();

        var user = new User
        {
            FirstName = firstName,
            MiddleName = middleName,
            LastName = lastName,
            Suffix = suffix,
            FullName = BuildFullName(firstName, middleName, lastName, suffix),
            Email = email,
            NormalizedEmail = email.ToUpperInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            RoleId = request.RoleId,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var roleName = await _db.Roles
            .Where(r => r.Id == user.RoleId)
            .Select(r => r.Name)
            .FirstOrDefaultAsync() ?? string.Empty;

        return new AdminUserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            Suffix = user.Suffix,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = roleName,
            IsActive = user.IsActive,
            HasEmployee = false
        };
    }

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
        var suffix = string.IsNullOrWhiteSpace(request.Suffix)
            ? null
            : request.Suffix.Trim();

        user.FirstName = firstName;
        user.MiddleName = middleName;
        user.LastName = lastName;
        user.Suffix = suffix;
        user.FullName = BuildFullName(firstName, middleName, lastName, suffix);
        user.Email = email;
        user.NormalizedEmail = email.ToUpperInvariant();
        user.RoleId = request.RoleId;
        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var roleName = await _db.Roles
            .Where(r => r.Id == user.RoleId)
            .Select(r => r.Name)
            .FirstOrDefaultAsync() ?? string.Empty;

        var hasEmployee = await _db.Employees.AnyAsync(e => e.UserId == user.Id);

        return new AdminUserListItemDto
        {
            Id = user.Id,
            FullName = user.FullName,
            FirstName = user.FirstName,
            MiddleName = user.MiddleName,
            LastName = user.LastName,
            Suffix = user.Suffix,
            Email = user.Email,
            RoleId = user.RoleId,
            RoleName = roleName,
            IsActive = user.IsActive,
            HasEmployee = hasEmployee,
            UpdatedAt = user.UpdatedAt
        };
    }

    public async Task<bool> UpdateUserStatusAsync(long id, UpdateUserStatusRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return false;

        user.IsActive = request.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return true;
    }

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

    private static string BuildFullName(string firstName, string? middleName, string lastName, string? suffix)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(firstName))
            parts.Add(firstName.Trim());

        if (!string.IsNullOrWhiteSpace(middleName))
            parts.Add(middleName.Trim());

        if (!string.IsNullOrWhiteSpace(lastName))
            parts.Add(lastName.Trim());

        if (!string.IsNullOrWhiteSpace(suffix))
            parts.Add(suffix.Trim());

        return string.Join(" ", parts);
    }
}
using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.AnnouncementManagement.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.AnnouncementManagement.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public AnnouncementService(
        AppDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<AnnouncementDto>> GetAllAsync()
    {
        var announcements = await _context.Announcements
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        return announcements.Select(ToDto).ToList();
    }

    public async Task<IReadOnlyList<AnnouncementDto>> GetPublishedAsync(
        ClaimsPrincipal actor)
    {
        var employeeId = await GetEmployeeIdAsync(actor);

        var announcements = await _context.Announcements
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .Where(x => x.Status == "Published")
            .OrderByDescending(x => x.PublishedAtUtc)
            .ToListAsync();

        var readAnnouncementIds = employeeId.HasValue
            ? await _context.AnnouncementReads
                .AsNoTracking()
                .Where(x => x.EmployeeId == employeeId.Value)
                .Select(x => x.AnnouncementId)
                .ToListAsync()
            : [];

        return announcements
            .Select(x =>
            {
                var dto = ToDto(x);
                dto.IsRead = readAnnouncementIds.Contains(x.Id);
                return dto;
            })
            .ToList();
    }

    public async Task<AnnouncementDto> GetByIdAsync(Guid id)
    {
        var announcement = await _context.Announcements
            .AsNoTracking()
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (announcement is null)
        {
            throw new ApiException(
                "Announcement not found.",
                StatusCodes.Status404NotFound);
        }

        return ToDto(announcement);
    }

    public async Task<AnnouncementDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateAnnouncementRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var title = NormalizeRequired(
            request.Title,
            200,
            "Title is required.",
            "Title cannot exceed 200 characters.");

        var content = NormalizeRequired(
            request.Content,
            4000,
            "Content is required.",
            "Content cannot exceed 4000 characters.");

        var priority = NormalizeRequired(
            request.Priority,
            50,
            "Priority is required.",
            "Priority cannot exceed 50 characters.");

        var now = DateTime.UtcNow;

        var announcement = new Announcement
        {
            Id = Guid.NewGuid(),
            Title = title,
            Content = content,
            Priority = priority,
            Status = request.PublishImmediately
                ? "Published"
                : "Draft",
            CreatedByUserId = GetUserId(actor),
            PublishedAtUtc = request.PublishImmediately
                ? now
                : null,
            CreatedAtUtc = now
        };

        _context.Announcements.Add(announcement);

        AddActivityLog(
            actor,
            "ANNOUNCEMENT_CREATED",
            "ANNOUNCEMENT_MANAGEMENT",
            "Announcement",
            announcement.Id.ToString(),
            $"Created announcement '{announcement.Title}'.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        announcement.CreatedByUser = announcement.CreatedByUserId.HasValue
            ? await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == announcement.CreatedByUserId.Value)
            : null;

        return ToDto(announcement);
    }

    public async Task<AnnouncementDto> PublishAsync(
        ClaimsPrincipal actor,
        Guid id,
        string? ipAddress,
        string? userAgent)
    {
        var announcement = await _context.Announcements
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (announcement is null)
        {
            throw new ApiException(
                "Announcement not found.",
                StatusCodes.Status404NotFound);
        }

        announcement.Status = "Published";

        if (!announcement.PublishedAtUtc.HasValue)
        {
            announcement.PublishedAtUtc = DateTime.UtcNow;
        }

        announcement.UpdatedAtUtc = DateTime.UtcNow;

        AddActivityLog(
            actor,
            "ANNOUNCEMENT_PUBLISHED",
            "ANNOUNCEMENT_MANAGEMENT",
            "Announcement",
            announcement.Id.ToString(),
            $"Published announcement '{announcement.Title}'.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        return ToDto(announcement);
    }

    public async Task<AnnouncementDto> MarkAsReadAsync(
        ClaimsPrincipal actor,
        Guid id,
        string? ipAddress,
        string? userAgent)
    {
        var announcement = await _context.Announcements
            .Include(x => x.CreatedByUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (announcement is null)
        {
            throw new ApiException(
                "Announcement not found.",
                StatusCodes.Status404NotFound);
        }

        if (announcement.Status != "Published")
        {
            throw new ApiException(
                "Announcement not found.",
                StatusCodes.Status404NotFound);
        }

        var employeeId = await GetEmployeeIdAsync(actor);

        if (!employeeId.HasValue)
        {
            throw new ApiException(
                "Employee profile not found.",
                StatusCodes.Status400BadRequest);
        }

        var alreadyRead = await _context.AnnouncementReads
            .AnyAsync(x =>
                x.AnnouncementId == id &&
                x.EmployeeId == employeeId.Value);

        if (!alreadyRead)
        {
            _context.AnnouncementReads.Add(new AnnouncementRead
            {
                Id = Guid.NewGuid(),
                AnnouncementId = id,
                EmployeeId = employeeId.Value,
                ReadAtUtc = DateTime.UtcNow
            });

            AddActivityLog(
                actor,
                "ANNOUNCEMENT_READ",
                "ANNOUNCEMENT_MANAGEMENT",
                "Announcement",
                announcement.Id.ToString(),
                $"Read announcement '{announcement.Title}'.",
                ipAddress,
                userAgent);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                _context.ChangeTracker.Clear();
            }
        }

        var dto = ToDto(announcement);
        dto.IsRead = true;

        return dto;
    }

    private AnnouncementDto ToDto(Announcement announcement)
    {
        return new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            Priority = announcement.Priority,
            Status = announcement.Status,
            CreatedByUserId = announcement.CreatedByUserId,
            CreatedByUserName = announcement.CreatedByUser?.FullName,
            PublishedAtUtc = announcement.PublishedAtUtc,
            CreatedAtUtc = announcement.CreatedAtUtc,
            UpdatedAtUtc = announcement.UpdatedAtUtc
        };
    }

    private async Task<Guid?> GetEmployeeIdAsync(
        ClaimsPrincipal actor)
    {
        var userId = GetUserId(actor);

        if (!userId.HasValue)
        {
            return null;
        }

        return await _context.Employees
            .Where(x => x.UserId == userId.Value)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync();
    }

    private void AddActivityLog(
        ClaimsPrincipal actor,
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary,
        string? ipAddress,
        string? userAgent)
    {
        var log = _activityLogger.Build(
            actor,
            action,
            module,
            targetType,
            targetId,
            summary,
            ipAddress,
            userAgent);

        if (log is not null)
        {
            _context.ActivityLogs.Add(log);
        }
    }

    private static long? GetUserId(ClaimsPrincipal actor)
    {
        var value =
            actor.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? actor.FindFirstValue("sub")
            ?? actor.FindFirstValue("userId")
            ?? actor.FindFirstValue("id");

        return long.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private static string NormalizeRequired(
        string? value,
        int maxLength,
        string requiredMessage,
        string tooLongMessage)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(
                requiredMessage,
                StatusCodes.Status400BadRequest);
        }

        if (normalized.Length > maxLength)
        {
            throw new ApiException(
                tooLongMessage,
                StatusCodes.Status400BadRequest);
        }

        return normalized;
    }
}
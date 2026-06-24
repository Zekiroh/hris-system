using System.Security.Claims;
using HRIS.Api.Features.AnnouncementManagement.DTOs;

namespace HRIS.Api.Features.AnnouncementManagement.Services;

public interface IAnnouncementService
{
    Task<IReadOnlyList<AnnouncementDto>> GetAllAsync();

    Task<IReadOnlyList<AnnouncementDto>> GetPublishedAsync(ClaimsPrincipal actor);

    Task<AnnouncementDto> GetByIdAsync(Guid id);

    Task<AnnouncementDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateAnnouncementRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AnnouncementDto> PublishAsync(
        ClaimsPrincipal actor,
        Guid id,
        string? ipAddress,
        string? userAgent);

    Task<AnnouncementDto> MarkAsReadAsync(
        ClaimsPrincipal actor,
        Guid id,
        string? ipAddress,
        string? userAgent);
}
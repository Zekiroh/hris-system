using HRIS.Api.Features.AnnouncementManagement.DTOs;
using HRIS.Api.Features.AnnouncementManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.AnnouncementManagement.Controllers;

[ApiController]
[Route("api/announcements")]
[Authorize]
public class AnnouncementsController : ControllerBase
{
    private readonly IAnnouncementService _service;

    public AnnouncementsController(IAnnouncementService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<AnnouncementDto>>> GetAll()
    {
        var announcements = await _service.GetAllAsync();

        return Ok(announcements);
    }

    [HttpGet("published")]
    public async Task<ActionResult<IReadOnlyList<AnnouncementDto>>> GetPublished()
    {
        var announcements = await _service.GetPublishedAsync(User);

        return Ok(announcements);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AnnouncementDto>> GetById(Guid id)
    {
        var announcement = await _service.GetByIdAsync(id);

        return Ok(announcement);
    }

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AnnouncementDto>> Create(CreateAnnouncementRequest request)
    {
        var announcement = await _service.CreateAsync(
            User,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return CreatedAtAction(nameof(GetById), new { id = announcement.Id }, announcement);
    }

    [HttpPatch("{id:guid}/publish")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AnnouncementDto>> Publish(Guid id)
    {
        var announcement = await _service.PublishAsync(
            User,
            id,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(announcement);
    }

    [HttpPost("{id:guid}/read")]
    public async Task<ActionResult<AnnouncementDto>> MarkAsRead(Guid id)
    {
        var announcement = await _service.MarkAsReadAsync(
            User,
            id,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(announcement);
    }
}
using HRIS.Api.Features.PerformanceManagement.DTOs;
using HRIS.Api.Features.PerformanceManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.PerformanceManagement.Controllers;

[ApiController]
[Route("api/performance-evaluations")]
[Authorize]
public class PerformanceEvaluationsController : ControllerBase
{
    private readonly IPerformanceEvaluationService _service;

    public PerformanceEvaluationsController(IPerformanceEvaluationService service)
    {
        _service = service;
    }

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<PerformanceEvaluationDto>>> GetAll()
    {
        var evaluations = await _service.GetAllAsync();

        return Ok(evaluations);
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<PerformanceEvaluationDto>> GetById(Guid id)
    {
        var evaluation = await _service.GetByIdAsync(id);

        return Ok(evaluation);
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<PerformanceEvaluationDto>>> GetMyEvaluations()
    {
        var evaluations = await _service.GetMyEvaluationsAsync(User);

        return Ok(evaluations);
    }

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<PerformanceEvaluationDto>> Create(
        CreatePerformanceEvaluationRequest request)
    {
        var evaluation = await _service.CreateAsync(
            User,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return CreatedAtAction(nameof(GetById), new { id = evaluation.Id }, evaluation);
    }
}
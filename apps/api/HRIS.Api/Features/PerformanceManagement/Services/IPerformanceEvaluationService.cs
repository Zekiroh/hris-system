using System.Security.Claims;
using HRIS.Api.Features.PerformanceManagement.DTOs;

namespace HRIS.Api.Features.PerformanceManagement.Services;

public interface IPerformanceEvaluationService
{
    Task<IReadOnlyList<PerformanceEvaluationDto>> GetAllAsync();

    Task<PerformanceEvaluationDto> GetByIdAsync(Guid id);

    Task<IReadOnlyList<PerformanceEvaluationDto>> GetMyEvaluationsAsync(
        ClaimsPrincipal actor);

    Task<PerformanceEvaluationDto> CreateAsync(
        ClaimsPrincipal actor,
        CreatePerformanceEvaluationRequest request,
        string? ipAddress,
        string? userAgent);
}
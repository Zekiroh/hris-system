using System.Security.Claims;
using HRIS.Api.Features.ClearanceManagement.DTOs;

namespace HRIS.Api.Features.ClearanceManagement.Services;

public interface IClearanceService
{
    Task<IReadOnlyList<ClearanceDto>> GetAllAsync();

    Task<ClearanceDto> GetByIdAsync(int id);

    Task<ClearanceDto?> GetMyClearanceAsync(ClaimsPrincipal actor);

    Task<ClearanceDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateClearanceRequest request,
        string? ipAddress,
        string? userAgent);

    Task<ClearanceDto> UpdateDepartmentApprovalAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        UpdateDepartmentApprovalRequest request,
        string? ipAddress,
        string? userAgent);

    Task<ClearanceDto> UpdateHrApprovalAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        UpdateHrApprovalRequest request,
        string? ipAddress,
        string? userAgent);

    Task<ClearanceDto> CompleteAsync(
        ClaimsPrincipal actor,
        int clearanceId,
        CompleteClearanceRequest request,
        string? ipAddress,
        string? userAgent);

    Task<IReadOnlyList<ClearanceActivityDto>> GetActivitiesAsync(int clearanceId);
}
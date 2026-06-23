using System.Security.Claims;
using HRIS.Api.Features.AssetManagement.DTOs;

namespace HRIS.Api.Features.AssetManagement.Services;

public interface IAssetService
{
    Task<IReadOnlyList<AssetDto>> GetAllAsync();

    Task<AssetDto> GetByIdAsync(int id);

    Task<IReadOnlyList<AssetAssignmentDto>> GetByEmployeeAsync(Guid employeeId);

    Task<IReadOnlyList<AssetAssignmentDto>> GetMyAssetsAsync(ClaimsPrincipal actor);

    Task<IReadOnlyList<AssetReturnRequestDto>> GetMyReturnRequestsAsync(ClaimsPrincipal actor);

    Task<IReadOnlyList<AssetReturnRequestDto>> GetReturnRequestsAsync();

    Task<AssetReturnRequestDto> CreateReturnRequestAsync(
        ClaimsPrincipal actor,
        int assetAssignmentId,
        CreateAssetReturnRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetReturnRequestDto> ApproveReturnRequestAsync(
        ClaimsPrincipal actor,
        int returnRequestId,
        ReviewAssetReturnRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetReturnRequestDto> RejectReturnRequestAsync(
        ClaimsPrincipal actor,
        int returnRequestId,
        ReviewAssetReturnRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateAssetRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetDto> UpdateAsync(
        ClaimsPrincipal actor,
        int id,
        UpdateAssetRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetAssignmentDto> AssignAsync(
        ClaimsPrincipal actor,
        int assetId,
        AssignAssetRequest request,
        string? ipAddress,
        string? userAgent);

    Task<AssetReturnDto> ReturnAsync(
        ClaimsPrincipal actor,
        int assetId,
        ReturnAssetRequest request,
        string? ipAddress,
        string? userAgent);
}
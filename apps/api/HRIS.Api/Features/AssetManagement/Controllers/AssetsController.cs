using HRIS.Api.Features.AssetManagement.DTOs;
using HRIS.Api.Features.AssetManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.AssetManagement.Controllers;

[ApiController]
[Route("api/assets")]
[Authorize]
public class AssetsController : ControllerBase
{
    private readonly IAssetService _assetService;

    public AssetsController(IAssetService assetService)
    {
        _assetService = assetService;
    }

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<AssetDto>>> GetAll()
    {
        var assets = await _assetService.GetAllAsync();

        return Ok(assets);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetDto>> GetById(int id)
    {
        var asset = await _assetService.GetByIdAsync(id);

        return Ok(asset);
    }

    [HttpGet("employee/{employeeId:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<AssetAssignmentDto>>> GetByEmployee(Guid employeeId)
    {
        var assets = await _assetService.GetByEmployeeAsync(employeeId);

        return Ok(assets);
    }

    [HttpGet("my-assets")]
    public async Task<ActionResult<IReadOnlyList<AssetAssignmentDto>>> GetMyAssets()
    {
        var assets = await _assetService.GetMyAssetsAsync(User);

        return Ok(assets);
    }

    [HttpGet("my-return-requests")]
    public async Task<ActionResult<IReadOnlyList<AssetReturnRequestDto>>> GetMyReturnRequests()
    {
        var requests = await _assetService.GetMyReturnRequestsAsync(User);

        return Ok(requests);
    }

    [HttpGet("return-requests")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<IReadOnlyList<AssetReturnRequestDto>>> GetReturnRequests()
    {
        var requests = await _assetService.GetReturnRequestsAsync();

        return Ok(requests);
    }

    [HttpPost("my-assets/{assignmentId:int}/return-request")]
    public async Task<ActionResult<AssetReturnRequestDto>> CreateReturnRequest(
        int assignmentId,
        CreateAssetReturnRequest request)
    {
        var returnRequest = await _assetService.CreateReturnRequestAsync(
            User,
            assignmentId,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(returnRequest);
    }

    [HttpPost("return-requests/{id:int}/approve")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetReturnRequestDto>> ApproveReturnRequest(
        int id,
        ReviewAssetReturnRequest request)
    {
        var returnRequest = await _assetService.ApproveReturnRequestAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(returnRequest);
    }

    [HttpPost("return-requests/{id:int}/reject")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetReturnRequestDto>> RejectReturnRequest(
        int id,
        ReviewAssetReturnRequest request)
    {
        var returnRequest = await _assetService.RejectReturnRequestAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(returnRequest);
    }

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetDto>> Create(CreateAssetRequest request)
    {
        var asset = await _assetService.CreateAsync(
            User,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return CreatedAtAction(nameof(GetById), new { id = asset.Id }, asset);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetDto>> Update(int id, UpdateAssetRequest request)
    {
        var asset = await _assetService.UpdateAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(asset);
    }

    [HttpPost("{id:int}/assign")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetAssignmentDto>> Assign(int id, AssignAssetRequest request)
    {
        var assignment = await _assetService.AssignAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(assignment);
    }

    [HttpPost("{id:int}/return")]
    [Authorize(Roles = "SUPER_ADMIN,ADMIN")]
    public async Task<ActionResult<AssetReturnDto>> Return(int id, ReturnAssetRequest request)
    {
        var assetReturn = await _assetService.ReturnAsync(
            User,
            id,
            request,
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString());

        return Ok(assetReturn);
    }
}
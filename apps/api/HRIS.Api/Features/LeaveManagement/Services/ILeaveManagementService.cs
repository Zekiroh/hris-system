using System.Security.Claims;
using HRIS.Api.Features.LeaveManagement.DTOs;

namespace HRIS.Api.Features.LeaveManagement.Services;

public interface ILeaveManagementService
{
    Task<IReadOnlyList<LeaveBalanceDto>> GetMyBalancesAsync(long userId);

    Task<IReadOnlyList<LeaveRequestDto>> GetMyRequestsAsync(long userId);

    Task<LeaveRequestDto> CreateRequestAsync(
        long userId,
        ClaimsPrincipal actor,
        CreateLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent);

    Task<LeaveRequestDto> CancelRequestAsync(
        long userId,
        ClaimsPrincipal actor,
        int requestId,
        string? ipAddress,
        string? userAgent);

    Task<IReadOnlyList<LeaveBalanceTransactionDto>> GetMyHistoryAsync(long userId);

    Task<IReadOnlyList<LeaveRequestDto>> GetAllRequestsAsync();

    Task<LeaveRequestDto> ApproveRequestAsync(
        long reviewerUserId,
        ClaimsPrincipal actor,
        int requestId,
        ReviewLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent);

    Task<LeaveRequestDto> RejectRequestAsync(
        long reviewerUserId,
        ClaimsPrincipal actor,
        int requestId,
        ReviewLeaveRequestDto dto,
        string? ipAddress,
        string? userAgent);

    Task<IReadOnlyList<LeaveBalanceDto>> GetEmployeeBalancesAsync(Guid employeeId);

    Task<IReadOnlyList<LeaveBalanceTransactionDto>> GetEmployeeHistoryAsync(Guid employeeId);

    Task<IReadOnlyList<LeaveBalanceDto>> GetAllBalancesAsync();

    Task<LeaveBalanceDto> CreditBalanceAsync(
        long adminUserId,
        ClaimsPrincipal actor,
        CreditLeaveBalanceDto dto,
        string? ipAddress,
        string? userAgent);

    Task<LeaveBalanceDto> AdjustBalanceAsync(
        long adminUserId,
        ClaimsPrincipal actor,
        AdjustLeaveBalanceDto dto,
        string? ipAddress,
        string? userAgent);
}
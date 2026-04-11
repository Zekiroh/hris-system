using HRIS.Api.Features.IAM.DTOs;

namespace HRIS.Api.Features.IAM.Services;

public interface IAdminUsersService
{
    Task<List<AdminUserListItemDto>> GetAdminUsersAsync(
        string? sortBy,
        string? sortOrder,
        int? roleId,
        bool? isActive);

    Task<List<AdminUserListItemDto>> GetAvailableUsersForEmployeeAsync();
    Task<AdminUserListItemDto> CreateUserAsync(CreateUserRequest request);
    Task<AdminUserListItemDto?> UpdateUserAsync(long id, UpdateUserRequest request);
    Task<bool> UpdateUserStatusAsync(long id, UpdateUserStatusRequest request);
    Task<bool> ResetUserPasswordAsync(long id, string newPassword);
}
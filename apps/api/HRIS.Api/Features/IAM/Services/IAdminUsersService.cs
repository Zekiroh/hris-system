using HRIS.Api.Features.IAM.DTOs;

namespace HRIS.Api.Features.IAM.Services;

public interface IAdminUsersService
{
    Task<List<AdminUserListItemDto>> GetAdminUsersAsync();
}
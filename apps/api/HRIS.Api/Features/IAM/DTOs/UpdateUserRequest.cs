namespace HRIS.Api.Features.IAM.DTOs;

public record UpdateUserRequest(string FullName, string Email, int RoleId);
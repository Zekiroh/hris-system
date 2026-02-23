namespace HRIS.Api.Features.IAM.DTOs;

public record CreateUserRequest(string FullName, string Email, string Password, int RoleId);
namespace HRIS.Api.Features.IAM.DTOs;

public record CreateUserRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string? Suffix,
    string Email,
    string Password,
    int RoleId,
    bool IsActive
);
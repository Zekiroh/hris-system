namespace HRIS.Api.Features.IAM.DTOs;

public record UpdateUserRequest(
    string FirstName,
    string? MiddleName,
    string LastName,
    string Email,
    int RoleId,
    bool IsActive
);
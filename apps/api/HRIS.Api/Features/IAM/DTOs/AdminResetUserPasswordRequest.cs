namespace HRIS.Api.Features.IAM.DTOs;

public record AdminResetUserPasswordRequest(
    string NewPassword
);
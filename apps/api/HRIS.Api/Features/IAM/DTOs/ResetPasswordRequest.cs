namespace HRIS.Api.Features.IAM.DTOs;

public record ResetPasswordRequest(
    string Token,
    string NewPassword
);
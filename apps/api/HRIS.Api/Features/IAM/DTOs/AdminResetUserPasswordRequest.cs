using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.IAM.DTOs;

public record AdminResetUserPasswordRequest(
    [property: Required(ErrorMessage = "New password is required.")]
    [property: MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    string NewPassword
);
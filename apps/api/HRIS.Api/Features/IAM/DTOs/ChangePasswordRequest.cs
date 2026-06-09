using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.IAM.DTOs;

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = default!;

    [Required, MinLength(8)]
    public string NewPassword { get; set; } = default!;
}
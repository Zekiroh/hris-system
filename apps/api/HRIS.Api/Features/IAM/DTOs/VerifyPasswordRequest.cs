using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.IAM.DTOs;

public class VerifyPasswordRequest
{
    [Required]
    public string Password { get; set; } = default!;
}
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace HRIS.Api.Features.IAM.DTOs;

public record AdminResetUserPasswordRequest(
    [property: JsonPropertyName("newPassword")]
    [param: Required]
    [param: MinLength(8)]
    string NewPassword
);
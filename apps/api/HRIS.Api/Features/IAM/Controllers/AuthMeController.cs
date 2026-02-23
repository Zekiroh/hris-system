using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("auth")]
public class AuthMeController : ControllerBase
{
    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("sub");

        var email = User.FindFirstValue(ClaimTypes.Email)
                 ?? User.FindFirstValue("email");

        var role = User.FindFirstValue(ClaimTypes.Role);

        return Ok(new
        {
            id,
            email,
            role
        });
    }
}
using HRIS.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Auth;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;

    public AuthController(AppDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public sealed record LoginRequest(string Email, string Password);

    public sealed record LoginResponse(
        long Id,
        string Email,
        string FullName,
        int RoleId,
        string Role,
        string Token
    );

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
    {
        var email = (req.Email ?? string.Empty).Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var user = await _db.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user is null || !user.IsActive)
            return Unauthorized("Invalid credentials.");

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok)
            return Unauthorized("Invalid credentials.");

        var token = _jwt.CreateToken(user);

        return Ok(new LoginResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.RoleId,
            user.Role.NormalizedName,
            token
        ));
    }
}
using System.Security.Cryptography;
using System.Text;
using HRIS.Api.Data;
using HRIS.Api.Features.IAM.DTOs;
using HRIS.Api.Features.IAM.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly IHostEnvironment _env;

    public AuthController(AppDbContext db, IJwtTokenService jwt, IHostEnvironment env)
    {
        _db = db;
        _jwt = jwt;
        _env = env;
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

    public sealed record ForgotPasswordResponse(string? ResetToken = null);

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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var email = (req.Email ?? string.Empty).Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user is null || !user.IsActive)
        {
            if (_env.IsDevelopment())
                return Ok(new ForgotPasswordResponse());

            return Ok();
        }

        var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(token))
        );

        user.PasswordResetToken = tokenHash;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        if (_env.IsDevelopment())
            return Ok(new ForgotPasswordResponse(token));

        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var token = (req.Token ?? string.Empty).Trim();
        var newPassword = req.NewPassword ?? string.Empty;

        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            return BadRequest("Token and new password are required.");

        var tokenHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(token))
        );

        var now = DateTime.UtcNow;
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        var affectedRows = await _db.Users
            .Where(u =>
                u.IsActive &&
                u.PasswordResetToken == tokenHash &&
                u.PasswordResetTokenExpiresAt != null &&
                u.PasswordResetTokenExpiresAt > now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(u => u.PasswordHash, passwordHash)
                .SetProperty(u => u.PasswordResetToken, (string?)null)
                .SetProperty(u => u.PasswordResetTokenExpiresAt, (DateTime?)null)
                .SetProperty(u => u.UpdatedAt, now));

        if (affectedRows == 0)
            return BadRequest("Invalid or expired reset token.");

        return Ok();
    }
}
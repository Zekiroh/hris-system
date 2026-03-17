using System.Security.Cryptography;
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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var email = (req.Email ?? string.Empty).Trim();
        var normalizedEmail = email.ToUpperInvariant();

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.NormalizedEmail == normalizedEmail);

        if (user is null || !user.IsActive)
            return Ok();

        var tokenBytes = RandomNumberGenerator.GetBytes(32);
        var token = Convert.ToBase64String(tokenBytes);

        user.PasswordResetToken = token;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        var token = (req.Token ?? string.Empty).Trim();
        var newPassword = (req.NewPassword ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            return BadRequest("Token and new password are required.");

        var user = await _db.Users
            .FirstOrDefaultAsync(u =>
                u.PasswordResetToken == token &&
                u.PasswordResetTokenExpiresAt != null &&
                u.PasswordResetTokenExpiresAt > DateTime.UtcNow);

        if (user is null || !user.IsActive)
            return BadRequest("Invalid or expired reset token.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;
        user.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return Ok();
    }
}
using System.Text;

namespace HRIS.Api.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Key { get; init; } = "";
    public string Issuer { get; init; } = "";
    public string Audience { get; init; } = "";
    public int ExpiryMinutes { get; init; }

    public static JwtOptions FromConfiguration(IConfiguration configuration)
    {
        var key = configuration[$"{SectionName}:Key"];
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new InvalidOperationException($"{SectionName}:Key is missing. Set it via user-secrets or a secure environment variable.");
        }

        if (Encoding.UTF8.GetByteCount(key) < 32)
        {
            throw new InvalidOperationException($"{SectionName}:Key must be at least 32 bytes for HMAC SHA-256 signing.");
        }

        var issuer = configuration[$"{SectionName}:Issuer"];
        if (string.IsNullOrWhiteSpace(issuer))
        {
            throw new InvalidOperationException($"{SectionName}:Issuer is missing.");
        }

        var audience = configuration[$"{SectionName}:Audience"];
        if (string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException($"{SectionName}:Audience is missing.");
        }

        var expiryMinutesRaw = configuration[$"{SectionName}:ExpiryMinutes"];
        if (!int.TryParse(expiryMinutesRaw, out var expiryMinutes) || expiryMinutes <= 0)
        {
            throw new InvalidOperationException($"{SectionName}:ExpiryMinutes must be a positive integer.");
        }

        return new JwtOptions
        {
            Key = key,
            Issuer = issuer,
            Audience = audience,
            ExpiryMinutes = expiryMinutes
        };
    }
}

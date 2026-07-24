namespace HRIS.Api.Configuration;

public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    public string[] AllowedOrigins { get; init; } = [];

    public static string[] GetAllowedOrigins(IConfiguration configuration, IHostEnvironment environment)
    {
        var configuredOrigins =
            configuration.GetSection($"{SectionName}:AllowedOrigins").Get<string[]>() ?? [];

        var normalizedOrigins = new List<string>();
        var invalidOrigins = new List<string>();

        foreach (var origin in configuredOrigins)
        {
            if (string.IsNullOrWhiteSpace(origin))
            {
                continue;
            }

            var normalized = origin.Trim().TrimEnd('/');

            if (!Uri.TryCreate(normalized, UriKind.Absolute, out var uri) ||
                (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps) ||
                uri.AbsolutePath != "/" ||
                !string.IsNullOrEmpty(uri.Query) ||
                !string.IsNullOrEmpty(uri.Fragment))
            {
                invalidOrigins.Add(origin);
                continue;
            }

            normalizedOrigins.Add(uri.GetLeftPart(UriPartial.Authority));
        }

        if (invalidOrigins.Count > 0)
        {
            throw new InvalidOperationException(
                $"{SectionName}:AllowedOrigins contains invalid origin values. Use absolute HTTP or HTTPS origins only.");
        }

        var distinctOrigins = normalizedOrigins
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (!environment.IsDevelopment() && distinctOrigins.Length == 0)
        {
            throw new InvalidOperationException(
                $"{SectionName}:AllowedOrigins must contain at least one valid origin outside Development.");
        }

        return distinctOrigins;
    }
}

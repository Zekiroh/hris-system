namespace HRIS.Api.Utils;

public static class NameFormatter
{
    public static string NormalizeSuffix(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        var normalized = value.Replace(".", "").Trim().ToLower();

        return normalized switch
        {
            "jr" => "Jr.",
            "sr" => "Sr.",
            "ii" => "II",
            "iii" => "III",
            "iv" => "IV",
            _ => value.Trim()
        };
    }

    public static string GetMiddleInitial(string? middleName)
    {
        if (string.IsNullOrWhiteSpace(middleName)) return string.Empty;
        return $"{middleName.Trim()[0]}.";
    }

    public static string FormatFullName(
        string firstName,
        string? middleName,
        string lastName,
        string? suffix
    )
    {
        var middleInitial = GetMiddleInitial(middleName);
        var normalizedSuffix = NormalizeSuffix(suffix);

        var baseName = string.Join(" ",
            new[] { firstName, middleInitial, lastName }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

        return string.Join(", ",
            new[] { baseName, normalizedSuffix }
            .Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}
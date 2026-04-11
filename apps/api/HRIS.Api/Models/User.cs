namespace HRIS.Api.Models;

public class User
{
    public long Id { get; set; }

    public string Email { get; set; } = default!;

    public string NormalizedEmail { get; set; } = default!;

    public string FullName { get; set; } = default!;

    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Suffix { get; set; }

    public string PasswordHash { get; set; } = default!;

    public int RoleId { get; set; }

    public Role Role { get; set; } = default!;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public string? PasswordResetToken { get; set; }

    public DateTime? PasswordResetTokenExpiresAt { get; set; }

    public Employee? Employee { get; set; }
}
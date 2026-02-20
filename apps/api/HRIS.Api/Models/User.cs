namespace HRIS.Api.Models;

public class User
{
    public long Id { get; set; }

    public string Email { get; set; } = default!;

    public string FullName { get; set; } = default!;

    // For now: store a hashed password (we’ll implement hashing later)
    public string PasswordHash { get; set; } = default!;

    public int RoleId { get; set; }

    public Role Role { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

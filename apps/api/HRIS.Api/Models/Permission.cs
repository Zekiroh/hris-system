namespace HRIS.Api.Models;

public class Permission
{
    public int Id { get; set; }

    // e.g. "EMPLOYEE", "ATTENDANCE", "LEAVE", "PAYROLL", etc.
    public string Module { get; set; } = null!;

    public bool CanView { get; set; }
    public bool CanCreate { get; set; }
    public bool CanUpdate { get; set; }
    public bool CanArchive { get; set; }

    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
namespace HRIS.Api.Models;

public class Role
{
    public int Id { get; set; }

    public string Name { get; set; } = default!;

    public string NormalizedName { get; set; } = default!;

    public bool IsSystem { get; set; } = true;

    public ICollection<User> Users { get; set; } = new List<User>();

    //public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

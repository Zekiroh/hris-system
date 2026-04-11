namespace HRIS.Api.Features.IAM.DTOs;

public class AdminUserListItemDto
{
    public long Id { get; set; }
    public string FullName { get; set; } = string.Empty;

    public string? FirstName { get; set; }
    public string? MiddleName { get; set; }
    public string? LastName { get; set; }
    public string? Suffix { get; set; }

    public string Email { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public bool HasEmployee { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? LastActive { get; set; }
}
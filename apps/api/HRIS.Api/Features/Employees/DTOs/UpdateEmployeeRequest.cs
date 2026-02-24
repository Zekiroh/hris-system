using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Employees.DTOs;

public class UpdateEmployeeRequest
{
    [Required, MaxLength(100)]
    public string FirstName { get; set; } = default!;

    [MaxLength(100)]
    public string? MiddleName { get; set; }

    [Required, MaxLength(100)]
    public string LastName { get; set; } = default!;

    public DateOnly? BirthDate { get; set; }

    [MaxLength(20)]
    public string? Sex { get; set; }

    [MaxLength(20)]
    public string? CivilStatus { get; set; }

    [Required]
    public DateOnly? DateHired { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    public bool IsActive { get; set; }
}
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

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [Required, MaxLength(50)]
    public string EmploymentType { get; set; } = default!;

    // ---- C1 Basic Info Fields ----

    [MaxLength(20)]
    public string? ContactNumber { get; set; }

    [EmailAddress]
    [MaxLength(150)]
    public string? Email { get; set; }

    [MaxLength(150)]
    public string? AddressLine1 { get; set; }

    [MaxLength(150)]
    public string? AddressLine2 { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [MaxLength(100)]
    public string? Province { get; set; }

    [MaxLength(20)]
    public string? ZipCode { get; set; }

    // ---- C2 Government Fields ----

    [MaxLength(20)]
    public string? SSSNumber { get; set; }

    [MaxLength(20)]
    public string? PhilHealthNumber { get; set; }

    [MaxLength(20)]
    public string? PagIbigNumber { get; set; }

    [MaxLength(20)]
    public string? TINNumber { get; set; }

    public bool IsActive { get; set; }
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Employees.DTOs;

public class CreateEmployeeRequest
{
    [Required]
    public long UserId { get; set; }

    [Required]
    public DateOnly DateHired { get; set; }

    [MaxLength(100)]
    public string? Department { get; set; }

    [MaxLength(100)]
    public string? Position { get; set; }

    [MaxLength(20)]
    public string? ContactNumber { get; set; }

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
}
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Employees.DTOs;

public class GetEmployeesQuery
{
    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    [MaxLength(100)]
    public string? Search { get; set; }

    public bool? IsActive { get; set; }
    public bool? IsNewHire { get; set; }

    [MaxLength(20)]
    public string? SortBy { get; set; }

    [MaxLength(50)]
    public string? EmploymentType { get; set; }
}
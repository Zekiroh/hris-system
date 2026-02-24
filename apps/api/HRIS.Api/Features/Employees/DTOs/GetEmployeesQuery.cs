using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Employees.DTOs;

public class GetEmployeesQuery
{
    // Pagination

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 10;

    // Search

    [MaxLength(100)]
    public string? Search { get; set; }

    // Filters

    public bool? IsActive { get; set; }
}
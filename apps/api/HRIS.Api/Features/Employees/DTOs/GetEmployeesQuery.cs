namespace HRIS.Api.Features.Employees.DTOs;

public class GetEmployeesQuery
{
    // Pagination
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;

    // Search
    public string? Search { get; set; }

    // Filters
    public bool? IsActive { get; set; }
}
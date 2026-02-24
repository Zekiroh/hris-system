namespace HRIS.Api.Features.Employees.DTOs;

public class PagedEmployeesResponse
{
    public List<EmployeeDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}
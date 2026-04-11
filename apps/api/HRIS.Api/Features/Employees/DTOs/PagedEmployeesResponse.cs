namespace HRIS.Api.Features.Employees.DTOs;

public class PagedEmployeesResponse
{
    public List<EmployeeDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public EmployeeSummaryDto Summary { get; set; } = new();
}

public class EmployeeSummaryDto
{
    public int Total { get; set; }
    public int Active { get; set; }
    public int Inactive { get; set; }
    public int NewHires { get; set; }
}
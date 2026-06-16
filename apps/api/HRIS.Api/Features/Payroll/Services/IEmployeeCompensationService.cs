using System.Security.Claims;
using HRIS.Api.Features.Payroll.DTOs;

namespace HRIS.Api.Features.Payroll.Services;

public interface IEmployeeCompensationService
{
    Task<IReadOnlyList<EmployeeCompensationDto>> GetAllAsync();

    Task<IReadOnlyList<EmployeeCompensationDto>> GetByEmployeeAsync(Guid employeeId);

    Task<EmployeeCompensationDto> CreateAsync(
        ClaimsPrincipal actor,
        CreateEmployeeCompensationRequest request,
        string? ipAddress,
        string? userAgent);

    Task<EmployeeCompensationDto> UpdateAsync(
        ClaimsPrincipal actor,
        int id,
        UpdateEmployeeCompensationRequest request,
        string? ipAddress,
        string? userAgent);
}
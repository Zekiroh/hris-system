using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace HRIS.Api.Features.Employees.DTOs;

public class UpdateEmployeeStatusRequest
{
    [BindRequired]
    public bool IsActive { get; set; }
}

using HRIS.Api.Features.Employees.DTOs;
using HRIS.Api.Features.Employees.Services;
using HRIS.Api.Features.IAM.Controllers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.Employees.Controllers;

[ApiController]
[Route("employees")]
[Authorize]
public class EmployeesController : ControllerBase
{
    private readonly EmployeesService _employees;

    public EmployeesController(EmployeesService employees)
    {
        _employees = employees;
    }

    [HttpGet]
    [PermissionAuthorize("EMPLOYEES", "View")]
    public async Task<ActionResult<List<EmployeeDto>>> GetAll(CancellationToken ct)
    {
        var list = await _employees.GetAllAsync(ct);
        return Ok(list);
    }

    [HttpGet("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "View")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken ct)
    {
        var employee = await _employees.GetByIdAsync(id, ct);
        if (employee is null) return NotFound();

        return Ok(employee);
    }

    [HttpPost]
    [PermissionAuthorize("EMPLOYEES", "Create")]
    public async Task<ActionResult<EmployeeDto>> Create([FromBody] CreateEmployeeRequest req, CancellationToken ct)
    {
        var (ok, error, employee) = await _employees.CreateAsync(req, ct);
        if (!ok) return BadRequest(new { message = error });

        return CreatedAtAction(nameof(GetById), new { id = employee!.Id }, employee);
    }

    [HttpPut("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "Update")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, [FromBody] UpdateEmployeeRequest req, CancellationToken ct)
    {
        var (ok, error, employee) = await _employees.UpdateAsync(id, req, ct);
        if (!ok)
        {
            if (error == "Employee not found.") return NotFound();
            return BadRequest(new { message = error });
        }

        return Ok(employee);
    }

    [HttpDelete("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "Archive")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var (ok, error) = await _employees.DeleteAsync(id, ct);
        if (!ok)
        {
            if (error == "Employee not found.") return NotFound();
            return BadRequest(new { message = error });
        }

        return NoContent();
    }
}
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
    public async Task<ActionResult<PagedEmployeesResponse>> GetAll(
        [FromQuery] GetEmployeesQuery query,
        CancellationToken ct)
    {
        var result = await _employees.GetAllAsync(query, ct);
        return Ok(result);
    }

    [HttpGet("next-number")]
    [PermissionAuthorize("EMPLOYEES", "Create")]
    public async Task<ActionResult<NextEmployeeNumberResponse>> GetNextEmployeeNumber(
        CancellationToken ct)
    {
        var result = await _employees.GetNextEmployeeNumberAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "View")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken ct)
    {
        var employee = await _employees.GetByIdAsync(id, ct);
        if (employee is null) return NotFound();

        return Ok(employee);
    }

    [HttpGet("{id:guid}/documents")]
    [PermissionAuthorize("EMPLOYEES", "View")]
    public async Task<ActionResult<List<EmployeeDocumentDto>>> GetDocuments(
        Guid id,
        CancellationToken ct)
    {
        var docs = await _employees.GetDocumentsAsync(id, ct);
        return Ok(docs);
    }

    [HttpGet("{employeeId:guid}/documents/{documentId:guid}")]
    [PermissionAuthorize("EMPLOYEES", "View")]
    public async Task<IActionResult> DownloadDocument(
        Guid employeeId,
        Guid documentId,
        CancellationToken ct)
    {
        var (ok, error, file) = await _employees.DownloadDocumentAsync(employeeId, documentId, ct);

        if (!ok)
        {
            if (error == "Document not found.") return NotFound();
            return BadRequest(new { message = error });
        }

        var download = file!.Value;

        return File(
            download.Stream,
            download.ContentType,
            download.OriginalFileName
        );
    }

    [HttpPost]
    [PermissionAuthorize("EMPLOYEES", "Create")]
    public async Task<ActionResult<EmployeeDto>> Create(
        [FromBody] CreateEmployeeRequest req,
        CancellationToken ct)
    {
        var (ok, error, employee) = await _employees.CreateAsync(req, ct);

        if (!ok)
        {
            if (error == "Selected user not found.") return NotFound(new { message = error });

            if (!string.IsNullOrWhiteSpace(error))
            {
                if (error.StartsWith("DUPLICATE_", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { message = error });
                }

                if (
                    error.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                    error.Contains("already linked", StringComparison.OrdinalIgnoreCase) ||
                    error.Contains("already assigned", StringComparison.OrdinalIgnoreCase) ||
                    error.Contains("conflict", StringComparison.OrdinalIgnoreCase)
                )
                {
                    return Conflict(new { message = error });
                }
            }

            return BadRequest(new { message = error });
        }

        return CreatedAtAction(nameof(GetById), new { id = employee!.Id }, employee);
    }

    [HttpPost("{id:guid}/documents")]
    [PermissionAuthorize("EMPLOYEES", "Update")]
    [RequestSizeLimit(10_000_000)]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadDocument(
        Guid id,
        [FromForm] UploadEmployeeDocumentRequest req,
        CancellationToken ct)
    {
        var (ok, error, document) = await _employees.UploadDocumentAsync(
            id,
            req.DocumentType,
            req.File,
            ct);

        if (!ok)
        {
            if (error == "Employee not found.") return NotFound();
            return BadRequest(new { message = error });
        }

        return Ok(new
        {
            message = "Document uploaded successfully.",
            documentId = document!.Id,
            documentType = document.DocumentType,
            originalFileName = document.OriginalFileName
        });
    }

    [HttpPut("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "Update")]
    public async Task<ActionResult<EmployeeDto>> Update(
        Guid id,
        [FromBody] UpdateEmployeeRequest req,
        CancellationToken ct)
    {
        var (ok, error, employee) = await _employees.UpdateAsync(id, req, ct);

        if (!ok)
        {
            if (error == "Employee not found.")
                return NotFound(new { message = error });

            if (!string.IsNullOrWhiteSpace(error) && error.Contains(":"))
            {
                var errors = new Dictionary<string, string[]>();

                foreach (var pair in error.Split('|', StringSplitOptions.RemoveEmptyEntries))
                {
                    var parts = pair.Split(':', 2, StringSplitOptions.TrimEntries);
                    if (parts.Length == 2)
                    {
                        errors[parts[0]] = new[] { parts[1] };
                    }
                }

                return Conflict(new
                {
                    message = "Validation failed.",
                    errors
                });
            }

            if (!string.IsNullOrWhiteSpace(error) && (
                error.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                error.Contains("already linked", StringComparison.OrdinalIgnoreCase) ||
                error.Contains("already assigned", StringComparison.OrdinalIgnoreCase) ||
                error.Contains("conflict", StringComparison.OrdinalIgnoreCase)))
            {
                return Conflict(new { message = error });
            }

            return BadRequest(new { message = error });
        }

        return Ok(employee);
    }

    [HttpPatch("{id:guid}/status")]
    [PermissionAuthorize("EMPLOYEES", "Update")]
    public async Task<ActionResult<EmployeeDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateEmployeeStatusRequest req,
        CancellationToken ct)
    {
        var (ok, error, employee) = await _employees.UpdateStatusAsync(id, req, ct);

        if (!ok)
        {
            if (error == "Employee not found.") return NotFound(new { message = error });

            if (!string.IsNullOrWhiteSpace(error) && (
                error.Contains("already exists", StringComparison.OrdinalIgnoreCase) ||
                error.Contains("conflict", StringComparison.OrdinalIgnoreCase)))
            {
                return Conflict(new { message = error });
            }

            return BadRequest(new { message = error });
        }

        return Ok(employee);
    }

    [HttpDelete("{employeeId:guid}/documents/{documentId:guid}")]
    [PermissionAuthorize("EMPLOYEES", "Update")]
    public async Task<IActionResult> DeleteDocument(
        Guid employeeId,
        Guid documentId,
        CancellationToken ct)
    {
        var (ok, error) = await _employees.DeleteDocumentAsync(employeeId, documentId, ct);

        if (!ok)
        {
            if (error == "Document not found.") return NotFound();
            return BadRequest(new { message = error });
        }

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [PermissionAuthorize("EMPLOYEES", "Archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var (ok, error) = await _employees.DeleteAsync(id, ct);

        if (!ok)
        {
            if (error == "Employee not found.") return NotFound(new { message = error });

            if (!string.IsNullOrWhiteSpace(error) &&
                error.Contains("conflict", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = error });
            }

            return BadRequest(new { message = error });
        }

        return NoContent();
    }
}
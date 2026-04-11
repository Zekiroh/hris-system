using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Features.Employees.DTOs;

public class UploadEmployeeDocumentRequest
{
    [Required]
    [MaxLength(50)]
    public string DocumentType { get; set; } = default!;

    [Required]
    public IFormFile File { get; set; } = default!;
}
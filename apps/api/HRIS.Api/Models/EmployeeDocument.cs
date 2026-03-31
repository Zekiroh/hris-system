using System;
using System.ComponentModel.DataAnnotations;

namespace HRIS.Api.Models;

public class EmployeeDocument
{
    public Guid Id { get; set; }

    [Required]
    public Guid EmployeeId { get; set; }

    public Employee Employee { get; set; } = default!;

    [Required]
    [MaxLength(50)]
    public string DocumentType { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    public string OriginalFileName { get; set; } = default!;

    [Required]
    [MaxLength(255)]
    public string StoredFileName { get; set; } = default!;

    [Required]
    [MaxLength(100)]
    public string ContentType { get; set; } = default!;

    public long FileSize { get; set; }

    [Required]
    [MaxLength(500)]
    public string StoragePath { get; set; } = default!;

    public DateTime UploadedAtUtc { get; set; } = DateTime.UtcNow;
}
namespace HRIS.Api.Features.Employees.DTOs;

public record EmployeeDocumentDto(
    Guid Id,
    string DocumentType,
    string OriginalFileName,
    string ContentType,
    long FileSize,
    DateTime UploadedAtUtc
);
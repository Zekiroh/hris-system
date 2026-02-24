using HRIS.Api.Data;
using HRIS.Api.Features.Employees.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Employees.Services;

public class EmployeesService
{
    private readonly AppDbContext _db;

    public EmployeesService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedEmployeesResponse> GetAllAsync(GetEmployeesQuery query, CancellationToken ct = default)
    {
        // Guard rails
        var page = query.Page <= 0 ? 1 : query.Page;
        var pageSize = query.PageSize <= 0 ? 10 : query.PageSize;
        if (pageSize > 100) pageSize = 100;

        var q = _db.Employees
            .AsNoTracking()
            .AsQueryable();

        // Filter: active/archived
        if (query.IsActive.HasValue)
        {
            q = q.Where(e => e.IsActive == query.IsActive.Value);
        }

        // Search: EmployeeNumber, names, department, position
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim();

            q = q.Where(e =>
                e.EmployeeNumber.Contains(search) ||
                e.FirstName.Contains(search) ||
                (e.MiddleName != null && e.MiddleName.Contains(search)) ||
                e.LastName.Contains(search) ||
                (e.Department != null && e.Department.Contains(search)) ||
                (e.Position != null && e.Position.Contains(search))
            );
        }

        var totalCount = await q.CountAsync(ct);

        var skip = (page - 1) * pageSize;

        var items = await q
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .Skip(skip)
            .Take(pageSize)
            .Select(ToDto())
            .ToListAsync(ct);

        return new PagedEmployeesResponse
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<EmployeeDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _db.Employees
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(ToDto())
            .FirstOrDefaultAsync(ct);
    }

    public async Task<(bool ok, string? error, EmployeeDto? employee)> CreateAsync(CreateEmployeeRequest req, CancellationToken ct = default)
    {
        var employeeNumber = req.EmployeeNumber.Trim();

        var exists = await _db.Employees.AnyAsync(e => e.EmployeeNumber == employeeNumber, ct);
        if (exists) return (false, "EmployeeNumber already exists.", null);

        var entity = new Employee
        {
            Id = Guid.NewGuid(),
            EmployeeNumber = employeeNumber,
            FirstName = req.FirstName.Trim(),
            MiddleName = string.IsNullOrWhiteSpace(req.MiddleName) ? null : req.MiddleName.Trim(),
            LastName = req.LastName.Trim(),
            BirthDate = req.BirthDate,
            Sex = string.IsNullOrWhiteSpace(req.Sex) ? null : req.Sex.Trim(),
            CivilStatus = string.IsNullOrWhiteSpace(req.CivilStatus) ? null : req.CivilStatus.Trim(),
            DateHired = req.DateHired!.Value,
            Department = string.IsNullOrWhiteSpace(req.Department) ? null : req.Department.Trim(),
            Position = string.IsNullOrWhiteSpace(req.Position) ? null : req.Position.Trim(),

            ContactNumber = string.IsNullOrWhiteSpace(req.ContactNumber) ? null : req.ContactNumber.Trim(),
            Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim(),
            AddressLine1 = string.IsNullOrWhiteSpace(req.AddressLine1) ? null : req.AddressLine1.Trim(),
            AddressLine2 = string.IsNullOrWhiteSpace(req.AddressLine2) ? null : req.AddressLine2.Trim(),
            City = string.IsNullOrWhiteSpace(req.City) ? null : req.City.Trim(),
            Province = string.IsNullOrWhiteSpace(req.Province) ? null : req.Province.Trim(),
            ZipCode = string.IsNullOrWhiteSpace(req.ZipCode) ? null : req.ZipCode.Trim(),

            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };

        _db.Employees.Add(entity);
        await _db.SaveChangesAsync(ct);

        return (true, null, ToDto(entity));
    }

    public async Task<(bool ok, string? error, EmployeeDto? employee)> UpdateAsync(Guid id, UpdateEmployeeRequest req, CancellationToken ct = default)
    {
        var entity = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (entity is null) return (false, "Employee not found.", null);

        entity.FirstName = req.FirstName.Trim();
        entity.MiddleName = string.IsNullOrWhiteSpace(req.MiddleName) ? null : req.MiddleName.Trim();
        entity.LastName = req.LastName.Trim();
        entity.BirthDate = req.BirthDate;
        entity.Sex = string.IsNullOrWhiteSpace(req.Sex) ? null : req.Sex.Trim();
        entity.CivilStatus = string.IsNullOrWhiteSpace(req.CivilStatus) ? null : req.CivilStatus.Trim();
        entity.DateHired = req.DateHired!.Value;
        entity.Department = string.IsNullOrWhiteSpace(req.Department) ? null : req.Department.Trim();
        entity.Position = string.IsNullOrWhiteSpace(req.Position) ? null : req.Position.Trim();

        entity.ContactNumber = string.IsNullOrWhiteSpace(req.ContactNumber) ? null : req.ContactNumber.Trim();
        entity.Email = string.IsNullOrWhiteSpace(req.Email) ? null : req.Email.Trim();
        entity.AddressLine1 = string.IsNullOrWhiteSpace(req.AddressLine1) ? null : req.AddressLine1.Trim();
        entity.AddressLine2 = string.IsNullOrWhiteSpace(req.AddressLine2) ? null : req.AddressLine2.Trim();
        entity.City = string.IsNullOrWhiteSpace(req.City) ? null : req.City.Trim();
        entity.Province = string.IsNullOrWhiteSpace(req.Province) ? null : req.Province.Trim();
        entity.ZipCode = string.IsNullOrWhiteSpace(req.ZipCode) ? null : req.ZipCode.Trim();

        entity.IsActive = req.IsActive;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return (true, null, ToDto(entity));
    }

    public async Task<(bool ok, string? error, EmployeeDto? employee)> UpdateStatusAsync(
        Guid id,
        UpdateEmployeeStatusRequest req,
        CancellationToken ct = default)
    {
        var entity = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (entity is null) return (false, "Employee not found.", null);

        entity.IsActive = req.IsActive;
        entity.UpdatedAtUtc = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);

        return (true, null, ToDto(entity));
    }

    public async Task<(bool ok, string? error)> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var entity = await _db.Employees.FirstOrDefaultAsync(e => e.Id == id, ct);
        if (entity is null) return (false, "Employee not found.");

        _db.Employees.Remove(entity);
        await _db.SaveChangesAsync(ct);

        return (true, null);
    }

    private static EmployeeDto ToDto(Employee e) => new()
    {
        Id = e.Id,
        EmployeeNumber = e.EmployeeNumber,
        FirstName = e.FirstName,
        MiddleName = e.MiddleName,
        LastName = e.LastName,
        BirthDate = e.BirthDate,
        Sex = e.Sex,
        CivilStatus = e.CivilStatus,
        DateHired = e.DateHired,
        Department = e.Department,
        Position = e.Position,

        ContactNumber = e.ContactNumber,
        Email = e.Email,
        AddressLine1 = e.AddressLine1,
        AddressLine2 = e.AddressLine2,
        City = e.City,
        Province = e.Province,
        ZipCode = e.ZipCode,

        IsActive = e.IsActive,
        CreatedAtUtc = e.CreatedAtUtc,
        UpdatedAtUtc = e.UpdatedAtUtc
    };

    private static System.Linq.Expressions.Expression<Func<Employee, EmployeeDto>> ToDto() =>
        e => new EmployeeDto
        {
            Id = e.Id,
            EmployeeNumber = e.EmployeeNumber,
            FirstName = e.FirstName,
            MiddleName = e.MiddleName,
            LastName = e.LastName,
            BirthDate = e.BirthDate,
            Sex = e.Sex,
            CivilStatus = e.CivilStatus,
            DateHired = e.DateHired,
            Department = e.Department,
            Position = e.Position,

            ContactNumber = e.ContactNumber,
            Email = e.Email,
            AddressLine1 = e.AddressLine1,
            AddressLine2 = e.AddressLine2,
            City = e.City,
            Province = e.Province,
            ZipCode = e.ZipCode,

            IsActive = e.IsActive,
            CreatedAtUtc = e.CreatedAtUtc,
            UpdatedAtUtc = e.UpdatedAtUtc
        };
}
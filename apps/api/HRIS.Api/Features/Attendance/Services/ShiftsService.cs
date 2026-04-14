using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public class ShiftsService : IShiftsService
{
    private readonly AppDbContext _context;

    public ShiftsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedShiftsResponse> GetShiftsAsync(GetShiftQuery query, CancellationToken ct)
    {
        var dbQuery = _context.Shifts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            dbQuery = dbQuery.Where(x => x.Name.Contains(query.Search));
        }

        if (query.IsActive.HasValue)
        {
            dbQuery = dbQuery.Where(x => x.IsActive == query.IsActive.Value);
        }

        var totalCount = await dbQuery.CountAsync(ct);

        var items = await dbQuery
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new PagedShiftsResponse
        {
            Items = items.Select(MapToDto).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<ShiftDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var shift = await _context.Shifts.FindAsync(new object[] { id }, ct);
        return shift == null ? null : MapToDto(shift);
    }

    public async Task<ShiftDto> CreateAsync(CreateShiftRequest request, CancellationToken ct)
    {
        if (await _context.Shifts.AnyAsync(x => x.Code == request.Code, ct))
            throw new ApiException("Shift code already exists.");

        var shift = new Shift
        {
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            LateGraceMinutes = request.LateGraceMinutes,
            IsFlexible = request.IsFlexible,
            IsActive = true,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Shifts.Add(shift);
        await _context.SaveChangesAsync(ct);

        return MapToDto(shift);
    }

    public async Task<ShiftDto?> UpdateAsync(int id, UpdateShiftRequest request, CancellationToken ct)
    {
        var shift = await _context.Shifts.FindAsync(new object[] { id }, ct);
        if (shift == null) return null;

        if (await _context.Shifts.AnyAsync(x => x.Code == request.Code && x.Id != id, ct))
            throw new ApiException("Shift code already exists.");

        shift.Code = request.Code;
        shift.Name = request.Name;
        shift.Description = request.Description;
        shift.LateGraceMinutes = request.LateGraceMinutes;
        shift.IsFlexible = request.IsFlexible;
        shift.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return MapToDto(shift);
    }

    public async Task<bool> UpdateStatusAsync(int id, UpdateShiftStatusRequest request, CancellationToken ct)
    {
        var shift = await _context.Shifts.FindAsync(new object[] { id }, ct);
        if (shift == null) return false;

        shift.IsActive = request.IsActive;
        shift.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(ct);

        return true;
    }

    private static ShiftDto MapToDto(Shift x) => new()
    {
        Id = x.Id,
        Code = x.Code,
        Name = x.Name,
        Description = x.Description,
        LateGraceMinutes = x.LateGraceMinutes,
        IsFlexible = x.IsFlexible,
        IsActive = x.IsActive,
        CreatedAtUtc = x.CreatedAtUtc,
        UpdatedAtUtc = x.UpdatedAtUtc
    };
}
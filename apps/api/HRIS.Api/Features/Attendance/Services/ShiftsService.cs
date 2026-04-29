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
        var dbQuery = _context.Shifts
            .Include(x => x.ShiftDays)
            .AsQueryable();

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

        var shiftIds = items.Select(x => x.Id).ToList();

        var assignedCounts = await _context.EmployeeShiftAssignments
            .Where(x => x.IsActive && shiftIds.Contains(x.ShiftId))
            .GroupBy(x => x.ShiftId)
            .Select(g => new
            {
                ShiftId = g.Key,
                Count = g.Count()
            })
            .ToDictionaryAsync(x => x.ShiftId, x => x.Count, ct);

        return new PagedShiftsResponse
        {
            Items = items.Select(x => MapToDto(x, assignedCounts.GetValueOrDefault(x.Id))).ToList(),
            Page = query.Page,
            PageSize = query.PageSize,
            TotalCount = totalCount,
            TotalPages = (int)Math.Ceiling(totalCount / (double)query.PageSize)
        };
    }

    public async Task<ShiftDto?> GetByIdAsync(int id, CancellationToken ct)
    {
        var shift = await _context.Shifts
            .Include(x => x.ShiftDays)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (shift == null) return null;

        var assignedCount = await _context.EmployeeShiftAssignments
            .CountAsync(x => x.ShiftId == shift.Id && x.IsActive, ct);

        return MapToDto(shift, assignedCount);
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

        return MapToDto(shift, 0);
    }

    public async Task<ShiftDto?> UpdateAsync(int id, UpdateShiftRequest request, CancellationToken ct)
    {
        var shift = await _context.Shifts
            .Include(x => x.ShiftDays)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

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

        var assignedCount = await _context.EmployeeShiftAssignments
            .CountAsync(x => x.ShiftId == shift.Id && x.IsActive, ct);

        return MapToDto(shift, assignedCount);
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

    private static ShiftDto MapToDto(Shift x, int assignedCount) => new()
    {
        Id = x.Id,
        Code = x.Code,
        Name = x.Name,
        Description = x.Description,
        LateGraceMinutes = x.LateGraceMinutes,
        IsFlexible = x.IsFlexible,
        IsActive = x.IsActive,
        AssignedCount = assignedCount,
        CreatedAtUtc = x.CreatedAtUtc,
        UpdatedAtUtc = x.UpdatedAtUtc,
        Days = x.ShiftDays
            .OrderBy(d => d.DayOfWeek)
            .Select(d => new ShiftDayDto
            {
                Id = d.Id,
                DayOfWeek = d.DayOfWeek,
                IsWorkingDay = d.IsWorkingDay,
                StartTime = d.StartTime,
                BreakStartTime = d.BreakStartTime,
                BreakEndTime = d.BreakEndTime,
                EndTime = d.EndTime
            })
            .ToList()
    };
}

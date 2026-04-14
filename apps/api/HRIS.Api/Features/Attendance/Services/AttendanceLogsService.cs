using System.Security.Claims;
using System.Text;
using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public class AttendanceLogsService : IAttendanceLogsService
{
    private readonly AppDbContext _context;
    private static readonly TimeZoneInfo ManilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

    public AttendanceLogsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<AttendanceLog> TimeInAsync(ClaimsPrincipal user, CancellationToken ct)
    {
        var employee = await ResolveEmployee(user, ct);

        var nowUtc = DateTime.UtcNow;
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, ManilaTimeZone);

        var today = DateOnly.FromDateTime(nowLocal);
        var now = TimeOnly.FromDateTime(nowLocal);

        var existing = await _context.AttendanceLogs
            .FirstOrDefaultAsync(x => x.EmployeeId == employee.Id && x.Date == today, ct);

        if (existing != null && existing.TimeIn != null)
            throw new ApiException("Already timed in.");

        var shiftDay = await GetCurrentShiftDay(employee.Id, today, ct);

        if (!shiftDay.IsWorkingDay)
            throw new ApiException("Today is not a working day.", StatusCodes.Status400BadRequest);

        if (shiftDay.BreakStartTime.HasValue &&
            shiftDay.BreakEndTime.HasValue &&
            now >= shiftDay.BreakStartTime.Value &&
            now < shiftDay.BreakEndTime.Value)
        {
            throw new ApiException("You cannot time in during break time.", StatusCodes.Status400BadRequest);
        }

        if (shiftDay.EndTime.HasValue && now >= shiftDay.EndTime.Value)
            throw new ApiException("You cannot time in after shift end.", StatusCodes.Status400BadRequest);

        if (existing == null)
        {
            existing = new AttendanceLog
            {
                EmployeeId = employee.Id,
                Date = today
            };

            _context.AttendanceLogs.Add(existing);
        }

        existing.TimeIn = now;
        existing.IsPresent = true;
        existing.UpdatedAtUtc = nowUtc;

        if (shiftDay.StartTime.HasValue)
        {
            var lateThreshold = shiftDay.StartTime.Value.AddMinutes(shiftDay.Shift.LateGraceMinutes);

            existing.LateMinutes = now > lateThreshold
                ? (int)(now - lateThreshold).TotalMinutes
                : 0;
        }
        else
        {
            existing.LateMinutes = 0;
        }

        await _context.SaveChangesAsync(ct);

        return existing;
    }

    public async Task<AttendanceLog> TimeOutAsync(ClaimsPrincipal user, CancellationToken ct)
    {
        var employee = await ResolveEmployee(user, ct);

        var nowUtc = DateTime.UtcNow;
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, ManilaTimeZone);

        var today = DateOnly.FromDateTime(nowLocal);
        var now = TimeOnly.FromDateTime(nowLocal);

        var existing = await _context.AttendanceLogs
            .FirstOrDefaultAsync(x => x.EmployeeId == employee.Id && x.Date == today, ct);

        if (existing == null || existing.TimeIn == null)
            throw new ApiException("No time-in record.");

        if (existing.TimeOut != null)
            throw new ApiException("Already timed out.");

        var shiftDay = await GetCurrentShiftDay(employee.Id, today, ct);

        if (!shiftDay.IsWorkingDay)
            throw new ApiException("Today is not a working day.", StatusCodes.Status400BadRequest);

        existing.TimeOut = now;
        existing.UpdatedAtUtc = nowUtc;

        var renderedMinutes = (int)(now - existing.TimeIn.Value).TotalMinutes;

        var breakOverlapMinutes = CalculateBreakOverlapMinutes(
            existing.TimeIn.Value,
            now,
            shiftDay.BreakStartTime,
            shiftDay.BreakEndTime);

        renderedMinutes -= breakOverlapMinutes;

        if (renderedMinutes < 0)
            renderedMinutes = 0;

        existing.RenderedMinutes = renderedMinutes;

        var requiredMinutes = 0;

        if (shiftDay.StartTime.HasValue && shiftDay.EndTime.HasValue)
        {
            requiredMinutes = (int)(shiftDay.EndTime.Value - shiftDay.StartTime.Value).TotalMinutes;

            var scheduledBreakMinutes = CalculateBreakOverlapMinutes(
                shiftDay.StartTime.Value,
                shiftDay.EndTime.Value,
                shiftDay.BreakStartTime,
                shiftDay.BreakEndTime);

            requiredMinutes -= scheduledBreakMinutes;
        }

        if (requiredMinutes < 0)
            requiredMinutes = 0;

        if (renderedMinutes < requiredMinutes)
        {
            existing.UndertimeMinutes = requiredMinutes - renderedMinutes;
            existing.OvertimeMinutes = 0;
        }
        else if (renderedMinutes > requiredMinutes)
        {
            existing.UndertimeMinutes = 0;
            existing.OvertimeMinutes = renderedMinutes - requiredMinutes;
        }
        else
        {
            existing.UndertimeMinutes = 0;
            existing.OvertimeMinutes = 0;
        }

        await _context.SaveChangesAsync(ct);

        return existing;
    }

    public async Task<PagedAttendanceLogsResponse> GetLogsAsync(GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var baseQuery = BuildAttendanceQuery(query, includeMonitoringFilters: false);

        var totalCount = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AttendanceLogDto
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                EmployeeName = BuildEmployeeName(
                    x.Employee.FirstName,
                    x.Employee.MiddleName,
                    x.Employee.LastName),
                Date = x.Date,
                TimeIn = x.TimeIn,
                TimeOut = x.TimeOut,
                LateMinutes = x.LateMinutes,
                UndertimeMinutes = x.UndertimeMinutes,
                OvertimeMinutes = x.OvertimeMinutes,
                RenderedMinutes = x.RenderedMinutes,
                IsPresent = x.IsPresent
            })
            .ToListAsync(ct);

        return new PagedAttendanceLogsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PagedAttendanceLogsResponse> GetMonitoringAsync(GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var baseQuery = BuildAttendanceQuery(query, includeMonitoringFilters: true);

        var totalCount = await baseQuery.CountAsync(ct);

        var items = await baseQuery
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new AttendanceLogDto
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                EmployeeName = BuildEmployeeName(
                    x.Employee.FirstName,
                    x.Employee.MiddleName,
                    x.Employee.LastName),
                Date = x.Date,
                TimeIn = x.TimeIn,
                TimeOut = x.TimeOut,
                LateMinutes = x.LateMinutes,
                UndertimeMinutes = x.UndertimeMinutes,
                OvertimeMinutes = x.OvertimeMinutes,
                RenderedMinutes = x.RenderedMinutes,
                IsPresent = x.IsPresent
            })
            .ToListAsync(ct);

        return new PagedAttendanceLogsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AttendanceSummaryDto> GetSummaryAsync(GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var logs = _context.AttendanceLogs
            .AsNoTracking()
            .AsQueryable();

        if (query.DateFrom.HasValue)
            logs = logs.Where(x => x.Date >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            logs = logs.Where(x => x.Date <= query.DateTo.Value);

        if (query.EmployeeId.HasValue)
            logs = logs.Where(x => x.EmployeeId == query.EmployeeId.Value);

        var totalRecords = await logs.CountAsync(ct);

        var presentCount = await logs
            .Where(x => x.IsPresent)
            .CountAsync(ct);

        var lateCount = await logs
            .Where(x => x.LateMinutes > 0)
            .CountAsync(ct);

        var undertimeCount = await logs
            .Where(x => x.UndertimeMinutes > 0)
            .CountAsync(ct);

        var overtimeCount = await logs
            .Where(x => x.OvertimeMinutes > 0)
            .CountAsync(ct);

        var overtimeRequests = _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.AttendanceLog)
            .AsQueryable();

        if (query.DateFrom.HasValue)
            overtimeRequests = overtimeRequests.Where(x => x.AttendanceLog.Date >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            overtimeRequests = overtimeRequests.Where(x => x.AttendanceLog.Date <= query.DateTo.Value);

        if (query.EmployeeId.HasValue)
            overtimeRequests = overtimeRequests.Where(x => x.EmployeeId == query.EmployeeId.Value);

        var pendingOvertimeRequests = await overtimeRequests
            .Where(x => x.Status == "Pending")
            .CountAsync(ct);

        var approvedOvertimeRequests = await overtimeRequests
            .Where(x => x.Status == "Approved")
            .CountAsync(ct);

        return new AttendanceSummaryDto
        {
            TotalRecords = totalRecords,
            PresentCount = presentCount,
            LateCount = lateCount,
            UndertimeCount = undertimeCount,
            OvertimeCount = overtimeCount,
            PendingOvertimeRequests = pendingOvertimeRequests,
            ApprovedOvertimeRequests = approvedOvertimeRequests
        };
    }

    public async Task<byte[]> ExportCsvAsync(GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var items = await BuildAttendanceQuery(query, includeMonitoringFilters: true)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Select(x => new AttendanceLogDto
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                EmployeeName = BuildEmployeeName(
                    x.Employee.FirstName,
                    x.Employee.MiddleName,
                    x.Employee.LastName),
                Date = x.Date,
                TimeIn = x.TimeIn,
                TimeOut = x.TimeOut,
                LateMinutes = x.LateMinutes,
                UndertimeMinutes = x.UndertimeMinutes,
                OvertimeMinutes = x.OvertimeMinutes,
                RenderedMinutes = x.RenderedMinutes,
                IsPresent = x.IsPresent
            })
            .ToListAsync(ct);

        var sb = new StringBuilder();

        sb.AppendLine("EmployeeNumber,EmployeeName,Date,TimeIn,TimeOut,LateMinutes,UndertimeMinutes,OvertimeMinutes,RenderedMinutes,IsPresent");

        foreach (var item in items)
        {
            sb.AppendLine(string.Join(",",
                EscapeCsv(item.EmployeeNumber),
                EscapeCsv(item.EmployeeName),
                item.Date.ToString("yyyy-MM-dd"),
                item.TimeIn?.ToString("HH:mm:ss") ?? "",
                item.TimeOut?.ToString("HH:mm:ss") ?? "",
                item.LateMinutes,
                item.UndertimeMinutes,
                item.OvertimeMinutes,
                item.RenderedMinutes,
                item.IsPresent ? "Yes" : "No"));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    private IQueryable<AttendanceLog> BuildAttendanceQuery(GetAttendanceLogsQuery query, bool includeMonitoringFilters)
    {
        var baseQuery = _context.AttendanceLogs
            .AsNoTracking()
            .Include(x => x.Employee)
            .AsQueryable();

        if (query.EmployeeId.HasValue)
            baseQuery = baseQuery.Where(x => x.EmployeeId == query.EmployeeId.Value);

        if (query.DateFrom.HasValue)
            baseQuery = baseQuery.Where(x => x.Date >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            baseQuery = baseQuery.Where(x => x.Date <= query.DateTo.Value);

        if (query.IsPresent.HasValue)
            baseQuery = baseQuery.Where(x => x.IsPresent == query.IsPresent.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            baseQuery = baseQuery.Where(x =>
                x.Employee.EmployeeNumber.ToLower().Contains(search) ||
                x.Employee.FirstName.ToLower().Contains(search) ||
                x.Employee.LastName.ToLower().Contains(search));
        }

        if (includeMonitoringFilters)
        {
            if (query.HasLate == true)
                baseQuery = baseQuery.Where(x => x.LateMinutes > 0);

            if (query.HasUndertime == true)
                baseQuery = baseQuery.Where(x => x.UndertimeMinutes > 0);
        }

        return baseQuery;
    }

    private async Task<Employee> ResolveEmployee(ClaimsPrincipal user, CancellationToken ct)
    {
        var userIdRaw =
            user.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user.FindFirstValue("sub");

        if (!long.TryParse(userIdRaw, out var userId))
            throw new ApiException("Invalid user.", StatusCodes.Status401Unauthorized);

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);

        if (employee == null)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        return employee;
    }

    private async Task<ShiftDay> GetCurrentShiftDay(Guid employeeId, DateOnly workDate, CancellationToken ct)
    {
        var assignment = await _context.EmployeeShiftAssignments
            .AsNoTracking()
            .Include(x => x.Shift)
            .ThenInclude(x => x.ShiftDays)
            .Where(x =>
                x.EmployeeId == employeeId &&
                x.IsActive &&
                x.EffectiveFrom <= workDate &&
                (!x.EffectiveTo.HasValue || x.EffectiveTo.Value >= workDate))
            .OrderByDescending(x => x.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        if (assignment == null)
            throw new ApiException("No active shift.", StatusCodes.Status400BadRequest);

        var dayOfWeek = workDate.ToDateTime(TimeOnly.MinValue).DayOfWeek;

        var shiftDay = assignment.Shift.ShiftDays
            .FirstOrDefault(x => x.DayOfWeek == dayOfWeek);

        if (shiftDay == null)
            throw new ApiException("Shift day configuration not found.", StatusCodes.Status400BadRequest);

        return shiftDay;
    }

    private static int CalculateBreakOverlapMinutes(
        TimeOnly actualStart,
        TimeOnly actualEnd,
        TimeOnly? breakStart,
        TimeOnly? breakEnd)
    {
        if (!breakStart.HasValue || !breakEnd.HasValue)
            return 0;

        if (actualEnd <= actualStart)
            return 0;

        var overlapStart = actualStart > breakStart.Value ? actualStart : breakStart.Value;
        var overlapEnd = actualEnd < breakEnd.Value ? actualEnd : breakEnd.Value;

        if (overlapEnd <= overlapStart)
            return 0;

        return (int)(overlapEnd - overlapStart).TotalMinutes;
    }

    private static string BuildEmployeeName(string? firstName, string? middleName, string? lastName)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(firstName))
            parts.Add(firstName.Trim());

        if (!string.IsNullOrWhiteSpace(middleName))
            parts.Add(middleName.Trim());

        if (!string.IsNullOrWhiteSpace(lastName))
            parts.Add(lastName.Trim());

        return string.Join(" ", parts);
    }

    private static string EscapeCsv(string? value)
    {
        if (string.IsNullOrEmpty(value))
            return "";

        if (value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }

        return value;
    }
}
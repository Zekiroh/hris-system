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
    private readonly IAttendanceHolidayProvider _holidayProvider;
    private static readonly TimeZoneInfo ManilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

    public AttendanceLogsService(AppDbContext context, IAttendanceHolidayProvider holidayProvider)
    {
        _context = context;
        _holidayProvider = holidayProvider;
    }

    public async Task<AttendanceLogDto> TimeInAsync(ClaimsPrincipal user, TimeInRequest request, CancellationToken ct)
    {
        var employee = await ResolveEmployee(user, ct);

        var nowUtc = DateTime.UtcNow;
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, ManilaTimeZone);

        var today = DateOnly.FromDateTime(nowLocal);
        var now = TimeOnly.FromDateTime(nowLocal);
        var holidayName = _holidayProvider.GetHolidayName(today);

        var existing = await _context.AttendanceLogs
            .FirstOrDefaultAsync(x => x.EmployeeId == employee.Id && x.Date == today, ct);

        if (existing != null && existing.TimeIn != null)
            throw new ApiException("Already timed in.");

        if (!string.IsNullOrWhiteSpace(holidayName))
            throw new ApiException("Holiday. Work is not required today.", StatusCodes.Status400BadRequest);

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
                Date = today,
                CreatedAtUtc = nowUtc
            };

            _context.AttendanceLogs.Add(existing);
        }

        existing.TimeIn = now;
        existing.IsPresent = true;
        existing.Task = NormalizeNullableText(request.Task);
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

        existing.UndertimeMinutes = 0;
        existing.OvertimeMinutes = 0;
        existing.RenderedMinutes = 0;

        await _context.SaveChangesAsync(ct);

        return await GetAttendanceLogDtoByIdAsync(existing.Id, ct);
    }

    public async Task<AttendanceLogDto> TimeOutAsync(ClaimsPrincipal user, TimeOutRequest request, CancellationToken ct)
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
        existing.Accomplished = NormalizeNullableText(request.Accomplished);
        existing.UpdatedAtUtc = nowUtc;

        RecalculateAttendanceFields(existing, shiftDay, includeOvertime: true);

        await _context.SaveChangesAsync(ct);

        return await GetAttendanceLogDtoByIdAsync(existing.Id, ct);
    }

    public async Task<PagedAttendanceLogsResponse> GetMyLogsAsync(ClaimsPrincipal user, GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var employee = await ResolveEmployee(user, ct);

        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var scopedQuery = new GetAttendanceLogsQuery
        {
            EmployeeId = employee.Id,
            DateFrom = query.DateFrom,
            DateTo = query.DateTo,
            IsPresent = query.IsPresent,
            Search = query.Search,
            Page = page,
            PageSize = pageSize,
            HasLate = query.HasLate,
            HasUndertime = query.HasUndertime
        };

        var baseQuery = BuildAttendanceQuery(scopedQuery, includeMonitoringFilters: false);

        var totalCount = await baseQuery.CountAsync(ct);

        var logs = await baseQuery
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = logs.Select(MapToDto).ToList();

        await EnrichOvertimeStatusesAsync(items, ct);

        return new PagedAttendanceLogsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<AttendanceLogDto?> GetTodayMyLogAsync(ClaimsPrincipal user, CancellationToken ct)
    {
        var employee = await ResolveEmployee(user, ct);

        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ManilaTimeZone);
        var today = DateOnly.FromDateTime(nowLocal);
        var now = TimeOnly.FromDateTime(nowLocal);

        var holidayName = _holidayProvider.GetHolidayName(today);
        var isHoliday = !string.IsNullOrWhiteSpace(holidayName);

        var shiftDay = await GetCurrentShiftDay(employee.Id, today, ct);

        var todayLog = await _context.AttendanceLogs
            .AsNoTracking()
            .Include(x => x.Employee)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.EmployeeId == employee.Id && x.Date == today, ct);

        var item = todayLog == null ? null : MapToDto(todayLog);

        var canTimeIn = true;
        string? blockReason = null;

        if (isHoliday)
        {
            canTimeIn = false;
            blockReason = "Holiday. Work is not required today.";
        }
        else if (!shiftDay.IsWorkingDay)
        {
            canTimeIn = false;
            blockReason = "Today is not part of your scheduled working days. Time in is unavailable.";
        }
        else if (shiftDay.BreakStartTime.HasValue &&
                 shiftDay.BreakEndTime.HasValue &&
                 now >= shiftDay.BreakStartTime.Value &&
                 now < shiftDay.BreakEndTime.Value)
        {
            canTimeIn = false;
            blockReason = "You cannot time in during break time.";
        }
        else if (shiftDay.EndTime.HasValue && now >= shiftDay.EndTime.Value)
        {
            canTimeIn = false;
            blockReason = "You cannot time in after shift end.";
        }

        if (item == null)
        {
            item = new AttendanceLogDto
            {
                Id = 0,
                EmployeeId = employee.Id,
                EmployeeNumber = employee.EmployeeNumber ?? string.Empty,
                EmployeeName = BuildEmployeeName(
                    employee.FirstName,
                    employee.MiddleName,
                    employee.LastName,
                    employee.User?.Suffix),
                EmployeeSuffix = employee.User?.Suffix,
                Date = today,
                TimeIn = null,
                TimeOut = null,
                LateMinutes = 0,
                UndertimeMinutes = 0,
                OvertimeMinutes = 0,
                OvertimeStatus = "None",
                RenderedMinutes = 0,
                IsPresent = false,
                Task = null,
                Accomplished = null,
                IsWorkingDay = shiftDay.IsWorkingDay,
                CanTimeIn = canTimeIn,
                BlockReason = blockReason,
                IsHoliday = isHoliday,
                HolidayName = holidayName
            };

            await EnrichOvertimeStatusAsync(item, ct);
            return item;
        }

        item.IsWorkingDay = shiftDay.IsWorkingDay;
        item.CanTimeIn = canTimeIn;
        item.BlockReason = blockReason;
        item.IsHoliday = isHoliday;
        item.HolidayName = holidayName;

        await EnrichOvertimeStatusAsync(item, ct);

        return item;
    }

    public async Task<PagedAttendanceLogsResponse> GetLogsAsync(GetAttendanceLogsQuery query, CancellationToken ct)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var baseQuery = BuildAttendanceQuery(query, includeMonitoringFilters: false);

        var totalCount = await baseQuery.CountAsync(ct);

        var logs = await baseQuery
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = logs.Select(MapToDto).ToList();

        await EnrichOvertimeStatusesAsync(items, ct);

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

        var logs = await baseQuery
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = logs.Select(MapToDto).ToList();

        await EnrichOvertimeStatusesAsync(items, ct);

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
            .Where(log => _context.OvertimeRequests
                .AsNoTracking()
                .Any(request =>
                    request.EmployeeId == log.EmployeeId &&
                    request.Status == "Approved" &&
                    request.DateFrom <= log.Date &&
                    request.DateTo >= log.Date))
            .CountAsync(ct);

        var overtimeRequests = _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.Items)
            .AsQueryable();

        if (query.DateFrom.HasValue)
            overtimeRequests = overtimeRequests.Where(x => x.DateTo >= query.DateFrom.Value);

        if (query.DateTo.HasValue)
            overtimeRequests = overtimeRequests.Where(x => x.DateFrom <= query.DateTo.Value);

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
        var logs = await BuildAttendanceQuery(query, includeMonitoringFilters: true)
            .OrderByDescending(x => x.Date)
            .ThenByDescending(x => x.TimeIn)
            .ToListAsync(ct);

        var items = logs.Select(MapToDto).ToList();

        await EnrichOvertimeStatusesAsync(items, ct);

        var sb = new StringBuilder();

        sb.AppendLine("EmployeeNumber,EmployeeName,Date,TimeIn,TimeOut,LateMinutes,UndertimeMinutes,OvertimeMinutes,OvertimeStatus,RenderedMinutes,IsPresent,Task,Accomplished");

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
                EscapeCsv(item.OvertimeStatus),
                item.RenderedMinutes,
                item.IsPresent ? "Yes" : "No",
                EscapeCsv(item.Task),
                EscapeCsv(item.Accomplished)));
        }

        return Encoding.UTF8.GetBytes(sb.ToString());
    }

    public async Task<AttendanceLogDto> UpdateAsync(long id, UpdateAttendanceLogRequest request, CancellationToken ct)
    {
        var attendanceLog = await _context.AttendanceLogs
            .Include(x => x.Employee)
            .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (attendanceLog == null)
            throw new ApiException("Attendance log not found.", StatusCodes.Status404NotFound);

        var shiftDay = await GetCurrentShiftDay(attendanceLog.EmployeeId, request.Date, ct);

        attendanceLog.Date = request.Date;
        attendanceLog.TimeIn = request.TimeIn.HasValue
            ? TimeOnly.FromTimeSpan(request.TimeIn.Value)
            : null;
        attendanceLog.TimeOut = request.TimeOut.HasValue
            ? TimeOnly.FromTimeSpan(request.TimeOut.Value)
            : null;
        attendanceLog.Task = NormalizeNullableText(request.Task);
        attendanceLog.Accomplished = NormalizeNullableText(request.Accomplished);
        attendanceLog.IsPresent = !string.Equals(request.Status, "Absent", StringComparison.OrdinalIgnoreCase)
            && request.TimeIn.HasValue;
        attendanceLog.UpdatedAtUtc = DateTime.UtcNow;

        RecalculateAttendanceFields(attendanceLog, shiftDay, request.IsOT);

        await _context.SaveChangesAsync(ct);

        var dto = MapToDto(attendanceLog);
        await EnrichOvertimeStatusAsync(dto, ct);

        return dto;
    }

    private async Task<AttendanceLogDto> GetAttendanceLogDtoByIdAsync(long id, CancellationToken ct)
    {
        var attendanceLog = await _context.AttendanceLogs
            .AsNoTracking()
            .Include(x => x.Employee)
            .ThenInclude(x => x.User)
            .FirstAsync(x => x.Id == id, ct);

        var dto = MapToDto(attendanceLog);

        await EnrichOvertimeStatusAsync(dto, ct);

        return dto;
    }

    private IQueryable<AttendanceLog> BuildAttendanceQuery(GetAttendanceLogsQuery query, bool includeMonitoringFilters)
    {
        var baseQuery = _context.AttendanceLogs
            .AsNoTracking()
            .Include(x => x.Employee)
            .ThenInclude(x => x.User)
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
                (x.Employee.EmployeeNumber != null && x.Employee.EmployeeNumber.ToLower().Contains(search)) ||
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
            .Include(x => x.User)
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

    private void RecalculateAttendanceFields(AttendanceLog attendanceLog, ShiftDay shiftDay, bool includeOvertime)
    {
        if (!attendanceLog.TimeIn.HasValue)
        {
            attendanceLog.TimeOut = null;
            attendanceLog.LateMinutes = 0;
            attendanceLog.UndertimeMinutes = 0;
            attendanceLog.OvertimeMinutes = 0;
            attendanceLog.RenderedMinutes = 0;
            attendanceLog.IsPresent = false;
            return;
        }

        attendanceLog.IsPresent = true;

        if (shiftDay.StartTime.HasValue)
        {
            var lateThreshold = shiftDay.StartTime.Value.AddMinutes(shiftDay.Shift.LateGraceMinutes);

            attendanceLog.LateMinutes = attendanceLog.TimeIn.Value > lateThreshold
                ? (int)(attendanceLog.TimeIn.Value - lateThreshold).TotalMinutes
                : 0;
        }
        else
        {
            attendanceLog.LateMinutes = 0;
        }

        if (!attendanceLog.TimeOut.HasValue || attendanceLog.TimeOut.Value <= attendanceLog.TimeIn.Value)
        {
            attendanceLog.UndertimeMinutes = 0;
            attendanceLog.OvertimeMinutes = 0;
            attendanceLog.RenderedMinutes = 0;
            return;
        }

        var renderedMinutes = (int)(attendanceLog.TimeOut.Value - attendanceLog.TimeIn.Value).TotalMinutes;

        var breakOverlapMinutes = CalculateBreakOverlapMinutes(
            attendanceLog.TimeIn.Value,
            attendanceLog.TimeOut.Value,
            shiftDay.BreakStartTime,
            shiftDay.BreakEndTime);

        renderedMinutes -= breakOverlapMinutes;

        if (renderedMinutes < 0)
            renderedMinutes = 0;

        attendanceLog.RenderedMinutes = renderedMinutes;

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
            attendanceLog.UndertimeMinutes = requiredMinutes - renderedMinutes;
            attendanceLog.OvertimeMinutes = 0;
        }
        else if (renderedMinutes > requiredMinutes)
        {
            attendanceLog.UndertimeMinutes = 0;
            attendanceLog.OvertimeMinutes = includeOvertime
                ? renderedMinutes - requiredMinutes
                : 0;
        }
        else
        {
            attendanceLog.UndertimeMinutes = 0;
            attendanceLog.OvertimeMinutes = 0;
        }
    }

    private async Task EnrichOvertimeStatusAsync(AttendanceLogDto item, CancellationToken ct)
    {
        var matchedRequest = await _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.Items)
            .Where(x =>
                x.EmployeeId == item.EmployeeId &&
                x.DateFrom <= item.Date &&
                x.DateTo >= item.Date &&
                (x.Status == "Approved" || x.Status == "Pending"))
            .OrderByDescending(x => x.Status == "Approved")
            .ThenByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        item.OvertimeStatus = matchedRequest?.Status ?? "None";
    }

    private async Task EnrichOvertimeStatusesAsync(List<AttendanceLogDto> items, CancellationToken ct)
    {
        if (items.Count == 0)
            return;

        var employeeIds = items
            .Select(x => x.EmployeeId)
            .Distinct()
            .ToList();

        var minDate = items.Min(x => x.Date);
        var maxDate = items.Max(x => x.Date);

        var overtimeRequests = await _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.Items)
            .Where(x =>
                employeeIds.Contains(x.EmployeeId) &&
                x.DateFrom <= maxDate &&
                x.DateTo >= minDate &&
                (x.Status == "Approved" || x.Status == "Pending"))
            .ToListAsync(ct);

        foreach (var item in items)
        {
            var matchedRequests = overtimeRequests
                .Where(x =>
                    x.EmployeeId == item.EmployeeId &&
                    x.DateFrom <= item.Date &&
                    x.DateTo >= item.Date)
                .ToList();

            if (matchedRequests.Any(x => x.Status == "Approved"))
            {
                item.OvertimeStatus = "Approved";
            }
            else if (matchedRequests.Any(x => x.Status == "Pending"))
            {
                item.OvertimeStatus = "Pending";
            }
            else
            {
                item.OvertimeStatus = "None";
            }
        }
    }

    private static AttendanceLogDto MapToDto(AttendanceLog x)
    {
        return new AttendanceLogDto
        {
            Id = x.Id,
            EmployeeId = x.EmployeeId,
            EmployeeNumber = x.Employee.EmployeeNumber ?? string.Empty,
            EmployeeName = BuildEmployeeName(
                x.Employee.FirstName,
                x.Employee.MiddleName,
                x.Employee.LastName,
                x.Employee.User != null ? x.Employee.User.Suffix : null),
            EmployeeSuffix = x.Employee.User != null ? x.Employee.User.Suffix : null,
            Date = x.Date,
            TimeIn = x.TimeIn,
            TimeOut = x.TimeOut,
            LateMinutes = x.LateMinutes,
            UndertimeMinutes = x.UndertimeMinutes,
            OvertimeMinutes = x.OvertimeMinutes,
            OvertimeStatus = "None",
            RenderedMinutes = x.RenderedMinutes,
            IsPresent = x.IsPresent,
            Task = x.Task,
            Accomplished = x.Accomplished
        };
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

    private static string BuildEmployeeName(
        string? firstName,
        string? middleName,
        string? lastName,
        string? suffix)
    {
        var normalizedFirstName = NormalizeNullableText(firstName);
        var normalizedMiddleName = NormalizeNullableText(middleName);
        var normalizedLastName = NormalizeNullableText(lastName);
        var normalizedSuffix = NormalizeNullableText(suffix);

        var middleInitial = string.IsNullOrWhiteSpace(normalizedMiddleName)
            ? null
            : $"{char.ToUpperInvariant(normalizedMiddleName[0])}.";

        var givenName = string.Join(" ", new[] { normalizedFirstName, middleInitial }
            .Where(x => !string.IsNullOrWhiteSpace(x)));

        var displayName = string.IsNullOrWhiteSpace(normalizedLastName)
            ? givenName
            : string.IsNullOrWhiteSpace(givenName)
                ? normalizedLastName
                : $"{normalizedLastName}, {givenName}";

        if (!string.IsNullOrWhiteSpace(normalizedSuffix))
        {
            displayName = string.IsNullOrWhiteSpace(displayName)
                ? normalizedSuffix
                : $"{displayName}, {normalizedSuffix}";
        }

        return string.IsNullOrWhiteSpace(displayName) ? "Unknown Employee" : displayName;
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

    private static string? NormalizeNullableText(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        return value.Trim();
    }
}
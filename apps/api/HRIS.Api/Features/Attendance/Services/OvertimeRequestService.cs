using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public class OvertimeRequestService
{
    private readonly AppDbContext _context;

    private const int MaxEmployeeOtMinutes = 180;
    private const int MaxAdminOtMinutes = 600;
    private static readonly TimeZoneInfo ManilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

    public OvertimeRequestService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedOvertimeRequestsResponse> GetAllAsync(GetOvertimeRequestsQuery query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var overtimeQuery = _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.Items)
            .Include(x => x.ReviewedByUser)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();

            overtimeQuery = overtimeQuery.Where(x =>
                x.Employee.EmployeeNumber.ToLower().Contains(search) ||
                x.Employee.FirstName.ToLower().Contains(search) ||
                x.Employee.LastName.ToLower().Contains(search) ||
                (x.Employee.FirstName + " " + x.Employee.LastName).ToLower().Contains(search));
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim();
            overtimeQuery = overtimeQuery.Where(x => x.Status == status);
        }

        if (query.DateFrom.HasValue)
        {
            overtimeQuery = overtimeQuery.Where(x => x.DateTo >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            overtimeQuery = overtimeQuery.Where(x => x.DateFrom <= query.DateTo.Value);
        }

        var totalCount = await overtimeQuery.CountAsync();

        var rawItems = await overtimeQuery
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                FirstName = x.Employee.FirstName,
                LastName = x.Employee.LastName,
                x.DateFrom,
                x.DateTo,
                RequestedMinutes = x.Items.Sum(i => i.RequestedMinutes),
                x.Reason,
                x.Status,
                x.ReviewedByUserId,
                ReviewedByName = x.ReviewedByUser != null ? x.ReviewedByUser.FullName : null,
                x.ReviewedAtUtc,
                x.ReviewRemarks,
                x.CreatedAtUtc,
                x.UpdatedAtUtc
            })
            .ToListAsync();

        var items = rawItems.Select(x => new OvertimeRequestDto
        {
            Id = x.Id,
            EmployeeId = x.EmployeeId,
            EmployeeNumber = x.EmployeeNumber,
            EmployeeName = BuildEmployeeName(x.FirstName, x.LastName),

            // Transitional mapping while DTO is still v1-shaped.
            AttendanceDate = x.DateFrom,

            RequestedMinutes = x.RequestedMinutes,
            Reason = x.Reason,
            Status = x.Status,
            ReviewedByUserId = x.ReviewedByUserId,
            ReviewedByName = x.ReviewedByName,
            ReviewedAtUtc = x.ReviewedAtUtc,
            ReviewRemarks = x.ReviewRemarks,
            CreatedAtUtc = x.CreatedAtUtc,
            UpdatedAtUtc = x.UpdatedAtUtc
        }).ToList();

        return new PagedOvertimeRequestsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<PagedOvertimeRequestsResponse> GetMineAsync(long userId, GetOvertimeRequestsQuery query)
    {
        var page = query.Page < 1 ? 1 : query.Page;
        var pageSize = query.PageSize < 1 ? 10 : query.PageSize;

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (employee == null)
            throw new ApiException("No linked employee profile found.", StatusCodes.Status400BadRequest);

        var overtimeQuery = _context.OvertimeRequests
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.Items)
            .Include(x => x.ReviewedByUser)
            .Where(x => x.EmployeeId == employee.Id)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            var status = query.Status.Trim();
            overtimeQuery = overtimeQuery.Where(x => x.Status == status);
        }

        if (query.DateFrom.HasValue)
        {
            overtimeQuery = overtimeQuery.Where(x => x.DateTo >= query.DateFrom.Value);
        }

        if (query.DateTo.HasValue)
        {
            overtimeQuery = overtimeQuery.Where(x => x.DateFrom <= query.DateTo.Value);
        }

        var totalCount = await overtimeQuery.CountAsync();

        var rawItems = await overtimeQuery
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new
            {
                x.Id,
                x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                FirstName = x.Employee.FirstName,
                LastName = x.Employee.LastName,
                x.DateFrom,
                x.DateTo,
                RequestedMinutes = x.Items.Sum(i => i.RequestedMinutes),
                x.Reason,
                x.Status,
                x.ReviewedByUserId,
                ReviewedByName = x.ReviewedByUser != null ? x.ReviewedByUser.FullName : null,
                x.ReviewedAtUtc,
                x.ReviewRemarks,
                x.CreatedAtUtc,
                x.UpdatedAtUtc
            })
            .ToListAsync();

        var items = rawItems.Select(x => new OvertimeRequestDto
        {
            Id = x.Id,
            EmployeeId = x.EmployeeId,
            EmployeeNumber = x.EmployeeNumber,
            EmployeeName = BuildEmployeeName(x.FirstName, x.LastName),

            // Transitional mapping while DTO is still v1-shaped.
            AttendanceDate = x.DateFrom,

            RequestedMinutes = x.RequestedMinutes,
            Reason = x.Reason,
            Status = x.Status,
            ReviewedByUserId = x.ReviewedByUserId,
            ReviewedByName = x.ReviewedByName,
            ReviewedAtUtc = x.ReviewedAtUtc,
            ReviewRemarks = x.ReviewRemarks,
            CreatedAtUtc = x.CreatedAtUtc,
            UpdatedAtUtc = x.UpdatedAtUtc
        }).ToList();

        return new PagedOvertimeRequestsResponse
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task SubmitAsync(long userId, SubmitOvertimeRequest request)
    {
        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (employee == null)
            throw new ApiException("No linked employee profile found.", StatusCodes.Status400BadRequest);

        ValidateEmployeeRequestedMinutes(request.RequestedMinutes);

        if (request.DateFrom > request.DateTo)
        {
            throw new ApiException(
                "Date From cannot be later than Date To.",
                StatusCodes.Status400BadRequest);
        }

        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ManilaTimeZone);
        var today = DateOnly.FromDateTime(nowLocal);
        var nowTime = TimeOnly.FromDateTime(nowLocal);

        var requestOpen = new TimeOnly(13, 0);
        var requestClose = new TimeOnly(16, 30);

        if (nowTime < requestOpen)
        {
            throw new ApiException(
                "Overtime requests open at 1:00 PM.",
                StatusCodes.Status400BadRequest);
        }

        if (nowTime > requestClose)
        {
            throw new ApiException(
                "Overtime requests are closed after 4:30 PM.",
                StatusCodes.Status400BadRequest);
        }

        if (request.DateFrom != today || request.DateTo != today)
        {
            throw new ApiException(
                "Overtime request is currently allowed only for today.",
                StatusCodes.Status400BadRequest);
        }

        var attendance = await _context.AttendanceLogs
            .AsNoTracking()
            .Where(x =>
                x.EmployeeId == employee.Id &&
                x.Date >= request.DateFrom &&
                x.Date <= request.DateTo)
            .ToListAsync();

        if (attendance.Count == 0)
            throw new ApiException("No attendance records found for the selected date range.", StatusCodes.Status404NotFound);

        var attendanceByDate = attendance.ToDictionary(x => x.Date);

        var items = new List<OvertimeRequestItem>();

        for (var date = request.DateFrom; date <= request.DateTo; date = date.AddDays(1))
        {
            if (!attendanceByDate.TryGetValue(date, out var attendanceLog))
            {
                throw new ApiException(
                    $"Attendance record not found for {date:yyyy-MM-dd}.",
                    StatusCodes.Status404NotFound);
            }

            var shiftDay = await GetCurrentShiftDay(employee.Id, date);

            if (!shiftDay.IsWorkingDay)
            {
                throw new ApiException(
                    $"Overtime request is not allowed on a non-working day ({date:yyyy-MM-dd}).",
                    StatusCodes.Status400BadRequest);
            }

            if (!shiftDay.EndTime.HasValue)
            {
                throw new ApiException(
                    $"Shift end time is not configured for {date:yyyy-MM-dd}.",
                    StatusCodes.Status400BadRequest);
            }

            var shiftEnd = shiftDay.EndTime.Value;
            var advanceWindowStart = shiftEnd.AddHours(-3);

            var isAfterShiftWithRenderedOt = attendanceLog.OvertimeMinutes > 0;
            var isWithinAdvanceWindow = nowTime >= advanceWindowStart && nowTime <= shiftEnd;

            if (!isAfterShiftWithRenderedOt && !isWithinAdvanceWindow)
            {
                throw new ApiException(
                    "Overtime request is only allowed within 3 hours before shift end or after overtime is rendered.",
                    StatusCodes.Status400BadRequest);
            }

            if (isAfterShiftWithRenderedOt && request.RequestedMinutes > attendanceLog.OvertimeMinutes)
            {
                throw new ApiException(
                    $"Requested minutes exceed computed overtime for {date:yyyy-MM-dd}.",
                    StatusCodes.Status400BadRequest);
            }

            var maxAllowedOtEnd = new TimeOnly(20, 30);
            var maxMinutesUntilCap = GetMaxMinutesUntilCap(shiftEnd, maxAllowedOtEnd);

            if (request.RequestedMinutes > maxMinutesUntilCap)
            {
                throw new ApiException(
                    $"Requested overtime cannot go beyond 8:30 PM for {date:yyyy-MM-dd}.",
                    StatusCodes.Status400BadRequest);
            }

            var hasPendingForSameDate = await _context.OvertimeRequests
                .AsNoTracking()
                .AnyAsync(x =>
                    x.EmployeeId == employee.Id &&
                    x.Status == "Pending" &&
                    x.Items.Any(i => i.Date == date));

            if (hasPendingForSameDate)
            {
                throw new ApiException(
                    $"You already have a pending overtime request for {date:yyyy-MM-dd}.",
                    StatusCodes.Status409Conflict);
            }

            items.Add(new OvertimeRequestItem
            {
                Date = date,
                RequestedMinutes = request.RequestedMinutes,
                AttendanceLogId = attendanceLog.Id,
                CreatedAtUtc = DateTime.UtcNow
            });
        }

        var entity = new OvertimeRequest
        {
            EmployeeId = employee.Id,
            DateFrom = request.DateFrom,
            DateTo = request.DateTo,
            Reason = request.Reason,
            Status = "Pending",
            CreatedAtUtc = DateTime.UtcNow,
            Items = items
        };

        _context.OvertimeRequests.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task AdminAssignAsync(long adminUserId, AdminAssignOvertimeRequest request)
    {
        ValidateAdminRequestedMinutes(request.RequestedMinutes);

        if (request.DateFrom > request.DateTo)
        {
            throw new ApiException(
                "Date From cannot be later than Date To.",
                StatusCodes.Status400BadRequest);
        }

        var attendance = await _context.AttendanceLogs
            .AsNoTracking()
            .Where(x =>
                x.EmployeeId == request.EmployeeId &&
                x.Date >= request.DateFrom &&
                x.Date <= request.DateTo)
            .ToListAsync();

        if (attendance.Count == 0)
        {
            throw new ApiException(
                "No attendance records found for the selected date range.",
                StatusCodes.Status404NotFound);
        }

        var attendanceByDate = attendance.ToDictionary(x => x.Date);

        var items = new List<OvertimeRequestItem>();

        for (var date = request.DateFrom; date <= request.DateTo; date = date.AddDays(1))
        {
            if (!attendanceByDate.TryGetValue(date, out var attendanceLog))
            {
                throw new ApiException(
                    $"Attendance record not found for {date:yyyy-MM-dd}.",
                    StatusCodes.Status404NotFound);
            }

            var exists = await _context.OvertimeRequests
                .AsNoTracking()
                .AnyAsync(x => x.Items.Any(i => i.AttendanceLogId == attendanceLog.Id));

            if (exists)
            {
                throw new ApiException(
                    $"Overtime already assigned/requested for {date:yyyy-MM-dd}.",
                    StatusCodes.Status409Conflict);
            }

            var shiftDay = await GetCurrentShiftDay(request.EmployeeId, date);

            if (!shiftDay.IsWorkingDay)
            {
                throw new ApiException(
                    $"Cannot assign overtime on a non-working day ({date:yyyy-MM-dd}).",
                    StatusCodes.Status400BadRequest);
            }

            if (!shiftDay.EndTime.HasValue)
            {
                throw new ApiException(
                    $"Shift end time is not configured for {date:yyyy-MM-dd}.",
                    StatusCodes.Status400BadRequest);
            }

            var shiftEnd = shiftDay.EndTime.Value;
            var maxAllowedOtEnd = new TimeOnly(20, 30);
            var maxMinutesUntilCap = GetMaxMinutesUntilCap(shiftEnd, maxAllowedOtEnd);

            if (request.RequestedMinutes > maxMinutesUntilCap)
            {
                throw new ApiException(
                    $"Assigned overtime cannot go beyond 8:30 PM for {date:yyyy-MM-dd}.",
                    StatusCodes.Status400BadRequest);
            }

            items.Add(new OvertimeRequestItem
            {
                Date = date,
                RequestedMinutes = request.RequestedMinutes,
                AttendanceLogId = attendanceLog.Id,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            });
        }

        var entity = new OvertimeRequest
        {
            EmployeeId = request.EmployeeId,
            DateFrom = request.DateFrom,
            DateTo = request.DateTo,
            Reason = request.Reason,
            Status = "Approved",
            ReviewedByUserId = adminUserId,
            ReviewedAtUtc = DateTime.UtcNow,
            ReviewRemarks = "Assigned by admin.",
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow,
            Items = items
        };

        _context.OvertimeRequests.Add(entity);
        await _context.SaveChangesAsync();
    }

    public async Task ReviewAsync(long reviewerUserId, int requestId, string action, string? remarks)
    {
        var request = await _context.OvertimeRequests
            .FirstOrDefaultAsync(x => x.Id == requestId);

        if (request == null)
            throw new ApiException("Overtime request not found.", StatusCodes.Status404NotFound);

        if (request.Status != "Pending")
            throw new ApiException("Request already processed.", StatusCodes.Status400BadRequest);

        if (!string.Equals(action, "Approve", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(action, "Reject", StringComparison.OrdinalIgnoreCase))
        {
            throw new ApiException("Invalid action.", StatusCodes.Status400BadRequest);
        }

        request.Status = string.Equals(action, "Approve", StringComparison.OrdinalIgnoreCase)
            ? "Approved"
            : "Rejected";
        request.ReviewedByUserId = reviewerUserId;
        request.ReviewedAtUtc = DateTime.UtcNow;
        request.ReviewRemarks = remarks;
        request.UpdatedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }

    private async Task<ShiftDay> GetCurrentShiftDay(Guid employeeId, DateOnly workDate)
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
            .FirstOrDefaultAsync();

        if (assignment == null)
            throw new ApiException("No active shift.", StatusCodes.Status400BadRequest);

        var dayOfWeek = workDate.ToDateTime(TimeOnly.MinValue).DayOfWeek;

        var shiftDay = assignment.Shift.ShiftDays
            .FirstOrDefault(x => x.DayOfWeek == dayOfWeek);

        if (shiftDay == null)
            throw new ApiException("Shift day configuration not found.", StatusCodes.Status400BadRequest);

        return shiftDay;
    }

    private static int GetMaxMinutesUntilCap(TimeOnly shiftEnd, TimeOnly capEnd)
    {
        if (shiftEnd >= capEnd)
            return 0;

        return (int)(capEnd - shiftEnd).TotalMinutes;
    }

    private static void ValidateEmployeeRequestedMinutes(int requestedMinutes)
    {
        if (requestedMinutes <= 0 || requestedMinutes > MaxEmployeeOtMinutes)
        {
            throw new ApiException(
                $"Requested minutes must be between 1 and {MaxEmployeeOtMinutes}.",
                StatusCodes.Status400BadRequest);
        }
    }

    private static void ValidateAdminRequestedMinutes(int requestedMinutes)
    {
        if (requestedMinutes <= 0 || requestedMinutes > MaxAdminOtMinutes)
        {
            throw new ApiException(
                $"Requested minutes must be between 1 and {MaxAdminOtMinutes}.",
                StatusCodes.Status400BadRequest);
        }
    }

    private static string BuildEmployeeName(string? firstName, string? lastName)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(firstName))
            parts.Add(firstName.Trim());

        if (!string.IsNullOrWhiteSpace(lastName))
            parts.Add(lastName.Trim());

        return string.Join(" ", parts);
    }
}
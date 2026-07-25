using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public sealed class AttendancePayrollInputService : IAttendancePayrollInputService
{
    private const string OvertimeStatusApproved = "Approved";
    private static readonly TimeZoneInfo ManilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

    private readonly AppDbContext _context;
    private readonly IAttendanceHolidayProvider _holidayProvider;

    public AttendancePayrollInputService(
        AppDbContext context,
        IAttendanceHolidayProvider holidayProvider)
    {
        _context = context;
        _holidayProvider = holidayProvider;
    }

    public async Task<IReadOnlyList<PayrollAttendanceInputDto>> GetPayrollInputsAsync(
        IReadOnlyCollection<Guid> employeeIds,
        DateOnly startDate,
        DateOnly endDate,
        CancellationToken ct)
    {
        var scopedEmployeeIds = employeeIds
            .Distinct()
            .ToList();

        if (scopedEmployeeIds.Count == 0)
            return Array.Empty<PayrollAttendanceInputDto>();

        var attendanceLogs = await _context.AttendanceLogs
            .AsNoTracking()
            .Where(log =>
                scopedEmployeeIds.Contains(log.EmployeeId) &&
                log.Date >= startDate &&
                log.Date <= endDate)
            .ToListAsync(ct);

        var assignments = await _context.EmployeeShiftAssignments
            .AsNoTracking()
            .Include(assignment => assignment.Shift)
            .ThenInclude(shift => shift.ShiftDays)
            .Where(assignment =>
                scopedEmployeeIds.Contains(assignment.EmployeeId) &&
                assignment.IsActive &&
                assignment.EffectiveFrom <= endDate &&
                (!assignment.EffectiveTo.HasValue || assignment.EffectiveTo.Value >= startDate) &&
                assignment.Shift.IsActive)
            .ToListAsync(ct);

        var approvedOvertimeRequests = await _context.OvertimeRequests
            .AsNoTracking()
            .Include(overtime => overtime.Items)
            .Where(overtime =>
                scopedEmployeeIds.Contains(overtime.EmployeeId) &&
                overtime.Status == OvertimeStatusApproved &&
                overtime.DateFrom <= endDate &&
                overtime.DateTo >= startDate)
            .ToListAsync(ct);

        var attendanceByKey = attendanceLogs
            .ToDictionary(
                log => (log.EmployeeId, log.Date),
                log => log);

        var assignmentsByEmployee = assignments
            .GroupBy(assignment => assignment.EmployeeId)
            .ToDictionary(
                group => group.Key,
                group => group
                    .OrderByDescending(assignment => assignment.EffectiveFrom)
                    .ThenByDescending(assignment => assignment.Id)
                    .ToList());

        var overtimeRequestsByEmployee = approvedOvertimeRequests
            .GroupBy(overtime => overtime.EmployeeId)
            .ToDictionary(
                group => group.Key,
                group => group
                    .OrderByDescending(overtime => overtime.CreatedAtUtc)
                    .ToList());

        var inputs = new List<PayrollAttendanceInputDto>();
        var nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, ManilaTimeZone);

        foreach (var employeeId in scopedEmployeeIds)
        {
            assignmentsByEmployee.TryGetValue(employeeId, out var employeeAssignments);
            overtimeRequestsByEmployee.TryGetValue(employeeId, out var employeeOvertimeRequests);

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                var shiftDay = ResolveShiftDay(employeeAssignments, date);
                var holidayName = _holidayProvider.GetHolidayName(date);
                var isHoliday = !string.IsNullOrWhiteSpace(holidayName);
                var isScheduledWorkDate = AttendanceCalculationHelper.IsScheduledPayrollWorkDate(shiftDay, isHoliday);

                attendanceByKey.TryGetValue((employeeId, date), out var attendanceLog);

                var isPresent = attendanceLog?.IsPresent == true && isScheduledWorkDate;
                var isAbsent = isScheduledWorkDate &&
                    !isPresent &&
                    AttendanceCalculationHelper.IsFinalizedScheduledWorkDate(date, shiftDay, nowLocal);
                var creditedApprovedOvertimeMinutes = CalculateCreditedApprovedOvertimeMinutes(
                    attendanceLog,
                    shiftDay,
                    employeeOvertimeRequests,
                    date);

                inputs.Add(new PayrollAttendanceInputDto
                {
                    EmployeeId = employeeId,
                    Date = date,
                    IsScheduledWorkDate = isScheduledWorkDate,
                    IsPresent = isPresent,
                    IsAbsent = isAbsent,
                    IsHoliday = isHoliday,
                    HolidayName = holidayName,
                    IsNonRequiredDate = !isScheduledWorkDate,
                    LateMinutes = isPresent ? Math.Max(0, attendanceLog?.LateMinutes ?? 0) : 0,
                    UndertimeMinutes = isPresent ? Math.Max(0, attendanceLog?.UndertimeMinutes ?? 0) : 0,
                    CreditedApprovedOvertimeMinutes = creditedApprovedOvertimeMinutes
                });
            }
        }

        return inputs;
    }

    private static ShiftDay? ResolveShiftDay(
        IReadOnlyCollection<EmployeeShiftAssignment>? assignments,
        DateOnly date)
    {
        var assignment = assignments?
            .Where(x =>
                x.EffectiveFrom <= date &&
                (!x.EffectiveTo.HasValue || x.EffectiveTo.Value >= date))
            .OrderByDescending(x => x.EffectiveFrom)
            .ThenByDescending(x => x.Id)
            .FirstOrDefault();

        if (assignment == null)
            return null;

        return AttendanceCalculationHelper.GetShiftDayForDate(assignment.Shift.ShiftDays, date);
    }

    private static int CalculateCreditedApprovedOvertimeMinutes(
        AttendanceLog? attendanceLog,
        ShiftDay? shiftDay,
        IReadOnlyCollection<OvertimeRequest>? approvedOvertimeRequests,
        DateOnly date)
    {
        if (attendanceLog == null ||
            !attendanceLog.IsPresent ||
            !attendanceLog.TimeIn.HasValue ||
            !attendanceLog.TimeOut.HasValue ||
            attendanceLog.RenderedMinutes <= 0 ||
            shiftDay?.StartTime == null ||
            shiftDay.EndTime == null ||
            approvedOvertimeRequests == null)
        {
            return 0;
        }

        var approvedRequest = approvedOvertimeRequests
            .Where(overtime =>
                overtime.DateFrom <= date &&
                overtime.DateTo >= date)
            .OrderByDescending(overtime => overtime.CreatedAtUtc)
            .FirstOrDefault();

        var approvedMinutes = approvedRequest?.Items
            .FirstOrDefault(item => item.Date == date)
            ?.RequestedMinutes ?? 0;

        if (approvedMinutes <= 0)
            return 0;

        return AttendanceCalculationHelper.CalculateCreditedApprovedOvertimeMinutes(
            attendanceLog.TimeIn,
            attendanceLog.TimeOut,
            attendanceLog.RenderedMinutes,
            shiftDay.StartTime,
            shiftDay.EndTime,
            approvedMinutes);
    }
}

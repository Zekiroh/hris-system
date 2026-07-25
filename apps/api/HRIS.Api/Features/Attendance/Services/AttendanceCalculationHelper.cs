using HRIS.Api.Models;

namespace HRIS.Api.Features.Attendance.Services;

internal static class AttendanceCalculationHelper
{
    public const int MinutesPerDay = 24 * 60;

    public static ShiftDay? GetShiftDayForDate(IEnumerable<ShiftDay> shiftDays, DateOnly date)
    {
        var dayOfWeek = date.ToDateTime(TimeOnly.MinValue).DayOfWeek;

        return shiftDays.FirstOrDefault(day => day.DayOfWeek == dayOfWeek);
    }

    public static ShiftDay? GetWorkingShiftDayForDate(IEnumerable<ShiftDay> shiftDays, DateOnly date)
    {
        var shiftDay = GetShiftDayForDate(shiftDays, date);

        return shiftDay?.IsWorkingDay == true ? shiftDay : null;
    }

    public static bool IsScheduledPayrollWorkDate(ShiftDay? shiftDay, bool isHoliday)
    {
        return !isHoliday &&
               shiftDay?.IsWorkingDay == true &&
               shiftDay.StartTime.HasValue &&
               shiftDay.EndTime.HasValue;
    }

    public static bool IsFinalizedScheduledWorkDate(
        DateOnly date,
        ShiftDay? shiftDay,
        DateTime nowLocal)
    {
        if (shiftDay?.StartTime == null || shiftDay.EndTime == null)
            return false;

        var today = DateOnly.FromDateTime(nowLocal);

        if (date < today)
            return true;

        if (date > today)
            return false;

        return nowLocal > GetShiftEndDateTime(date, shiftDay);
    }

    public static DateTime GetShiftEndDateTime(DateOnly date, ShiftDay shiftDay)
    {
        var shiftEndDateTime = date.ToDateTime(shiftDay.EndTime!.Value);

        if (shiftDay.EndTime.Value <= shiftDay.StartTime!.Value)
            shiftEndDateTime = shiftEndDateTime.AddDays(1);

        return shiftEndDateTime;
    }

    public static int CalculateRequiredShiftMinutes(
        TimeOnly? shiftStart,
        TimeOnly? shiftEnd,
        TimeOnly? breakStart,
        TimeOnly? breakEnd)
    {
        if (!shiftStart.HasValue || !shiftEnd.HasValue)
            return 0;

        var requiredMinutes = CalculateDurationMinutes(shiftStart.Value, shiftEnd.Value);

        var scheduledBreakMinutes = CalculateBreakOverlapMinutes(
            shiftStart.Value,
            shiftEnd.Value,
            breakStart,
            breakEnd);

        requiredMinutes -= scheduledBreakMinutes;

        return Math.Max(0, requiredMinutes);
    }

    public static int CalculateRenderedMinutes(
        TimeOnly timeIn,
        TimeOnly timeOut,
        TimeOnly? breakStart,
        TimeOnly? breakEnd)
    {
        var renderedMinutes = CalculateDurationMinutes(timeIn, timeOut);

        renderedMinutes -= CalculateBreakOverlapMinutes(
            timeIn,
            timeOut,
            breakStart,
            breakEnd);

        return Math.Max(0, renderedMinutes);
    }

    public static int CalculateRegularCreditedMinutes(
        TimeOnly timeIn,
        TimeOnly timeOut,
        TimeOnly? shiftStart,
        TimeOnly? shiftEnd,
        TimeOnly? breakStart,
        TimeOnly? breakEnd,
        int lateGraceMinutes)
    {
        if (!shiftStart.HasValue || !shiftEnd.HasValue)
            return 0;

        var shiftStartMinute = ToMinuteOfDay(shiftStart.Value);
        var shiftEndMinute = NormalizeEndMinute(shiftStart.Value, shiftEnd.Value);
        var actualStartMinute = NormalizeCurrentMinute(timeIn, shiftStart.Value, shiftEnd.Value);
        var actualEndMinute = NormalizeCurrentMinute(timeOut, shiftStart.Value, shiftEnd.Value);

        if (actualEndMinute <= actualStartMinute)
            actualEndMinute = NormalizeEndMinute(timeIn, timeOut);

        var lateThresholdMinute = shiftStartMinute + Math.Max(0, lateGraceMinutes);
        var creditedStartMinute = actualStartMinute <= lateThresholdMinute
            ? shiftStartMinute
            : Math.Max(actualStartMinute, shiftStartMinute);

        var creditedEndMinute = Math.Min(actualEndMinute, shiftEndMinute);

        if (creditedEndMinute <= creditedStartMinute)
            return 0;

        var creditedMinutes = creditedEndMinute - creditedStartMinute;

        creditedMinutes -= CalculateBreakOverlapMinutes(
            creditedStartMinute,
            creditedEndMinute,
            breakStart,
            breakEnd,
            shiftStartMinute,
            shiftEndMinute);

        return Math.Max(0, creditedMinutes);
    }

    public static int CalculateActualOvertimeWorkedMinutes(
        TimeOnly timeIn,
        TimeOnly timeOut,
        TimeOnly? shiftStart,
        TimeOnly? shiftEnd)
    {
        if (!shiftStart.HasValue || !shiftEnd.HasValue)
            return 0;

        var shiftEndMinute = NormalizeEndMinute(shiftStart.Value, shiftEnd.Value);
        var actualStartMinute = NormalizeCurrentMinute(timeIn, shiftStart.Value, shiftEnd.Value);
        var actualEndMinute = NormalizeCurrentMinute(timeOut, shiftStart.Value, shiftEnd.Value);

        if (actualEndMinute <= actualStartMinute)
            actualEndMinute = NormalizeEndMinute(timeIn, timeOut);

        if (actualEndMinute <= shiftEndMinute)
            return 0;

        var overtimeStartMinute = Math.Max(actualStartMinute, shiftEndMinute);

        return Math.Max(0, actualEndMinute - overtimeStartMinute);
    }

    public static int CalculateCreditedApprovedOvertimeMinutes(
        TimeOnly? timeIn,
        TimeOnly? timeOut,
        int renderedMinutes,
        TimeOnly? shiftStart,
        TimeOnly? shiftEnd,
        int approvedOvertimeMinutes)
    {
        if (!timeIn.HasValue ||
            !timeOut.HasValue ||
            renderedMinutes <= 0 ||
            approvedOvertimeMinutes <= 0)
        {
            return 0;
        }

        var actualOvertimeWorkedMinutes = CalculateActualOvertimeWorkedMinutes(
            timeIn.Value,
            timeOut.Value,
            shiftStart,
            shiftEnd);

        return Math.Min(actualOvertimeWorkedMinutes, Math.Max(0, approvedOvertimeMinutes));
    }

    public static int CalculateDurationMinutes(TimeOnly start, TimeOnly end)
    {
        var startMinute = ToMinuteOfDay(start);
        var endMinute = NormalizeEndMinute(start, end);

        return endMinute - startMinute;
    }

    public static int NormalizeCurrentMinute(TimeOnly current, TimeOnly start, TimeOnly end)
    {
        var currentMinute = ToMinuteOfDay(current);
        var startMinute = ToMinuteOfDay(start);
        var endMinute = ToMinuteOfDay(end);

        if (endMinute < startMinute && currentMinute <= endMinute)
            return currentMinute + MinutesPerDay;

        return currentMinute;
    }

    public static int NormalizeEndMinute(TimeOnly start, TimeOnly end)
    {
        var startMinute = ToMinuteOfDay(start);
        var endMinute = ToMinuteOfDay(end);

        if (endMinute < startMinute)
            return endMinute + MinutesPerDay;

        return endMinute;
    }

    public static int ToMinuteOfDay(TimeOnly value)
    {
        return value.Hour * 60 + value.Minute;
    }

    public static int CalculateBreakOverlapMinutes(
        TimeOnly actualStart,
        TimeOnly actualEnd,
        TimeOnly? breakStart,
        TimeOnly? breakEnd)
    {
        if (!breakStart.HasValue || !breakEnd.HasValue)
            return 0;

        var actualStartMinute = ToMinuteOfDay(actualStart);
        var actualEndMinute = NormalizeEndMinute(actualStart, actualEnd);
        var breakStartMinute = ToMinuteOfDay(breakStart.Value);
        var breakEndMinute = NormalizeEndMinute(breakStart.Value, breakEnd.Value);

        if (actualEndMinute <= actualStartMinute)
            return 0;

        if (breakEndMinute <= breakStartMinute)
            return 0;

        if (breakStartMinute < actualStartMinute && breakEndMinute <= actualStartMinute)
        {
            breakStartMinute += MinutesPerDay;
            breakEndMinute += MinutesPerDay;
        }

        var overlapStart = Math.Max(actualStartMinute, breakStartMinute);
        var overlapEnd = Math.Min(actualEndMinute, breakEndMinute);

        if (overlapEnd <= overlapStart)
            return 0;

        return overlapEnd - overlapStart;
    }

    private static int CalculateBreakOverlapMinutes(
        int rangeStartMinute,
        int rangeEndMinute,
        TimeOnly? breakStart,
        TimeOnly? breakEnd,
        int anchorStartMinute,
        int anchorEndMinute)
    {
        if (!breakStart.HasValue || !breakEnd.HasValue)
            return 0;

        var breakStartMinute = ToMinuteOfDay(breakStart.Value);
        var breakEndMinute = NormalizeEndMinute(breakStart.Value, breakEnd.Value);

        if (anchorEndMinute > MinutesPerDay && breakStartMinute < anchorStartMinute)
        {
            breakStartMinute += MinutesPerDay;
            breakEndMinute += MinutesPerDay;
        }

        if (breakEndMinute <= breakStartMinute)
            return 0;

        var overlapStart = Math.Max(rangeStartMinute, breakStartMinute);
        var overlapEnd = Math.Min(rangeEndMinute, breakEndMinute);

        if (overlapEnd <= overlapStart)
            return 0;

        return overlapEnd - overlapStart;
    }
}

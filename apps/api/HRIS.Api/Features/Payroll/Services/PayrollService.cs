using HRIS.Api.Data;
using HRIS.Api.Features.GovernmentCompliance.Services;
using HRIS.Api.Features.Payroll.Constants;
using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Payroll.Services;

public class PayrollService : IPayrollService
{
    private const string PayrollRecordStatusProcessed = "Processed";

    private const string LeaveStatusApproved = "Approved";
    private const string OvertimeStatusApproved = "Approved";

    private const string CompensationTypeMonthly = "Monthly";
    private const string CompensationTypeDaily = "Daily";

    private const string PayrollItemTypeEarning = "Earning";
    private const string BasicPayDescription = "Basic Pay";

    private const int MonthlyCutoffs = 2;
    private const int StandardMonthlyWorkingDays = 22;
    private const int StandardWorkingMinutesPerDay = 480;

    private readonly AppDbContext _context;
    private readonly IGovernmentComplianceService _governmentComplianceService;

    public PayrollService(
        AppDbContext context,
        IGovernmentComplianceService governmentComplianceService)
    {
        _context = context;
        _governmentComplianceService = governmentComplianceService;
    }

    public async Task<PayrollPeriodDto> ProcessPayrollAsync(ProcessPayrollRequest request)
    {
        if (request.StartDate == default)
            throw new InvalidOperationException("Payroll start date is required.");

        if (request.EndDate == default)
            throw new InvalidOperationException("Payroll end date is required.");

        if (request.StartDate > request.EndDate)
            throw new InvalidOperationException("Payroll start date cannot be later than end date.");

        await using var transaction = await _context.Database.BeginTransactionAsync();

        var existingPeriod = await _context.PayrollPeriods
            .AnyAsync(period =>
                period.StartDate == request.StartDate &&
                period.EndDate == request.EndDate);

        if (existingPeriod)
            throw new InvalidOperationException("Payroll has already been processed for this period.");

        var compensations = await _context.EmployeeCompensations
            .Include(compensation => compensation.Employee)
            .Where(compensation =>
                compensation.IsActive &&
                compensation.EffectiveFrom <= request.EndDate &&
                (compensation.EffectiveTo == null || compensation.EffectiveTo >= request.StartDate))
            .OrderBy(compensation => compensation.Employee.EmployeeNumber)
            .ToListAsync();

        if (compensations.Count == 0)
            throw new InvalidOperationException("No active employee compensations found for this payroll period.");

        var employeeIds = compensations
            .Select(compensation => compensation.EmployeeId)
            .Distinct()
            .ToList();

        var attendanceLogs = await _context.AttendanceLogs
            .AsNoTracking()
            .Where(log =>
                employeeIds.Contains(log.EmployeeId) &&
                log.Date >= request.StartDate &&
                log.Date <= request.EndDate)
            .ToListAsync();

        var leaveRequests = await _context.LeaveRequests
            .AsNoTracking()
            .Where(leave =>
                employeeIds.Contains(leave.EmployeeId) &&
                leave.Status == LeaveStatusApproved &&
                leave.StartDate <= request.EndDate &&
                leave.EndDate >= request.StartDate)
            .ToListAsync();

        var overtimeRequests = await _context.OvertimeRequests
            .AsNoTracking()
            .Include(overtime => overtime.Items)
            .Where(overtime =>
                employeeIds.Contains(overtime.EmployeeId) &&
                overtime.Status == OvertimeStatusApproved &&
                overtime.DateFrom <= request.EndDate &&
                overtime.DateTo >= request.StartDate)
            .ToListAsync();

        var attendanceLogsByEmployee = attendanceLogs.ToLookup(log => log.EmployeeId);
        var leaveRequestsByEmployee = leaveRequests.ToLookup(leave => leave.EmployeeId);
        var overtimeRequestsByEmployee = overtimeRequests.ToLookup(overtime => overtime.EmployeeId);

        var now = DateTime.UtcNow;

        var payrollPeriod = new PayrollPeriod
        {
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Status = PayrollStatuses.Processed,
            ProcessedAtUtc = now,
            CreatedAtUtc = now
        };

        _context.PayrollPeriods.Add(payrollPeriod);

        foreach (var compensation in compensations)
        {
            var employeeAttendanceLogs = attendanceLogsByEmployee[compensation.EmployeeId].ToList();
            var employeeLeaveRequests = leaveRequestsByEmployee[compensation.EmployeeId].ToList();
            var employeeOvertimeRequests = overtimeRequestsByEmployee[compensation.EmployeeId].ToList();

            var approvedLeaveDates = GetApprovedLeaveDates(
                employeeLeaveRequests,
                request.StartDate,
                request.EndDate);

            var dailyRate = GetDailyRate(compensation);
            var cutoffBasePay = GetCutoffBasePay(compensation);
            var minuteRate = dailyRate / StandardWorkingMinutesPerDay;

            var basicPay = GetBasicPay(
                compensation,
                employeeAttendanceLogs,
                approvedLeaveDates,
                cutoffBasePay,
                dailyRate);

            var approvedOvertimeMinutes = employeeOvertimeRequests
                .SelectMany(overtime => overtime.Items)
                .Where(item =>
                    item.Date >= request.StartDate &&
                    item.Date <= request.EndDate)
                .Sum(item => item.RequestedMinutes);

            var overtimePay = RoundMoney(approvedOvertimeMinutes * minuteRate);

            var lateAndUndertimeMinutes = employeeAttendanceLogs
                .Where(log => log.IsPresent)
                .Sum(log => log.LateMinutes + log.UndertimeMinutes);

            var lateAndUndertimeDeduction = RoundMoney(lateAndUndertimeMinutes * minuteRate);

            var absenceDays = employeeAttendanceLogs
                .Where(log => !log.IsPresent && !approvedLeaveDates.Contains(log.Date))
                .Select(log => log.Date)
                .Distinct()
                .Count();

            var absenceDeduction = RoundMoney(absenceDays * dailyRate);

            var grossPay = RoundMoney(basicPay + overtimePay);

            var compliance = await _governmentComplianceService.CalculateAsync(
                grossPay,
                request.EndDate);

            var sssDeduction = RoundMoney(compliance.SssEmployeeShare);
            var philHealthDeduction = RoundMoney(compliance.PhilHealthEmployeeShare);
            var pagIbigDeduction = RoundMoney(compliance.PagIbigEmployeeShare);
            var withholdingTaxDeduction = RoundMoney(compliance.WithholdingTax);

            var governmentComplianceDeductions = RoundMoney(
                sssDeduction +
                philHealthDeduction +
                pagIbigDeduction +
                withholdingTaxDeduction);

            var totalDeductions = RoundMoney(
                lateAndUndertimeDeduction +
                absenceDeduction +
                governmentComplianceDeductions);

            var netPay = RoundMoney(grossPay - totalDeductions);

            var payrollRecord = new PayrollRecord
            {
                PayrollPeriod = payrollPeriod,
                EmployeeId = compensation.EmployeeId,
                GrossPay = grossPay,
                TotalDeductions = totalDeductions,
                NetPay = netPay,
                Status = PayrollRecordStatusProcessed,
                CreatedAtUtc = now
            };

            payrollRecord.Items.Add(new PayrollRecordItem
            {
                Type = PayrollItemTypeEarning,
                Description = BasicPayDescription,
                Amount = basicPay
            });

            if (overtimePay > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeEarning,
                    Description = $"Approved Overtime ({approvedOvertimeMinutes} minutes)",
                    Amount = overtimePay
                });
            }

            if (lateAndUndertimeDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = $"Late / Undertime ({lateAndUndertimeMinutes} minutes)",
                    Amount = lateAndUndertimeDeduction
                });
            }

            if (absenceDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = $"Absence ({absenceDays} day/s)",
                    Amount = absenceDeduction
                });
            }

            if (sssDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = "SSS",
                    Amount = sssDeduction
                });
            }

            if (philHealthDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = "PhilHealth",
                    Amount = philHealthDeduction
                });
            }

            if (pagIbigDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = "Pag-IBIG",
                    Amount = pagIbigDeduction
                });
            }

            if (withholdingTaxDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = "Deduction",
                    Description = "Withholding Tax",
                    Amount = withholdingTaxDeduction
                });
            }

            payrollPeriod.PayrollRecords.Add(payrollRecord);
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return MapPayrollPeriod(payrollPeriod);
    }

    public async Task<PayrollPeriodDto> ReleasePayrollPeriodAsync(int periodId)
    {
        var payrollPeriod = await _context.PayrollPeriods
            .FirstOrDefaultAsync(period => period.Id == periodId);

        if (payrollPeriod == null)
            throw new InvalidOperationException("Payroll period was not found.");

        if (payrollPeriod.Status == PayrollStatuses.Released)
            throw new InvalidOperationException("Payroll period is already released.");

        if (payrollPeriod.Status != PayrollStatuses.Processed)
            throw new InvalidOperationException("Only processed payroll periods can be released.");

        payrollPeriod.Status = PayrollStatuses.Released;
        payrollPeriod.ReleasedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapPayrollPeriod(payrollPeriod);
    }

    public async Task<IReadOnlyList<PayrollPeriodDto>> GetPayrollPeriodsAsync()
    {
        return await _context.PayrollPeriods
            .AsNoTracking()
            .OrderByDescending(period => period.StartDate)
            .Select(period => new PayrollPeriodDto
            {
                Id = period.Id,
                StartDate = period.StartDate,
                EndDate = period.EndDate,
                Status = period.Status,
                ProcessedAtUtc = period.ProcessedAtUtc,
                ReleasedAtUtc = period.ReleasedAtUtc,
                CreatedAtUtc = period.CreatedAtUtc
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PayrollRecordDto>> GetPayrollRecordsAsync(int payrollPeriodId)
    {
        return await _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .Where(record => record.PayrollPeriodId == payrollPeriodId)
            .OrderBy(record => record.Employee.EmployeeNumber)
            .Select(record => new PayrollRecordDto
            {
                Id = record.Id,
                PayrollPeriodId = record.PayrollPeriodId,
                EmployeeId = record.EmployeeId,
                EmployeeNumber = record.Employee.EmployeeNumber,
                EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                GrossPay = record.GrossPay,
                TotalDeductions = record.TotalDeductions,
                NetPay = record.NetPay,
                Status = record.Status,
                CreatedAtUtc = record.CreatedAtUtc,
                Items = record.Items
                    .OrderBy(item => item.Id)
                    .Select(item => new PayrollRecordItemDto
                    {
                        Id = item.Id,
                        Type = item.Type,
                        Description = item.Description,
                        Amount = item.Amount
                    })
                    .ToList()
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PayrollRecordDto>> GetPayslipsAsync(Guid employeeId)
    {
        return await _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .Where(record => record.EmployeeId == employeeId)
            .OrderByDescending(record => record.CreatedAtUtc)
            .Select(record => new PayrollRecordDto
            {
                Id = record.Id,
                PayrollPeriodId = record.PayrollPeriodId,
                EmployeeId = record.EmployeeId,
                EmployeeNumber = record.Employee.EmployeeNumber,
                EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
                GrossPay = record.GrossPay,
                TotalDeductions = record.TotalDeductions,
                NetPay = record.NetPay,
                Status = record.Status,
                CreatedAtUtc = record.CreatedAtUtc,
                Items = record.Items
                    .OrderBy(item => item.Id)
                    .Select(item => new PayrollRecordItemDto
                    {
                        Id = item.Id,
                        Type = item.Type,
                        Description = item.Description,
                        Amount = item.Amount
                    })
                    .ToList()
            })
            .ToListAsync();
    }

    public async Task<IReadOnlyList<ThirteenthMonthPayDto>> GetThirteenthMonthPayAsync(int year)
    {
        if (year < 1900 || year > 9999)
            throw new InvalidOperationException("A valid payroll year is required.");

        var yearStart = new DateOnly(year, 1, 1);
        var yearEnd = new DateOnly(year, 12, 31);

        var basicPayItems = await _context.PayrollRecordItems
            .AsNoTracking()
            .Include(item => item.PayrollRecord)
                .ThenInclude(record => record.Employee)
            .Include(item => item.PayrollRecord)
                .ThenInclude(record => record.PayrollPeriod)
            .Where(item =>
                item.Type == PayrollItemTypeEarning &&
                item.Description == BasicPayDescription &&
                item.PayrollRecord.PayrollPeriod.StartDate <= yearEnd &&
                item.PayrollRecord.PayrollPeriod.EndDate >= yearStart)
            .Select(item => new
            {
                item.Amount,
                EmployeeId = item.PayrollRecord.EmployeeId,
                item.PayrollRecord.Employee.EmployeeNumber,
                item.PayrollRecord.Employee.FirstName,
                item.PayrollRecord.Employee.LastName,
                item.PayrollRecord.Employee.Department,
                item.PayrollRecord.Employee.Position
            })
            .ToListAsync();

        return basicPayItems
            .GroupBy(item => new
            {
                item.EmployeeId,
                item.EmployeeNumber,
                item.FirstName,
                item.LastName,
                item.Department,
                item.Position
            })
            .OrderBy(group => group.Key.EmployeeNumber)
            .Select(group =>
            {
                var basicSalaryEarned = RoundMoney(group.Sum(item => item.Amount));

                return new ThirteenthMonthPayDto
                {
                    EmployeeId = group.Key.EmployeeId,
                    EmployeeNumber = group.Key.EmployeeNumber,
                    EmployeeName = $"{group.Key.FirstName} {group.Key.LastName}",
                    Department = group.Key.Department ?? string.Empty,
                    Position = group.Key.Position ?? string.Empty,
                    Year = year,
                    BasicSalaryEarned = basicSalaryEarned,
                    ThirteenthMonthPay = RoundMoney(basicSalaryEarned / 12)
                };
            })
            .ToList();
    }

    private static PayrollPeriodDto MapPayrollPeriod(PayrollPeriod payrollPeriod)
    {
        return new PayrollPeriodDto
        {
            Id = payrollPeriod.Id,
            StartDate = payrollPeriod.StartDate,
            EndDate = payrollPeriod.EndDate,
            Status = payrollPeriod.Status,
            ProcessedAtUtc = payrollPeriod.ProcessedAtUtc,
            ReleasedAtUtc = payrollPeriod.ReleasedAtUtc,
            CreatedAtUtc = payrollPeriod.CreatedAtUtc
        };
    }

    private static decimal GetDailyRate(EmployeeCompensation compensation)
    {
        if (string.Equals(compensation.CompensationType, CompensationTypeMonthly, StringComparison.OrdinalIgnoreCase))
            return RoundMoney(compensation.BaseAmount / StandardMonthlyWorkingDays);

        if (string.Equals(compensation.CompensationType, CompensationTypeDaily, StringComparison.OrdinalIgnoreCase))
            return RoundMoney(compensation.BaseAmount);

        throw new InvalidOperationException($"Unsupported compensation type: {compensation.CompensationType}");
    }

    private static decimal GetCutoffBasePay(EmployeeCompensation compensation)
    {
        if (string.Equals(compensation.CompensationType, CompensationTypeMonthly, StringComparison.OrdinalIgnoreCase))
            return RoundMoney(compensation.BaseAmount / MonthlyCutoffs);

        if (string.Equals(compensation.CompensationType, CompensationTypeDaily, StringComparison.OrdinalIgnoreCase))
            return 0m;

        throw new InvalidOperationException($"Unsupported compensation type: {compensation.CompensationType}");
    }

    private static decimal GetBasicPay(
        EmployeeCompensation compensation,
        IReadOnlyCollection<AttendanceLog> attendanceLogs,
        IReadOnlySet<DateOnly> approvedLeaveDates,
        decimal cutoffBasePay,
        decimal dailyRate)
    {
        if (string.Equals(compensation.CompensationType, CompensationTypeMonthly, StringComparison.OrdinalIgnoreCase))
            return cutoffBasePay;

        var payableAttendanceDays = attendanceLogs
            .Where(log => log.IsPresent)
            .Select(log => log.Date)
            .Distinct()
            .Count();

        var payableLeaveDays = approvedLeaveDates.Count;

        return RoundMoney((payableAttendanceDays + payableLeaveDays) * dailyRate);
    }

    private static HashSet<DateOnly> GetApprovedLeaveDates(
        IReadOnlyCollection<LeaveRequest> leaveRequests,
        DateOnly payrollStartDate,
        DateOnly payrollEndDate)
    {
        var dates = new HashSet<DateOnly>();

        foreach (var leave in leaveRequests)
        {
            var startDate = leave.StartDate < payrollStartDate
                ? payrollStartDate
                : leave.StartDate;

            var endDate = leave.EndDate > payrollEndDate
                ? payrollEndDate
                : leave.EndDate;

            for (var date = startDate; date <= endDate; date = date.AddDays(1))
            {
                dates.Add(date);
            }
        }

        return dates;
    }

    private static decimal RoundMoney(decimal amount)
    {
        return Math.Round(amount, 2, MidpointRounding.AwayFromZero);
    }
}
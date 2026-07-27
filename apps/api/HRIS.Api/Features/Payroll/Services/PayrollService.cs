using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Attendance.Services;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.GovernmentCompliance.Services;
using HRIS.Api.Features.Payroll.Constants;
using HRIS.Api.Features.Payroll.DTOs;
using HRIS.Api.Features.Payroll.Pdf;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Payroll.Services;

public class PayrollService : IPayrollService
{
    private const string LeaveStatusApproved = "Approved";

    private const string CompensationTypeMonthly = "Monthly";
    private const string CompensationTypeDaily = "Daily";

    private const string PayrollItemTypeEarning = "Earning";
    private const string PayrollItemTypeDeduction = "Deduction";
    private const string PayrollItemTypeEmployerContribution = "Employer Contribution";
    private const string BasicPayDescription = "Basic Pay";
    private const string SssEmployerContributionDescription = "SSS Employer";
    private const string PhilHealthEmployerContributionDescription = "PhilHealth Employer";
    private const string PagIbigEmployerContributionDescription = "Pag-IBIG Employer";

    private const int MonthlyCutoffs = 2;
    private const int StandardMonthlyWorkingDays = 22;
    private const int StandardWorkingMinutesPerDay = 480;

    private enum PayrollCutoff
    {
        First,
        Final
    }

    private sealed class PayrollCutoffSnapshot
    {
        public decimal GrossPay { get; init; }
        public decimal SssEmployeeShare { get; init; }
        public decimal SssEmployerShare { get; init; }
        public decimal PhilHealthEmployeeShare { get; init; }
        public decimal PhilHealthEmployerShare { get; init; }
        public decimal PagIbigEmployeeShare { get; init; }
        public decimal PagIbigEmployerShare { get; init; }
        public decimal WithholdingTax { get; init; }
    }

    private readonly AppDbContext _context;
    private readonly IAttendancePayrollInputService _attendancePayrollInputService;
    private readonly IGovernmentComplianceService _governmentComplianceService;
    private readonly IPayslipPdfGenerator _payslipPdfGenerator;

    public PayrollService(
        AppDbContext context,
        IAttendancePayrollInputService attendancePayrollInputService,
        IGovernmentComplianceService governmentComplianceService,
        IPayslipPdfGenerator payslipPdfGenerator)
    {
        _context = context;
        _attendancePayrollInputService = attendancePayrollInputService;
        _governmentComplianceService = governmentComplianceService;
        _payslipPdfGenerator = payslipPdfGenerator;
    }

    public async Task<PayrollPeriodDto> ProcessPayrollAsync(
        ProcessPayrollRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.StartDate == default)
            throw new InvalidOperationException("Payroll start date is required.");

        if (request.EndDate == default)
            throw new InvalidOperationException("Payroll end date is required.");

        if (request.StartDate > request.EndDate)
            throw new InvalidOperationException("Payroll start date cannot be later than end date.");

        var payrollCutoff = GetPayrollCutoff(request.StartDate, request.EndDate);

        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);

        var existingPeriod = await _context.PayrollPeriods
            .AnyAsync(period =>
                period.StartDate == request.StartDate &&
                period.EndDate == request.EndDate,
                cancellationToken);

        if (existingPeriod)
            throw new InvalidOperationException("Payroll has already been processed for this period.");

        var compensations = await _context.EmployeeCompensations
            .AsNoTracking()
            .Include(compensation => compensation.Employee)
            .Where(compensation =>
                compensation.IsActive &&
                compensation.EffectiveFrom <= request.EndDate &&
                (compensation.EffectiveTo == null || compensation.EffectiveTo >= request.StartDate))
            .OrderBy(compensation => compensation.Employee.EmployeeNumber)
            .ToListAsync(cancellationToken);

        if (compensations.Count == 0)
            throw new InvalidOperationException("No active employee compensations found for this payroll period.");

        var compensationGroups = compensations
            .GroupBy(compensation => compensation.EmployeeId)
            .ToList();

        var overlappingCompensation = compensationGroups
            .FirstOrDefault(group => group.Count() > 1);

        if (overlappingCompensation != null)
        {
            var employee = overlappingCompensation.First().Employee;
            throw new InvalidOperationException(
                $"Multiple active compensations apply to {BuildEmployeeLabel(employee)} for {request.StartDate:yyyy-MM-dd} to {request.EndDate:yyyy-MM-dd}. Close or deactivate overlapping compensation records before processing payroll.");
        }

        var applicableCompensations = compensationGroups
            .Select(group => group.Single())
            .ToList();

        var ineligibleCompensation = applicableCompensations
            .FirstOrDefault(compensation =>
                !compensation.Employee.IsActive ||
                compensation.Employee.DateHired > request.EndDate);

        if (ineligibleCompensation != null)
        {
            var employee = ineligibleCompensation.Employee;
            var reason = !employee.IsActive
                ? "employee is inactive"
                : $"employee hire date {employee.DateHired:yyyy-MM-dd} is after the payroll period end date";

            throw new InvalidOperationException(
                $"Cannot process payroll for {BuildEmployeeLabel(employee)} because {reason}.");
        }

        var employeeIds = applicableCompensations
            .Select(compensation => compensation.EmployeeId)
            .Distinct()
            .ToList();

        var priorCutoffSnapshots = payrollCutoff == PayrollCutoff.Final
            ? await GetFirstCutoffSnapshotsAsync(request, employeeIds, cancellationToken)
            : new Dictionary<Guid, PayrollCutoffSnapshot>();

        var attendanceInputs = await _attendancePayrollInputService.GetPayrollInputsAsync(
            employeeIds,
            request.StartDate,
            request.EndDate,
            cancellationToken);

        var leaveRequests = await _context.LeaveRequests
            .AsNoTracking()
            .Where(leave =>
                employeeIds.Contains(leave.EmployeeId) &&
                leave.Status == LeaveStatusApproved &&
                leave.StartDate <= request.EndDate &&
                leave.EndDate >= request.StartDate)
            .ToListAsync(cancellationToken);

        var attendanceInputsByEmployee = attendanceInputs.ToLookup(input => input.EmployeeId);
        var leaveRequestsByEmployee = leaveRequests.ToLookup(leave => leave.EmployeeId);

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

        foreach (var compensation in applicableCompensations)
        {
            var employeeAttendanceInputs = attendanceInputsByEmployee[compensation.EmployeeId].ToList();
            var employeeLeaveRequests = leaveRequestsByEmployee[compensation.EmployeeId].ToList();

            var payableApprovedLeaveDates = GetPayableApprovedLeaveDates(
                employeeLeaveRequests,
                employeeAttendanceInputs,
                request.StartDate,
                request.EndDate);

            var dailyRate = GetDailyRate(compensation);
            var cutoffBasePay = GetCutoffBasePay(compensation);
            var minuteRate = dailyRate / StandardWorkingMinutesPerDay;

            var basicPay = GetBasicPay(
                compensation,
                employeeAttendanceInputs,
                payableApprovedLeaveDates,
                cutoffBasePay,
                dailyRate);

            var approvedOvertimeMinutes = employeeAttendanceInputs
                .Sum(input => input.CreditedApprovedOvertimeMinutes);

            var overtimePay = RoundMoney(approvedOvertimeMinutes * minuteRate);

            var lateAndUndertimeMinutes = employeeAttendanceInputs
                .Where(input => input.IsPresent)
                .Sum(input => input.LateMinutes + input.UndertimeMinutes);

            var lateAndUndertimeDeduction = RoundMoney(lateAndUndertimeMinutes * minuteRate);

            var absenceDays = employeeAttendanceInputs
                .Where(input =>
                    input.IsAbsent &&
                    !payableApprovedLeaveDates.Contains(input.Date))
                .Select(input => input.Date)
                .Distinct()
                .Count();

            var absenceDeduction = RoundMoney(absenceDays * dailyRate);

            var grossPay = RoundMoney(basicPay + overtimePay);

            priorCutoffSnapshots.TryGetValue(compensation.EmployeeId, out var priorCutoffSnapshot);

            var monthlyGrossPay = payrollCutoff == PayrollCutoff.First
                ? RoundMoney(grossPay * MonthlyCutoffs)
                : RoundMoney((priorCutoffSnapshot?.GrossPay ?? 0m) + grossPay);

            var monthlyCompliance = await _governmentComplianceService.CalculateAsync(
                monthlyGrossPay,
                request.EndDate,
                cancellationToken);

            var sssDeduction = GetCutoffAmount(
                monthlyCompliance.SssEmployeeShare,
                priorCutoffSnapshot?.SssEmployeeShare ?? 0m,
                payrollCutoff);
            var philHealthDeduction = GetCutoffAmount(
                monthlyCompliance.PhilHealthEmployeeShare,
                priorCutoffSnapshot?.PhilHealthEmployeeShare ?? 0m,
                payrollCutoff);
            var pagIbigDeduction = GetCutoffAmount(
                monthlyCompliance.PagIbigEmployeeShare,
                priorCutoffSnapshot?.PagIbigEmployeeShare ?? 0m,
                payrollCutoff);
            var withholdingTaxDeduction = GetCutoffAmount(
                monthlyCompliance.WithholdingTax,
                priorCutoffSnapshot?.WithholdingTax ?? 0m,
                payrollCutoff);
            var sssEmployerContribution = GetCutoffAmount(
                monthlyCompliance.SssEmployerShare,
                priorCutoffSnapshot?.SssEmployerShare ?? 0m,
                payrollCutoff);
            var philHealthEmployerContribution = GetCutoffAmount(
                monthlyCompliance.PhilHealthEmployerShare,
                priorCutoffSnapshot?.PhilHealthEmployerShare ?? 0m,
                payrollCutoff);
            var pagIbigEmployerContribution = GetCutoffAmount(
                monthlyCompliance.PagIbigEmployerShare,
                priorCutoffSnapshot?.PagIbigEmployerShare ?? 0m,
                payrollCutoff);

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
                Status = PayrollStatuses.Processed,
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
                    Type = PayrollItemTypeDeduction,
                    Description = $"Late / Undertime ({lateAndUndertimeMinutes} minutes)",
                    Amount = lateAndUndertimeDeduction
                });
            }

            if (absenceDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeDeduction,
                    Description = $"Absence ({absenceDays} day/s)",
                    Amount = absenceDeduction
                });
            }

            if (sssDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeDeduction,
                    Description = "SSS",
                    Amount = sssDeduction
                });
            }

            if (philHealthDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeDeduction,
                    Description = "PhilHealth",
                    Amount = philHealthDeduction
                });
            }

            if (pagIbigDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeDeduction,
                    Description = "Pag-IBIG",
                    Amount = pagIbigDeduction
                });
            }

            payrollRecord.Items.Add(new PayrollRecordItem
            {
                Type = PayrollItemTypeEmployerContribution,
                Description = SssEmployerContributionDescription,
                Amount = sssEmployerContribution
            });

            payrollRecord.Items.Add(new PayrollRecordItem
            {
                Type = PayrollItemTypeEmployerContribution,
                Description = PhilHealthEmployerContributionDescription,
                Amount = philHealthEmployerContribution
            });

            payrollRecord.Items.Add(new PayrollRecordItem
            {
                Type = PayrollItemTypeEmployerContribution,
                Description = PagIbigEmployerContributionDescription,
                Amount = pagIbigEmployerContribution
            });

            if (withholdingTaxDeduction > 0)
            {
                payrollRecord.Items.Add(new PayrollRecordItem
                {
                    Type = PayrollItemTypeDeduction,
                    Description = "Withholding Tax",
                    Amount = withholdingTaxDeduction
                });
            }

            payrollPeriod.PayrollRecords.Add(payrollRecord);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapPayrollPeriod(payrollPeriod);
    }

    public async Task<PayrollPeriodDto> ReleasePayrollPeriodAsync(int periodId)
    {
        await using var transaction = await _context.Database.BeginTransactionAsync();

        var payrollPeriod = await _context.PayrollPeriods
            .Include(period => period.PayrollRecords)
            .FirstOrDefaultAsync(period => period.Id == periodId);

        if (payrollPeriod == null)
            throw new InvalidOperationException("Payroll period was not found.");

        var isReleased = payrollPeriod.Status == PayrollStatuses.Released;
        var hasInconsistentReleasedState = isReleased &&
            (!payrollPeriod.ReleasedAtUtc.HasValue ||
             payrollPeriod.PayrollRecords.Any(record => record.Status != PayrollStatuses.Released));

        if (isReleased && !hasInconsistentReleasedState)
            throw new InvalidOperationException("Payroll period is already released.");

        if (!isReleased && payrollPeriod.Status != PayrollStatuses.Processed)
            throw new InvalidOperationException("Only processed payroll periods can be released.");

        var releasedAtUtc = payrollPeriod.ReleasedAtUtc ?? DateTime.UtcNow;

        payrollPeriod.Status = PayrollStatuses.Released;
        payrollPeriod.ReleasedAtUtc = releasedAtUtc;

        foreach (var payrollRecord in payrollPeriod.PayrollRecords)
        {
            payrollRecord.Status = PayrollStatuses.Released;
        }

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

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
            .Include(record => record.PayrollPeriod)
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .Where(record => record.PayrollPeriodId == payrollPeriodId)
            .OrderBy(record => record.Employee.EmployeeNumber)
            .Select(record => MapPayrollRecord(record))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PayrollRecordDto>> GetPayslipsAsync(Guid employeeId)
    {
        return await _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.PayrollPeriod)
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .Where(record =>
                record.EmployeeId == employeeId &&
                record.PayrollPeriod.Status == PayrollStatuses.Released &&
                record.Status == PayrollStatuses.Released)
            .OrderByDescending(record => record.CreatedAtUtc)
            .Select(record => MapPayrollRecord(record))
            .ToListAsync();
    }

    public async Task<IReadOnlyList<PayrollRecordDto>> GetMyPayslipsAsync(ClaimsPrincipal actor)
    {
        var userId = GetUserId(actor);

        if (!userId.HasValue)
            throw new ApiException("Authenticated user could not be resolved.", StatusCodes.Status401Unauthorized);

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(employee => employee.UserId == userId.Value);

        if (employee is null)
            throw new ApiException("Employee profile is not linked to this user.", StatusCodes.Status404NotFound);

        return await GetPayslipsAsync(employee.Id);
    }

    public async Task<byte[]> GeneratePayslipPdfAsync(int payrollRecordId, ClaimsPrincipal actor)
    {
        var payrollRecord = await _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.PayrollPeriod)
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .FirstOrDefaultAsync(record => record.Id == payrollRecordId);

        if (payrollRecord is null)
            throw new ApiException("Payroll record was not found.", StatusCodes.Status404NotFound);

        if (!IsAdmin(actor))
        {
            var userId = GetUserId(actor);

            if (!userId.HasValue)
                throw new ApiException("Authenticated user could not be resolved.", StatusCodes.Status401Unauthorized);

            var employee = await _context.Employees
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.UserId == userId.Value);

            if (employee is null)
                throw new ApiException("Employee profile is not linked to this user.", StatusCodes.Status404NotFound);

            if (payrollRecord.EmployeeId != employee.Id)
                throw new ApiException("You can only download your own payslips.", StatusCodes.Status403Forbidden);
        }

        if (payrollRecord.PayrollPeriod.Status != PayrollStatuses.Released ||
            payrollRecord.Status != PayrollStatuses.Released)
            throw new ApiException("Payslip is not available until payroll is released.", StatusCodes.Status404NotFound);

        return _payslipPdfGenerator.Generate(MapPayrollRecord(payrollRecord));
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
                PeriodStart = item.PayrollRecord.PayrollPeriod.StartDate,
                PeriodEnd = item.PayrollRecord.PayrollPeriod.EndDate,
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
                var basicSalaryEarned = RoundMoney(group.Sum(item =>
                {
                    var overlapStart = item.PeriodStart < yearStart ? yearStart : item.PeriodStart;
                    var overlapEnd = item.PeriodEnd > yearEnd ? yearEnd : item.PeriodEnd;
                    var periodDays = item.PeriodEnd.DayNumber - item.PeriodStart.DayNumber + 1;
                    var overlapDays = overlapEnd.DayNumber - overlapStart.DayNumber + 1;

                    return periodDays <= 0
                        ? 0m
                        : item.Amount * overlapDays / periodDays;
                }));

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

    private static PayrollRecordDto MapPayrollRecord(PayrollRecord record)
    {
        return new PayrollRecordDto
        {
            Id = record.Id,
            PayrollPeriodId = record.PayrollPeriodId,
            PayrollPeriodStartDate = record.PayrollPeriod.StartDate,
            PayrollPeriodEndDate = record.PayrollPeriod.EndDate,
            EmployeeId = record.EmployeeId,
            EmployeeNumber = record.Employee.EmployeeNumber,
            EmployeeName = $"{record.Employee.FirstName} {record.Employee.LastName}",
            Department = record.Employee.Department ?? string.Empty,
            Position = record.Employee.Position ?? string.Empty,
            GrossPay = record.GrossPay,
            TotalDeductions = record.TotalDeductions,
            NetPay = record.NetPay,
            Status = record.Status,
            CreatedAtUtc = record.CreatedAtUtc,
            ReleasedAtUtc = record.PayrollPeriod.ReleasedAtUtc,
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
        };
    }

    private static PayrollCutoff GetPayrollCutoff(DateOnly startDate, DateOnly endDate)
    {
        if (startDate.Year != endDate.Year || startDate.Month != endDate.Month)
        {
            throw new InvalidOperationException(
                "Payroll periods must stay within a single calendar month.");
        }

        if (startDate.Day == 1 && endDate.Day == 15)
        {
            return PayrollCutoff.First;
        }

        var lastDayOfMonth = DateTime.DaysInMonth(endDate.Year, endDate.Month);

        if (startDate.Day == 16 && endDate.Day == lastDayOfMonth)
        {
            return PayrollCutoff.Final;
        }

        throw new InvalidOperationException(
            "Payroll periods must be the first cutoff (1st-15th) or final cutoff (16th-last day) of a calendar month.");
    }

    private async Task<Dictionary<Guid, PayrollCutoffSnapshot>> GetFirstCutoffSnapshotsAsync(
        ProcessPayrollRequest request,
        IReadOnlyCollection<Guid> employeeIds,
        CancellationToken cancellationToken)
    {
        var firstCutoffStartDate = new DateOnly(request.StartDate.Year, request.StartDate.Month, 1);
        var firstCutoffEndDate = new DateOnly(request.StartDate.Year, request.StartDate.Month, 15);

        var firstCutoffPeriod = await _context.PayrollPeriods
            .AsNoTracking()
            .FirstOrDefaultAsync(period =>
                period.StartDate == firstCutoffStartDate &&
                period.EndDate == firstCutoffEndDate &&
                (period.Status == PayrollStatuses.Processed || period.Status == PayrollStatuses.Released),
                cancellationToken);

        if (firstCutoffPeriod is null)
        {
            throw new InvalidOperationException(
                $"Process the first cutoff ({firstCutoffStartDate:yyyy-MM-dd} to {firstCutoffEndDate:yyyy-MM-dd}) before the final cutoff.");
        }

        var firstCutoffRecords = await _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.Items)
            .Where(record =>
                record.PayrollPeriodId == firstCutoffPeriod.Id &&
                employeeIds.Contains(record.EmployeeId))
            .ToListAsync(cancellationToken);

        return firstCutoffRecords.ToDictionary(
            record => record.EmployeeId,
            record => new PayrollCutoffSnapshot
            {
                GrossPay = record.GrossPay,
                SssEmployeeShare = GetPayrollItemAmount(record, PayrollItemTypeDeduction, "SSS"),
                SssEmployerShare = GetPayrollItemAmount(record, PayrollItemTypeEmployerContribution, SssEmployerContributionDescription),
                PhilHealthEmployeeShare = GetPayrollItemAmount(record, PayrollItemTypeDeduction, "PhilHealth"),
                PhilHealthEmployerShare = GetPayrollItemAmount(record, PayrollItemTypeEmployerContribution, PhilHealthEmployerContributionDescription),
                PagIbigEmployeeShare = GetPayrollItemAmount(record, PayrollItemTypeDeduction, "Pag-IBIG"),
                PagIbigEmployerShare = GetPayrollItemAmount(record, PayrollItemTypeEmployerContribution, PagIbigEmployerContributionDescription),
                WithholdingTax = GetPayrollItemAmount(record, PayrollItemTypeDeduction, "Withholding Tax")
            });
    }

    private static decimal GetPayrollItemAmount(
        PayrollRecord record,
        string itemType,
        string description)
    {
        return record.Items
            .Where(item => item.Type == itemType && item.Description == description)
            .Sum(item => item.Amount);
    }

    private static decimal GetCutoffAmount(
        decimal monthlyAmount,
        decimal previouslyRecordedAmount,
        PayrollCutoff payrollCutoff)
    {
        return payrollCutoff == PayrollCutoff.First
            ? RoundMoney(monthlyAmount / MonthlyCutoffs)
            : RoundMoney(monthlyAmount - previouslyRecordedAmount);
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
        IReadOnlyCollection<PayrollAttendanceInputDto> attendanceInputs,
        IReadOnlySet<DateOnly> approvedLeaveDates,
        decimal cutoffBasePay,
        decimal dailyRate)
    {
        if (string.Equals(compensation.CompensationType, CompensationTypeMonthly, StringComparison.OrdinalIgnoreCase))
            return cutoffBasePay;

        var payableAttendanceDays = attendanceInputs
            .Where(input => input.IsPresent)
            .Select(input => input.Date)
            .Distinct()
            .Count();

        var payableLeaveDays = approvedLeaveDates.Count;

        return RoundMoney((payableAttendanceDays + payableLeaveDays) * dailyRate);
    }

    private static HashSet<DateOnly> GetPayableApprovedLeaveDates(
        IReadOnlyCollection<LeaveRequest> leaveRequests,
        IReadOnlyCollection<PayrollAttendanceInputDto> attendanceInputs,
        DateOnly payrollStartDate,
        DateOnly payrollEndDate)
    {
        var scheduledWorkDates = attendanceInputs
            .Where(input => input.IsScheduledWorkDate)
            .Select(input => input.Date)
            .ToHashSet();

        var presentDates = attendanceInputs
            .Where(input => input.IsPresent)
            .Select(input => input.Date)
            .ToHashSet();

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
                if (scheduledWorkDates.Contains(date) && !presentDates.Contains(date))
                    dates.Add(date);
            }
        }

        return dates;
    }

    private static string BuildEmployeeLabel(Employee employee)
    {
        return $"{employee.EmployeeNumber} ({employee.FirstName} {employee.LastName})";
    }

    private static long? GetUserId(ClaimsPrincipal actor)
    {
        var value =
            actor.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? actor.FindFirstValue("sub")
            ?? actor.FindFirstValue("userId")
            ?? actor.FindFirstValue("id");

        return long.TryParse(value, out var userId)
            ? userId
            : null;
    }

    private static bool IsAdmin(ClaimsPrincipal actor)
    {
        return actor.IsInRole("ADMIN") || actor.IsInRole("SUPER_ADMIN");
    }

    private static decimal RoundMoney(decimal amount)
    {
        return Math.Round(amount, 2, MidpointRounding.AwayFromZero);
    }
}

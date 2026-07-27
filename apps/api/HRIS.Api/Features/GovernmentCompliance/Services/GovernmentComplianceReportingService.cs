using HRIS.Api.Data;
using HRIS.Api.Features.GovernmentCompliance.DTOs;
using HRIS.Api.Features.Payroll.Constants;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.GovernmentCompliance.Services;

public sealed class GovernmentComplianceReportingService : IGovernmentComplianceReportingService
{
    private const string PayrollItemTypeDeduction = "Deduction";
    private const string PayrollItemTypeEmployerContribution = "Employer Contribution";
    private const string SssDeductionDescription = "SSS";
    private const string PhilHealthDeductionDescription = "PhilHealth";
    private const string PagIbigDeductionDescription = "Pag-IBIG";
    private const string WithholdingTaxDeductionDescription = "Withholding Tax";
    private const string SssEmployerDescription = "SSS Employer";
    private const string PhilHealthEmployerDescription = "PhilHealth Employer";
    private const string PagIbigEmployerDescription = "Pag-IBIG Employer";

    private static readonly string[] TrackablePayrollStatuses =
    [
        PayrollStatuses.Processed,
        PayrollStatuses.Released
    ];

    private readonly AppDbContext _context;

    public GovernmentComplianceReportingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CompliancePeriodSummaryDto?> GetComplianceSummaryAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default)
    {
        var periodId = await ResolvePayrollPeriodIdAsync(payrollPeriodId, cancellationToken);

        if (!periodId.HasValue)
        {
            return null;
        }

        var records = await BuildPayrollRecordQuery(periodId.Value, search)
            .Select(record => new PayrollContributionProjection
            {
                PayrollPeriodId = record.PayrollPeriodId,
                PayrollPeriodStartDate = record.PayrollPeriod.StartDate,
                PayrollPeriodEndDate = record.PayrollPeriod.EndDate,
                PayrollPeriodStatus = record.PayrollPeriod.Status,
                GrossPay = record.GrossPay,
                SssNumber = record.Employee.SssNumber,
                PhilHealthNumber = record.Employee.PhilHealthNumber,
                PagIbigNumber = record.Employee.PagIbigNumber,
                SssEmployeeContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeDeduction && item.Description == SssDeductionDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                SssEmployerContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeEmployerContribution && item.Description == SssEmployerDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                PhilHealthEmployeeContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeDeduction && item.Description == PhilHealthDeductionDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                PhilHealthEmployerContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeEmployerContribution && item.Description == PhilHealthEmployerDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                PagIbigEmployeeContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeDeduction && item.Description == PagIbigDeductionDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                PagIbigEmployerContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeEmployerContribution && item.Description == PagIbigEmployerDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        if (records.Count == 0)
        {
            var period = await _context.PayrollPeriods
                .AsNoTracking()
                .Where(x => x.Id == periodId.Value)
                .Select(x => new
                {
                    x.Id,
                    x.StartDate,
                    x.EndDate,
                    x.Status
                })
                .FirstOrDefaultAsync(cancellationToken);

            return period is null
                ? null
                : new CompliancePeriodSummaryDto
                {
                    PayrollPeriodId = period.Id,
                    PayrollPeriodStartDate = period.StartDate,
                    PayrollPeriodEndDate = period.EndDate,
                    PayrollPeriodStatus = period.Status
                };
        }

        var firstRecord = records[0];

        return new CompliancePeriodSummaryDto
        {
            PayrollPeriodId = firstRecord.PayrollPeriodId,
            PayrollPeriodStartDate = firstRecord.PayrollPeriodStartDate,
            PayrollPeriodEndDate = firstRecord.PayrollPeriodEndDate,
            PayrollPeriodStatus = firstRecord.PayrollPeriodStatus,
            PayrollRecordCount = records.Count,
            GrossPayTotal = RoundMoney(records.Sum(x => x.GrossPay)),
            SssEmployeeTotal = RoundMoney(records.Sum(x => x.SssEmployeeContribution ?? 0m)),
            SssEmployerTotal = SumCaptured(records.Select(x => x.SssEmployerContribution)),
            SssContributionTotal = SumWhenAllCaptured(records.Select(x => x.SssEmployeeContribution), records.Select(x => x.SssEmployerContribution)),
            MissingSssNumberCount = records.Count(x => string.IsNullOrWhiteSpace(x.SssNumber)),
            PhilHealthEmployeeTotal = RoundMoney(records.Sum(x => x.PhilHealthEmployeeContribution ?? 0m)),
            PhilHealthEmployerTotal = SumCaptured(records.Select(x => x.PhilHealthEmployerContribution)),
            PhilHealthContributionTotal = SumWhenAllCaptured(records.Select(x => x.PhilHealthEmployeeContribution), records.Select(x => x.PhilHealthEmployerContribution)),
            MissingPhilHealthNumberCount = records.Count(x => string.IsNullOrWhiteSpace(x.PhilHealthNumber)),
            PagIbigEmployeeTotal = RoundMoney(records.Sum(x => x.PagIbigEmployeeContribution ?? 0m)),
            PagIbigEmployerTotal = SumCaptured(records.Select(x => x.PagIbigEmployerContribution)),
            PagIbigContributionTotal = SumWhenAllCaptured(records.Select(x => x.PagIbigEmployeeContribution), records.Select(x => x.PagIbigEmployerContribution)),
            MissingPagIbigNumberCount = records.Count(x => string.IsNullOrWhiteSpace(x.PagIbigNumber))
        };
    }

    public Task<ComplianceMonitoringResponseDto> GetSssMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default)
    {
        return GetMonitoringAsync(
            payrollPeriodId,
            search,
            x => x.SssNumber,
            SssDeductionDescription,
            SssEmployerDescription,
            cancellationToken);
    }

    public Task<ComplianceMonitoringResponseDto> GetPhilHealthMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default)
    {
        return GetMonitoringAsync(
            payrollPeriodId,
            search,
            x => x.PhilHealthNumber,
            PhilHealthDeductionDescription,
            PhilHealthEmployerDescription,
            cancellationToken);
    }

    public Task<ComplianceMonitoringResponseDto> GetPagIbigMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        CancellationToken cancellationToken = default)
    {
        return GetMonitoringAsync(
            payrollPeriodId,
            search,
            x => x.PagIbigNumber,
            PagIbigDeductionDescription,
            PagIbigEmployerDescription,
            cancellationToken);
    }

    public async Task<IReadOnlyList<Bir2316TrackingDto>> GetBir2316TrackingsAsync(
        int taxYear,
        string? search,
        CancellationToken cancellationToken = default)
    {
        ValidateTaxYear(taxYear);
        await EnsureBir2316TrackingsAsync(taxYear, cancellationToken);

        var totals = await BuildAnnualPayrollTotalsQuery(taxYear)
            .ToListAsync(cancellationToken);

        var totalsByEmployee = totals.ToDictionary(x => x.EmployeeId);
        var employeeIds = totalsByEmployee.Keys.ToList();

        var query = _context.Bir2316Trackings
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.EmployeeDocument)
            .Where(x => x.TaxYear == taxYear && employeeIds.Contains(x.EmployeeId));

        query = ApplyTrackingSearch(query, search);

        var trackings = await query
            .OrderBy(x => x.Employee.EmployeeNumber)
            .Select(x => new
            {
                x.Id,
                x.EmployeeId,
                x.TaxYear,
                x.Status,
                x.EmployeeDocumentId,
                EmployeeDocumentName = x.EmployeeDocument == null
                    ? null
                    : x.EmployeeDocument.OriginalFileName,
                x.PreparedAtUtc,
                x.ReleasedAtUtc,
                x.AcknowledgedAtUtc,
                x.CreatedAtUtc,
                x.UpdatedAtUtc,
                x.Employee.EmployeeNumber,
                x.Employee.FirstName,
                x.Employee.LastName,
                x.Employee.Department,
                x.Employee.Position,
                x.Employee.TinNumber
            })
            .ToListAsync(cancellationToken);

        return trackings
            .Select(x =>
            {
                var employeeTotals = totalsByEmployee[x.EmployeeId];

                return new Bir2316TrackingDto
                {
                    Id = x.Id,
                    EmployeeId = x.EmployeeId,
                    EmployeeNumber = x.EmployeeNumber,
                    EmployeeName = BuildEmployeeName(x.FirstName, x.LastName),
                    Department = x.Department ?? string.Empty,
                    Position = x.Position ?? string.Empty,
                    TinNumber = x.TinNumber,
                    TaxYear = x.TaxYear,
                    AnnualTaxableCompensation = employeeTotals.AnnualTaxableCompensation,
                    AnnualWithholdingTax = employeeTotals.AnnualWithholdingTax,
                    Status = x.Status,
                    EmployeeDocumentId = x.EmployeeDocumentId,
                    EmployeeDocumentName = x.EmployeeDocumentName,
                    PreparedAtUtc = x.PreparedAtUtc,
                    ReleasedAtUtc = x.ReleasedAtUtc,
                    AcknowledgedAtUtc = x.AcknowledgedAtUtc,
                    CreatedAtUtc = x.CreatedAtUtc,
                    UpdatedAtUtc = x.UpdatedAtUtc
                };
            })
            .ToList();
    }

    public async Task<Bir2316TrackingDto?> UpdateBir2316TrackingAsync(
        int id,
        UpdateBir2316TrackingRequest request,
        CancellationToken cancellationToken = default)
    {
        var tracking = await _context.Bir2316Trackings
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tracking is null)
        {
            return null;
        }

        var normalizedStatus = request.Status.Trim();

        if (!IsValidBirStatus(normalizedStatus))
        {
            throw new ArgumentException("BIR 2316 tracking status is invalid.");
        }

        if (request.EmployeeDocumentId.HasValue)
        {
            var documentBelongsToEmployee = await _context.EmployeeDocuments
                .AsNoTracking()
                .AnyAsync(document =>
                    document.Id == request.EmployeeDocumentId.Value &&
                    document.EmployeeId == tracking.EmployeeId,
                    cancellationToken);

            if (!documentBelongsToEmployee)
            {
                throw new InvalidOperationException("Linked document must belong to the same employee.");
            }
        }

        var now = DateTime.UtcNow;

        tracking.Status = normalizedStatus;
        tracking.EmployeeDocumentId = request.EmployeeDocumentId;
        tracking.UpdatedAtUtc = now;

        if (normalizedStatus == "Prepared" && tracking.PreparedAtUtc is null)
            tracking.PreparedAtUtc = now;

        if (normalizedStatus == "Released" && tracking.ReleasedAtUtc is null)
            tracking.ReleasedAtUtc = now;

        if (normalizedStatus == "Acknowledged" && tracking.AcknowledgedAtUtc is null)
            tracking.AcknowledgedAtUtc = now;

        await _context.SaveChangesAsync(cancellationToken);

        return (await GetBir2316TrackingsAsync(
                tracking.TaxYear,
                tracking.Employee.EmployeeNumber,
                cancellationToken))
            .FirstOrDefault(x => x.Id == tracking.Id);
    }

    public async Task<IReadOnlyList<EmploymentStatusHistoryDto>> GetEmploymentStatusHistoryAsync(
        Guid? employeeId,
        string? search,
        DateOnly? dateFrom,
        DateOnly? dateTo,
        CancellationToken cancellationToken = default)
    {
        if (dateFrom.HasValue && dateTo.HasValue && dateTo.Value < dateFrom.Value)
        {
            throw new ArgumentException("Date-to cannot be earlier than date-from.");
        }

        var query = _context.EmploymentStatusHistories
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ChangedByUser)
            .AsQueryable();

        if (employeeId.HasValue)
        {
            query = query.Where(x => x.EmployeeId == employeeId.Value);
        }

        if (dateFrom.HasValue)
        {
            var from = dateFrom.Value.ToDateTime(TimeOnly.MinValue);
            query = query.Where(x => x.ChangedAtUtc >= from);
        }

        if (dateTo.HasValue)
        {
            var to = dateTo.Value.ToDateTime(TimeOnly.MaxValue);
            query = query.Where(x => x.ChangedAtUtc <= to);
        }

        query = ApplyHistorySearch(query, search);

        return await query
            .OrderByDescending(x => x.ChangedAtUtc)
            .ThenBy(x => x.Employee.EmployeeNumber)
            .Select(x => new EmploymentStatusHistoryDto
            {
                Id = x.Id,
                EmployeeId = x.EmployeeId,
                EmployeeNumber = x.Employee.EmployeeNumber,
                EmployeeName = x.Employee.FirstName + " " + x.Employee.LastName,
                Department = x.Employee.Department ?? string.Empty,
                Position = x.Employee.Position ?? string.Empty,
                PreviousEmploymentStatus = x.PreviousEmploymentStatus,
                NewEmploymentStatus = x.NewEmploymentStatus,
                PreviousIsActive = x.PreviousIsActive,
                NewIsActive = x.NewIsActive,
                ChangedAtUtc = x.ChangedAtUtc,
                ChangedByUserId = x.ChangedByUserId,
                ChangedByUserName = x.ChangedByUser == null ? null : x.ChangedByUser.FullName,
                ChangedByUserEmail = x.ChangedByUser == null ? null : x.ChangedByUser.Email
            })
            .ToListAsync(cancellationToken);
    }

    private async Task<ComplianceMonitoringResponseDto> GetMonitoringAsync(
        int? payrollPeriodId,
        string? search,
        Func<Employee, string?> governmentNumberSelector,
        string deductionDescription,
        string employerDescription,
        CancellationToken cancellationToken)
    {
        var periodId = await ResolvePayrollPeriodIdAsync(payrollPeriodId, cancellationToken);

        if (!periodId.HasValue)
        {
            return new ComplianceMonitoringResponseDto();
        }

        var summary = await GetComplianceSummaryAsync(periodId, search, cancellationToken);

        var rows = await BuildPayrollRecordQuery(periodId.Value, search)
            .OrderBy(record => record.Employee.EmployeeNumber)
            .Select(record => new
            {
                record.Id,
                record.EmployeeId,
                record.Employee.EmployeeNumber,
                record.Employee.FirstName,
                record.Employee.LastName,
                record.Employee.Department,
                record.Employee.Position,
                record.Employee.SssNumber,
                record.Employee.PhilHealthNumber,
                record.Employee.PagIbigNumber,
                record.GrossPay,
                record.Status,
                EmployeeContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeDeduction && item.Description == deductionDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault(),
                EmployerContribution = record.Items
                    .Where(item => item.Type == PayrollItemTypeEmployerContribution && item.Description == employerDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault()
            })
            .ToListAsync(cancellationToken);

        return new ComplianceMonitoringResponseDto
        {
            Summary = summary,
            Items = rows.Select(x =>
            {
                var employee = new Employee
                {
                    SssNumber = x.SssNumber,
                    PhilHealthNumber = x.PhilHealthNumber,
                    PagIbigNumber = x.PagIbigNumber
                };

                var employeeContribution = x.EmployeeContribution ?? 0m;

                return new ComplianceMonitoringRowDto
                {
                    PayrollRecordId = x.Id,
                    EmployeeId = x.EmployeeId,
                    EmployeeNumber = x.EmployeeNumber,
                    EmployeeName = BuildEmployeeName(x.FirstName, x.LastName),
                    Department = x.Department ?? string.Empty,
                    Position = x.Position ?? string.Empty,
                    GovernmentNumber = governmentNumberSelector(employee),
                    GrossPay = x.GrossPay,
                    EmployeeContribution = employeeContribution,
                    EmployerContribution = x.EmployerContribution,
                    TotalContribution = x.EmployerContribution.HasValue
                        ? RoundMoney(employeeContribution + x.EmployerContribution.Value)
                        : null,
                    PayrollStatus = x.Status
                };
            }).ToList()
        };
    }

    private IQueryable<PayrollRecord> BuildPayrollRecordQuery(int payrollPeriodId, string? search)
    {
        var query = _context.PayrollRecords
            .AsNoTracking()
            .Include(record => record.PayrollPeriod)
            .Include(record => record.Employee)
            .Include(record => record.Items)
            .Where(record =>
                record.PayrollPeriodId == payrollPeriodId &&
                TrackablePayrollStatuses.Contains(record.PayrollPeriod.Status) &&
                TrackablePayrollStatuses.Contains(record.Status));

        return ApplyPayrollSearch(query, search);
    }

    private async Task<int?> ResolvePayrollPeriodIdAsync(
        int? payrollPeriodId,
        CancellationToken cancellationToken)
    {
        if (payrollPeriodId.HasValue)
        {
            var exists = await _context.PayrollPeriods
                .AsNoTracking()
                .AnyAsync(period =>
                    period.Id == payrollPeriodId.Value &&
                    TrackablePayrollStatuses.Contains(period.Status),
                    cancellationToken);

            return exists ? payrollPeriodId.Value : null;
        }

        return await _context.PayrollPeriods
            .AsNoTracking()
            .Where(period => TrackablePayrollStatuses.Contains(period.Status))
            .OrderByDescending(period => period.EndDate)
            .ThenByDescending(period => period.Id)
            .Select(period => (int?)period.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task EnsureBir2316TrackingsAsync(
        int taxYear,
        CancellationToken cancellationToken)
    {
        var employeeIds = await BuildAnnualPayrollTotalsQuery(taxYear)
            .Select(x => x.EmployeeId)
            .ToListAsync(cancellationToken);

        if (employeeIds.Count == 0)
        {
            return;
        }

        var existingEmployeeIds = await _context.Bir2316Trackings
            .Where(x => x.TaxYear == taxYear && employeeIds.Contains(x.EmployeeId))
            .Select(x => x.EmployeeId)
            .ToListAsync(cancellationToken);

        var existingSet = existingEmployeeIds.ToHashSet();
        var now = DateTime.UtcNow;

        foreach (var employeeId in employeeIds.Where(x => !existingSet.Contains(x)))
        {
            _context.Bir2316Trackings.Add(new Bir2316Tracking
            {
                EmployeeId = employeeId,
                TaxYear = taxYear,
                Status = "Pending",
                CreatedAtUtc = now
            });
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private IQueryable<AnnualPayrollTotalsProjection> BuildAnnualPayrollTotalsQuery(int taxYear)
    {
        var yearStart = new DateOnly(taxYear, 1, 1);
        var yearEnd = new DateOnly(taxYear, 12, 31);

        return _context.PayrollRecords
            .AsNoTracking()
            .Where(record =>
                TrackablePayrollStatuses.Contains(record.PayrollPeriod.Status) &&
                TrackablePayrollStatuses.Contains(record.Status) &&
                record.PayrollPeriod.StartDate <= yearEnd &&
                record.PayrollPeriod.EndDate >= yearStart)
            .Select(record => new
            {
                record.EmployeeId,
                record.GrossPay,
                MandatoryEmployeeContributions = record.Items
                    .Where(item =>
                        item.Type == PayrollItemTypeDeduction &&
                        (item.Description == SssDeductionDescription ||
                         item.Description == PhilHealthDeductionDescription ||
                         item.Description == PagIbigDeductionDescription))
                    .Select(item => (decimal?)item.Amount)
                    .Sum() ?? 0m,
                WithholdingTax = record.Items
                    .Where(item => item.Type == PayrollItemTypeDeduction && item.Description == WithholdingTaxDeductionDescription)
                    .Select(item => (decimal?)item.Amount)
                    .FirstOrDefault() ?? 0m
            })
            .GroupBy(record => record.EmployeeId)
            .Select(group => new AnnualPayrollTotalsProjection
            {
                EmployeeId = group.Key,
                AnnualTaxableCompensation = group.Sum(record => record.GrossPay - record.MandatoryEmployeeContributions),
                AnnualWithholdingTax = group.Sum(record => record.WithholdingTax)
            });
    }

    private static IQueryable<PayrollRecord> ApplyPayrollSearch(
        IQueryable<PayrollRecord> query,
        string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var term = search.Trim().ToLower();

        return query.Where(record =>
            record.Employee.EmployeeNumber.ToLower().Contains(term) ||
            record.Employee.FirstName.ToLower().Contains(term) ||
            record.Employee.LastName.ToLower().Contains(term) ||
            (record.Employee.Department != null && record.Employee.Department.ToLower().Contains(term)) ||
            (record.Employee.Position != null && record.Employee.Position.ToLower().Contains(term)));
    }

    private static IQueryable<Bir2316Tracking> ApplyTrackingSearch(
        IQueryable<Bir2316Tracking> query,
        string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var term = search.Trim().ToLower();

        return query.Where(x =>
            x.Employee.EmployeeNumber.ToLower().Contains(term) ||
            x.Employee.FirstName.ToLower().Contains(term) ||
            x.Employee.LastName.ToLower().Contains(term) ||
            (x.Employee.TinNumber != null && x.Employee.TinNumber.ToLower().Contains(term)) ||
            (x.Employee.Department != null && x.Employee.Department.ToLower().Contains(term)) ||
            (x.Employee.Position != null && x.Employee.Position.ToLower().Contains(term)));
    }

    private static IQueryable<EmploymentStatusHistory> ApplyHistorySearch(
        IQueryable<EmploymentStatusHistory> query,
        string? search)
    {
        if (string.IsNullOrWhiteSpace(search))
        {
            return query;
        }

        var term = search.Trim().ToLower();

        return query.Where(x =>
            x.Employee.EmployeeNumber.ToLower().Contains(term) ||
            x.Employee.FirstName.ToLower().Contains(term) ||
            x.Employee.LastName.ToLower().Contains(term) ||
            (x.Employee.Department != null && x.Employee.Department.ToLower().Contains(term)) ||
            (x.Employee.Position != null && x.Employee.Position.ToLower().Contains(term)));
    }

    private static decimal? SumCaptured(IEnumerable<decimal?> values)
    {
        var captured = values.ToList();

        return captured.Any(x => x.HasValue)
            ? RoundMoney(captured.Sum(x => x ?? 0m))
            : null;
    }

    private static decimal? SumWhenAllCaptured(
        IEnumerable<decimal?> employeeValues,
        IEnumerable<decimal?> employerValues)
    {
        var employeeList = employeeValues.ToList();
        var employerList = employerValues.ToList();

        return employerList.Any(x => x.HasValue)
            ? RoundMoney(employeeList.Sum(x => x ?? 0m) + employerList.Sum(x => x ?? 0m))
            : null;
    }

    private static void ValidateTaxYear(int taxYear)
    {
        if (taxYear is < 1900 or > 9999)
        {
            throw new ArgumentException("A valid tax year is required.");
        }
    }

    private static bool IsValidBirStatus(string status)
    {
        return status is "Pending" or "Prepared" or "Released" or "Acknowledged";
    }

    private static string BuildEmployeeName(string firstName, string lastName)
    {
        return $"{firstName} {lastName}";
    }

    private static decimal RoundMoney(decimal amount)
    {
        return Math.Round(amount, 2, MidpointRounding.AwayFromZero);
    }

    private sealed class PayrollContributionProjection
    {
        public int PayrollPeriodId { get; set; }
        public DateOnly PayrollPeriodStartDate { get; set; }
        public DateOnly PayrollPeriodEndDate { get; set; }
        public string PayrollPeriodStatus { get; set; } = string.Empty;
        public decimal GrossPay { get; set; }
        public string? SssNumber { get; set; }
        public string? PhilHealthNumber { get; set; }
        public string? PagIbigNumber { get; set; }
        public decimal? SssEmployeeContribution { get; set; }
        public decimal? SssEmployerContribution { get; set; }
        public decimal? PhilHealthEmployeeContribution { get; set; }
        public decimal? PhilHealthEmployerContribution { get; set; }
        public decimal? PagIbigEmployeeContribution { get; set; }
        public decimal? PagIbigEmployerContribution { get; set; }
    }

    private sealed class AnnualPayrollTotalsProjection
    {
        public Guid EmployeeId { get; set; }
        public decimal AnnualTaxableCompensation { get; set; }
        public decimal AnnualWithholdingTax { get; set; }
    }
}

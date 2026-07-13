using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public class DailyReportsService : IDailyReportsService
{
    private readonly AppDbContext _db;
    private const int MaxPageSize = 100;

    public DailyReportsService(AppDbContext db) => _db = db;

    private async Task<Employee> GetCurrentEmployeeAsync(ClaimsPrincipal user)
    {
        var userIdRaw =
            user.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user.FindFirstValue("sub");

        if (!long.TryParse(userIdRaw, out var userId))
            throw new ApiException("Invalid user.", StatusCodes.Status401Unauthorized);

        var employee = await _db.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (employee == null)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        return employee;
    }

    public async Task<DailyReportDto> CreateAsync(ClaimsPrincipal user, CreateDailyReportRequest request)
    {
        var employee = await GetCurrentEmployeeAsync(user);

        // Validate tasks
        if (request.Tasks.Count > 10)
            throw new ApiException("A report cannot have more than 10 tasks.", StatusCodes.Status400BadRequest);

        if (request.Tasks.Any(t => t.TaskNumber < 1 || t.TaskNumber > 10))
            throw new ApiException("TaskNumber must be between 1 and 10.", StatusCodes.Status400BadRequest);

        if (request.Tasks.GroupBy(t => t.TaskNumber).Any(g => g.Count() > 1))
            throw new ApiException("Duplicate TaskNumber values are not allowed.", StatusCodes.Status400BadRequest);

        var exists = await _db.DailyReports
            .AnyAsync(r => r.EmployeeId == employee.Id && r.ReportDate == request.ReportDate);

        if (exists)
            throw new ApiException("A report for this date already exists.", 409);

        var report = new DailyReport
        {
            EmployeeId           = employee.Id,
            ReportDate           = request.ReportDate,
            WorkArrangement      = request.WorkArrangement,
            SubmissionTime       = DateTime.UtcNow,
            Project              = request.Project,
            SprintIteration      = request.SprintIteration,
            TeamUnit             = request.TeamUnit,
            SubmittedToUserId    = request.SubmittedToUserId,
            TimeIn               = request.TimeIn,
            TimeOut              = request.TimeOut,
            BreakDurationMinutes = request.BreakDurationMinutes,
            AttendedStandup      = request.AttendedStandup,
            ReachableViaComms    = request.ReachableViaComms,
            AvgResponseTime      = request.AvgResponseTime,
            ConnectivityIssues   = request.ConnectivityIssues,
            CollaborationLog     = request.CollaborationLog,
            Tasks = request.Tasks.Select(t => new DailyReportTask
            {
                TaskNumber        = t.TaskNumber,
                IsCarryOver       = t.IsCarryOver,
                Priority          = t.Priority,
                TaskType          = t.TaskType,
                TicketRefNo       = t.TicketRefNo,
                Description       = t.Description,
                Module            = t.Module,
                Status            = t.Status,
                PercentDone       = t.PercentDone,
                EstimatedHours    = t.EstimatedHours,
                ActualHours       = t.ActualHours,
                OutputDeliverable = t.OutputDeliverable,
                CommitPrLink      = t.CommitPrLink,
                BlockedByRemarks  = t.BlockedByRemarks
            }).ToList()
        };

        _db.DailyReports.Add(report);
        await _db.SaveChangesAsync();

        return await GetByIdAsync(report.Id) ?? throw new InvalidOperationException();
    }

    public async Task<DailyReportDto> UpdateAsync(int id, ClaimsPrincipal user, UpdateDailyReportRequest request)
    {
        var employee = await GetCurrentEmployeeAsync(user);

        var report = await _db.DailyReports
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            throw new ApiException("Report not found.", StatusCodes.Status404NotFound);

        if (report.EmployeeId != employee.Id)
            throw new ApiException("You can only update your own report.", StatusCodes.Status403Forbidden);

        // Section 4 — only update if provided
        if (request.KeyAccomplishments != null)
            report.KeyAccomplishments = request.KeyAccomplishments;
        if (request.BlockersIssues != null)
            report.BlockersIssues = request.BlockersIssues;
        if (request.RisksEarlyWarnings != null)
            report.RisksEarlyWarnings = request.RisksEarlyWarnings;
        if (request.PlanForTomorrow != null)
            report.PlanForTomorrow = request.PlanForTomorrow;
        if (request.SupportEscalationNeeded != null)
            report.SupportEscalationNeeded = request.SupportEscalationNeeded;

        // Section 5 — only update if provided
        if (request.CodeCommitted.HasValue)
            report.CodeCommitted = request.CodeCommitted.Value;
        if (request.TicketsUpdated.HasValue)
            report.TicketsUpdated = request.TicketsUpdated.Value;
        if (request.PullRequestCreated.HasValue)
            report.PullRequestCreated = request.PullRequestCreated.Value;
        if (request.DocumentationUpdated.HasValue)
            report.DocumentationUpdated = request.DocumentationUpdated.Value;
        if (request.TestsPassing.HasValue)
            report.TestsPassing = request.TestsPassing.Value;
        if (request.ReportSubmittedOnTime.HasValue)
            report.ReportSubmittedOnTime = request.ReportSubmittedOnTime.Value;

        // Section 6 — only update if provided
        if (request.WorkArrangementTomorrow != null)
            report.WorkArrangementTomorrow = request.WorkArrangementTomorrow;
        if (request.ExpectedTimeIn.HasValue)
            report.ExpectedTimeIn = request.ExpectedTimeIn.Value;
        if (request.LeaveAbsenceNotice != null)
            report.LeaveAbsenceNotice = request.LeaveAbsenceNotice;

        await _db.SaveChangesAsync();

        return await GetByIdAsync(id) ?? throw new InvalidOperationException();
    }

    public async Task<DailyReportDto> AddSupervisorRemarksAsync(int id, SupervisorRemarksRequest request)
    {
        var report = await _db.DailyReports
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            throw new ApiException("Report not found.", StatusCodes.Status404NotFound);

        // Section 7 — only update if provided
        if (request.SupervisorNotes != null)
            report.SupervisorNotes = request.SupervisorNotes;
        if (request.PerformanceRating != null)
            report.PerformanceRating = request.PerformanceRating;
        if (request.FollowUpRequired.HasValue)
            report.FollowUpRequired = request.FollowUpRequired.Value;
        if (request.ReviewDate.HasValue)
            report.ReviewDate = request.ReviewDate.Value;
        if (request.ManagerActionItems != null)
            report.ManagerActionItems = request.ManagerActionItems;

        // Section 8
        if (request.ReviewedBy != null)
            report.ReviewedBy = request.ReviewedBy;
        if (request.DateReviewed.HasValue)
            report.DateReviewed = request.DateReviewed.Value;

        await _db.SaveChangesAsync();

        return await GetByIdAsync(id) ?? throw new InvalidOperationException();
    }

    public async Task<DailyReportDto?> GetByIdAsync(int id)
    {
        var report = await _db.DailyReports
            .Include(r => r.Employee)
            .Include(r => r.Tasks)
            .FirstOrDefaultAsync(r => r.Id == id);

        return report is null ? null : MapToDto(report);
    }

    public async Task<DailyReportDto?> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date)
    {
        var report = await _db.DailyReports
            .Include(r => r.Employee)
            .Include(r => r.Tasks)
            .FirstOrDefaultAsync(r => r.EmployeeId == employeeId && r.ReportDate == date);

        return report is null ? null : MapToDto(report);
    }

    public async Task<List<DailyReportDto>> GetAllAsync(GetDailyReportsQuery query)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, MaxPageSize);

        var q = _db.DailyReports
            .Include(r => r.Employee)
            .Include(r => r.Tasks)
            .AsQueryable();

        if (query.EmployeeId.HasValue)
            q = q.Where(r => r.EmployeeId == query.EmployeeId);

        if (query.Date.HasValue)
            q = q.Where(r => r.ReportDate == query.Date);

        var reports = await q
            .OrderByDescending(r => r.ReportDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return reports.Select(MapToDto).ToList();
    }

    private static DailyReportDto MapToDto(DailyReport report) => new()
    {
        Id                   = report.Id,
        EmployeeId           = report.EmployeeId,
        EmployeeName         = $"{report.Employee.FirstName} {report.Employee.LastName}",
        ReportDate           = report.ReportDate,
        WorkArrangement      = report.WorkArrangement,
        SubmissionTime       = report.SubmissionTime,
        Project              = report.Project,
        SprintIteration      = report.SprintIteration,
        TeamUnit             = report.TeamUnit,
        SubmittedToUserId    = report.SubmittedToUserId,
        TimeIn               = report.TimeIn,
        TimeOut              = report.TimeOut,
        BreakDurationMinutes = report.BreakDurationMinutes,
        AttendedStandup      = report.AttendedStandup,
        ReachableViaComms    = report.ReachableViaComms,
        AvgResponseTime      = report.AvgResponseTime,
        ConnectivityIssues   = report.ConnectivityIssues,
        CollaborationLog     = report.CollaborationLog,
        KeyAccomplishments      = report.KeyAccomplishments,
        BlockersIssues          = report.BlockersIssues,
        RisksEarlyWarnings      = report.RisksEarlyWarnings,
        PlanForTomorrow         = report.PlanForTomorrow,
        SupportEscalationNeeded = report.SupportEscalationNeeded,
        CodeCommitted         = report.CodeCommitted,
        TicketsUpdated        = report.TicketsUpdated,
        PullRequestCreated    = report.PullRequestCreated,
        DocumentationUpdated  = report.DocumentationUpdated,
        TestsPassing          = report.TestsPassing,
        ReportSubmittedOnTime = report.ReportSubmittedOnTime,
        ChecklistCompletedCount = new[] {
            report.CodeCommitted, report.TicketsUpdated, report.PullRequestCreated,
            report.DocumentationUpdated, report.TestsPassing, report.ReportSubmittedOnTime
        }.Count(x => x),
        WorkArrangementTomorrow = report.WorkArrangementTomorrow,
        ExpectedTimeIn          = report.ExpectedTimeIn,
        LeaveAbsenceNotice      = report.LeaveAbsenceNotice,
        SupervisorNotes    = report.SupervisorNotes,
        PerformanceRating  = report.PerformanceRating,
        FollowUpRequired   = report.FollowUpRequired,
        ReviewDate         = report.ReviewDate,
        ManagerActionItems = report.ManagerActionItems,
        ReviewedBy  = report.ReviewedBy,
        DateReviewed = report.DateReviewed,
        Tasks = report.Tasks.Select(t => new DailyReportTaskDto
        {
            Id                = t.Id,
            TaskNumber        = t.TaskNumber,
            IsCarryOver       = t.IsCarryOver,
            Priority          = t.Priority,
            TaskType          = t.TaskType,
            TicketRefNo       = t.TicketRefNo,
            Description       = t.Description,
            Module            = t.Module,
            Status            = t.Status,
            PercentDone       = t.PercentDone,
            EstimatedHours    = t.EstimatedHours,
            ActualHours       = t.ActualHours,
            OutputDeliverable = t.OutputDeliverable,
            CommitPrLink      = t.CommitPrLink,
            BlockedByRemarks  = t.BlockedByRemarks
        }).ToList()
    };
}
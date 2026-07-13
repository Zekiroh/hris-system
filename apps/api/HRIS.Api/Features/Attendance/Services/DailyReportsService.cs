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

    public DailyReportsService(AppDbContext db) => _db = db;

    public async Task<DailyReportDto> CreateAsync(ClaimsPrincipal user, CreateDailyReportRequest request)
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
        var userIdRaw =
            user.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user.FindFirstValue("sub");

        if (!long.TryParse(userIdRaw, out var userId))
            throw new ApiException("Invalid user.", StatusCodes.Status401Unauthorized);

        var employee = await _db.Employees
            .FirstOrDefaultAsync(x => x.UserId == userId);

        if (employee == null)
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);

        var report = await _db.DailyReports
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            throw new ApiException("Report not found.", StatusCodes.Status404NotFound);

        if (report.EmployeeId != employee.Id)
            throw new ApiException("You can only update your own report.", StatusCodes.Status403Forbidden);

        // Section 4
        report.KeyAccomplishments      = request.KeyAccomplishments;
        report.BlockersIssues          = request.BlockersIssues;
        report.RisksEarlyWarnings      = request.RisksEarlyWarnings;
        report.PlanForTomorrow         = request.PlanForTomorrow;
        report.SupportEscalationNeeded = request.SupportEscalationNeeded;

        // Section 5
        report.CodeCommitted         = request.CodeCommitted;
        report.TicketsUpdated        = request.TicketsUpdated;
        report.PullRequestCreated    = request.PullRequestCreated;
        report.DocumentationUpdated  = request.DocumentationUpdated;
        report.TestsPassing          = request.TestsPassing;
        report.ReportSubmittedOnTime = request.ReportSubmittedOnTime;

        // Section 6
        report.WorkArrangementTomorrow = request.WorkArrangementTomorrow;
        report.ExpectedTimeIn          = request.ExpectedTimeIn;
        report.LeaveAbsenceNotice      = request.LeaveAbsenceNotice;

        await _db.SaveChangesAsync();

        return await GetByIdAsync(id) ?? throw new InvalidOperationException();
    }

    public async Task<DailyReportDto> AddSupervisorRemarksAsync(int id, SupervisorRemarksRequest request)
    {
        var report = await _db.DailyReports
            .FirstOrDefaultAsync(r => r.Id == id);

        if (report == null)
            throw new ApiException("Report not found.", StatusCodes.Status404NotFound);

        // Section 7
        report.SupervisorNotes    = request.SupervisorNotes;
        report.PerformanceRating  = request.PerformanceRating;
        report.FollowUpRequired   = request.FollowUpRequired;
        report.ReviewDate         = request.ReviewDate;
        report.ManagerActionItems = request.ManagerActionItems;

        // Section 8
        report.ReviewedBy   = request.ReviewedBy;
        report.DateReviewed = request.DateReviewed;

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
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
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

        // Section 4
        KeyAccomplishments      = report.KeyAccomplishments,
        BlockersIssues          = report.BlockersIssues,
        RisksEarlyWarnings      = report.RisksEarlyWarnings,
        PlanForTomorrow         = report.PlanForTomorrow,
        SupportEscalationNeeded = report.SupportEscalationNeeded,

        // Section 5
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

        // Section 6
        WorkArrangementTomorrow = report.WorkArrangementTomorrow,
        ExpectedTimeIn          = report.ExpectedTimeIn,
        LeaveAbsenceNotice      = report.LeaveAbsenceNotice,

        // Section 7
        SupervisorNotes    = report.SupervisorNotes,
        PerformanceRating  = report.PerformanceRating,
        FollowUpRequired   = report.FollowUpRequired,
        ReviewDate         = report.ReviewDate,
        ManagerActionItems = report.ManagerActionItems,

        // Section 8
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
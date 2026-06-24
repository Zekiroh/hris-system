using System.Security.Claims;
using HRIS.Api.Data;
using HRIS.Api.Features.Common.Exceptions;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Features.PerformanceManagement.DTOs;
using HRIS.Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.PerformanceManagement.Services;

public class PerformanceEvaluationService : IPerformanceEvaluationService
{
    private readonly AppDbContext _context;
    private readonly IActivityLogger _activityLogger;

    public PerformanceEvaluationService(
        AppDbContext context,
        IActivityLogger activityLogger)
    {
        _context = context;
        _activityLogger = activityLogger;
    }

    public async Task<IReadOnlyList<PerformanceEvaluationDto>> GetAllAsync()
    {
        var evaluations = await _context.PerformanceEvaluations
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewerUser)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        return evaluations
            .Select(ToDto)
            .ToList();
    }

    public async Task<PerformanceEvaluationDto> GetByIdAsync(Guid id)
    {
        var evaluation = await _context.PerformanceEvaluations
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewerUser)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (evaluation is null)
        {
            throw new ApiException("Performance evaluation not found.", StatusCodes.Status404NotFound);
        }

        return ToDto(evaluation);
    }

    public async Task<IReadOnlyList<PerformanceEvaluationDto>> GetMyEvaluationsAsync(
        ClaimsPrincipal actor)
    {
        var userId = GetUserId(actor);

        if (!userId.HasValue)
        {
            return [];
        }

        var employee = await _context.Employees
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == userId.Value);

        if (employee is null)
        {
            return [];
        }

        var evaluations = await _context.PerformanceEvaluations
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.ReviewerUser)
            .Where(x => x.EmployeeId == employee.Id)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync();

        return evaluations
            .Select(ToDto)
            .ToList();
    }

    public async Task<PerformanceEvaluationDto> CreateAsync(
        ClaimsPrincipal actor,
        CreatePerformanceEvaluationRequest request,
        string? ipAddress,
        string? userAgent)
    {
        var reviewPeriod = NormalizeRequired(
            request.ReviewPeriod,
            100,
            "Review period is required.",
            "Review period cannot exceed 100 characters.");

        var rating = NormalizeRequired(
            request.Rating,
            50,
            "Rating is required.",
            "Rating cannot exceed 50 characters.");

        var remarks = NormalizeOptional(
            request.Remarks,
            1000,
            "Remarks cannot exceed 1000 characters.");

        if (request.Score < 0 || request.Score > 5)
        {
            throw new ApiException("Score must be between 0 and 5.", StatusCodes.Status400BadRequest);
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(x => x.Id == request.EmployeeId);

        if (employee is null)
        {
            throw new ApiException("Employee not found.", StatusCodes.Status404NotFound);
        }

        var evaluation = new PerformanceEvaluation
        {
            Id = Guid.NewGuid(),
            EmployeeId = employee.Id,
            ReviewerUserId = GetUserId(actor),
            ReviewPeriod = reviewPeriod,
            Score = request.Score,
            Rating = rating,
            Remarks = remarks,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.PerformanceEvaluations.Add(evaluation);

        AddActivityLog(
            actor,
            "PERFORMANCE_EVALUATION_CREATED",
            "PERFORMANCE_MANAGEMENT",
            "PerformanceEvaluation",
            evaluation.Id.ToString(),
            $"Created performance evaluation for {FormatEmployeeName(employee)}.",
            ipAddress,
            userAgent);

        await _context.SaveChangesAsync();

        evaluation.Employee = employee;

        if (evaluation.ReviewerUserId.HasValue)
        {
            evaluation.ReviewerUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == evaluation.ReviewerUserId.Value);
        }

        return ToDto(evaluation);
    }

    private static PerformanceEvaluationDto ToDto(PerformanceEvaluation evaluation)
    {
        return new PerformanceEvaluationDto
        {
            Id = evaluation.Id,
            EmployeeId = evaluation.EmployeeId,
            EmployeeNumber = evaluation.Employee.EmployeeNumber,
            EmployeeName = FormatEmployeeName(evaluation.Employee),
            ReviewerUserId = evaluation.ReviewerUserId,
            ReviewerName = evaluation.ReviewerUser?.FullName,
            ReviewPeriod = evaluation.ReviewPeriod,
            Score = evaluation.Score,
            Rating = evaluation.Rating,
            Remarks = evaluation.Remarks,
            CreatedAtUtc = evaluation.CreatedAtUtc,
            UpdatedAtUtc = evaluation.UpdatedAtUtc
        };
    }

    private void AddActivityLog(
        ClaimsPrincipal actor,
        string action,
        string module,
        string? targetType,
        string? targetId,
        string? summary,
        string? ipAddress,
        string? userAgent)
    {
        var log = _activityLogger.Build(
            actor,
            action,
            module,
            targetType,
            targetId,
            summary,
            ipAddress,
            userAgent);

        if (log is not null)
        {
            _context.ActivityLogs.Add(log);
        }
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

    private static string NormalizeRequired(
        string? value,
        int maxLength,
        string requiredMessage,
        string tooLongMessage)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            throw new ApiException(requiredMessage, StatusCodes.Status400BadRequest);
        }

        if (normalized.Length > maxLength)
        {
            throw new ApiException(tooLongMessage, StatusCodes.Status400BadRequest);
        }

        return normalized;
    }

    private static string? NormalizeOptional(
        string? value,
        int maxLength,
        string tooLongMessage)
    {
        var normalized = value?.Trim();

        if (string.IsNullOrWhiteSpace(normalized))
        {
            return null;
        }

        if (normalized.Length > maxLength)
        {
            throw new ApiException(tooLongMessage, StatusCodes.Status400BadRequest);
        }

        return normalized;
    }

    private static string FormatEmployeeName(Employee employee)
    {
        return string.Join(
            " ",
            new[]
            {
                employee.FirstName,
                employee.MiddleName,
                employee.LastName
            }.Where(x => !string.IsNullOrWhiteSpace(x)));
    }
}
using HRIS.Api.Data;
using HRIS.Api.Features.Attendance.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.Attendance.Services;

public class ShiftAssignmentsService : IShiftAssignmentsService
{
    private readonly AppDbContext _context;

    public ShiftAssignmentsService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeShiftAssignmentDto> AssignAsync(AssignShiftRequest request, CancellationToken ct)
    {
        // Validate existence
        var employeeExists = await _context.Employees.AnyAsync(x => x.Id == request.EmployeeId, ct);
        if (!employeeExists)
            throw new Exception("Employee not found.");

        var shiftExists = await _context.Shifts.AnyAsync(x => x.Id == request.ShiftId, ct);
        if (!shiftExists)
            throw new Exception("Shift not found.");

        // Deactivate current assignment
        var current = await _context.EmployeeShiftAssignments
            .Where(x => x.EmployeeId == request.EmployeeId && x.IsActive)
            .ToListAsync(ct);

        foreach (var item in current)
        {
            item.IsActive = false;
            item.EffectiveTo = request.EffectiveFrom;
        }

        // Create new assignment
        var assignment = new EmployeeShiftAssignment
        {
            EmployeeId = request.EmployeeId,
            ShiftId = request.ShiftId,
            EffectiveFrom = request.EffectiveFrom,
            IsActive = true
        };

        _context.EmployeeShiftAssignments.Add(assignment);

        await _context.SaveChangesAsync(ct);

        return MapToDto(assignment);
    }

    public async Task<EmployeeShiftAssignmentDto?> GetCurrentAsync(Guid employeeId, CancellationToken ct)
    {
        var assignment = await _context.EmployeeShiftAssignments
            .Where(x => x.EmployeeId == employeeId && x.IsActive)
            .OrderByDescending(x => x.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        return assignment == null ? null : MapToDto(assignment);
    }

    private static EmployeeShiftAssignmentDto MapToDto(EmployeeShiftAssignment x) => new()
    {
        Id = x.Id,
        EmployeeId = x.EmployeeId,
        ShiftId = x.ShiftId,
        EffectiveFrom = x.EffectiveFrom,
        EffectiveTo = x.EffectiveTo,
        IsActive = x.IsActive
    };
}
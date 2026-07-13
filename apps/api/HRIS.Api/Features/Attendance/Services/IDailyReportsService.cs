using System.Security.Claims;
using HRIS.Api.Features.Attendance.DTOs;

namespace HRIS.Api.Features.Attendance.Services;

public interface IDailyReportsService
{
    Task<DailyReportDto> CreateAsync(ClaimsPrincipal user, CreateDailyReportRequest request);
    Task<DailyReportDto?> GetByIdAsync(int id);
    Task<DailyReportDto?> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date);
    Task<List<DailyReportDto>> GetAllAsync(GetDailyReportsQuery query);
    Task<DailyReportDto> UpdateAsync(int id, ClaimsPrincipal user, UpdateDailyReportRequest request);
    Task<DailyReportDto> AddSupervisorRemarksAsync(int id, SupervisorRemarksRequest request);
}
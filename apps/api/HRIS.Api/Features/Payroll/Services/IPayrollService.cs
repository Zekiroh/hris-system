using System.Security.Claims;
using HRIS.Api.Features.Payroll.DTOs;

namespace HRIS.Api.Features.Payroll.Services;

public interface IPayrollService
{
    Task<PayrollPeriodDto> ProcessPayrollAsync(ProcessPayrollRequest request);

    Task<PayrollPeriodDto> ReleasePayrollPeriodAsync(int periodId);

    Task<IReadOnlyList<PayrollPeriodDto>> GetPayrollPeriodsAsync();

    Task<IReadOnlyList<PayrollRecordDto>> GetPayrollRecordsAsync(int payrollPeriodId);

    Task<IReadOnlyList<PayrollRecordDto>> GetPayslipsAsync(Guid employeeId);

    Task<IReadOnlyList<PayrollRecordDto>> GetMyPayslipsAsync(ClaimsPrincipal actor);

    Task<byte[]> GeneratePayslipPdfAsync(int payrollRecordId, ClaimsPrincipal actor);

    Task<IReadOnlyList<ThirteenthMonthPayDto>> GetThirteenthMonthPayAsync(int year);
}
using HRIS.Api.Features.Payroll.DTOs;

namespace HRIS.Api.Features.Payroll.Services;

public interface IPayrollService
{
    Task<PayrollPeriodDto> ProcessPayrollAsync(ProcessPayrollRequest request);

    Task<IReadOnlyList<PayrollPeriodDto>> GetPayrollPeriodsAsync();

    Task<IReadOnlyList<PayrollRecordDto>> GetPayrollRecordsAsync(int payrollPeriodId);

    Task<IReadOnlyList<PayrollRecordDto>> GetPayslipsAsync(Guid employeeId);
}
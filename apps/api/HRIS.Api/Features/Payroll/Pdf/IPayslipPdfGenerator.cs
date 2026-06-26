using HRIS.Api.Features.Payroll.DTOs;

namespace HRIS.Api.Features.Payroll.Pdf;

public interface IPayslipPdfGenerator
{
    byte[] Generate(PayrollRecordDto payslip);
}
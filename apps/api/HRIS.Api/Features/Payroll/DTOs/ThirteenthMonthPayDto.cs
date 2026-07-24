namespace HRIS.Api.Features.Payroll.DTOs;

public class ThirteenthMonthPayDto
{
    public Guid EmployeeId { get; set; }

    public string EmployeeNumber { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Position { get; set; } = string.Empty;

    public int Year { get; set; }

    public decimal BasicSalaryEarned { get; set; }

    public decimal ThirteenthMonthPay { get; set; }
}
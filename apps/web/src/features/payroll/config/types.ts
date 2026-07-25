import type { PayrollPeriodDto, PayrollRecordDto } from '../../../services/api/payroll/payroll';
import type { getEmployees } from '../../../services/api/employees/employees';

export type Tab = 'periods' | 'compensation' | 'payslips' | '13th';

export type PayrollRecordRow = {
    period: string;
    employees: number;
    grossPay: string;
    deductions: string;
    netPay: string;
    status: string;
    periodId: number;
    periodDto: PayrollPeriodDto;
    records: PayrollRecordDto[];
};

export type CompensationFormState = {
    employeeId: string;
    compensationType: string;
    baseAmount: string;
    effectiveFrom: string;
    effectiveTo: string;
    isActive: boolean;
};

export type EmployeesResponse = Awaited<ReturnType<typeof getEmployees>>;

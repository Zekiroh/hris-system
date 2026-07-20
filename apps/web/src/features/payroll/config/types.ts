import type { PayrollRecordDto } from '../../../lib/payroll';
import type { getEmployees } from '../../../lib/employees';

export type Tab = 'records' | 'compensation' | 'deductions' | '13th' | 'payslip';

export type PayrollRecordRow = {
    period: string;
    employees: number;
    grossPay: string;
    deductions: string;
    netPay: string;
    status: string;
    periodId: number;
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

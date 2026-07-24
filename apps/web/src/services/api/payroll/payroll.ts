import { apiRequest } from "../client";

export type PayrollPeriodDto = {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  processedAtUtc?: string | null;
  releasedAtUtc?: string | null;
  createdAtUtc: string;
};

export type PayrollRecordItemDto = {
  id: number;
  type: string;
  description: string;
  amount: number;
};

export type PayrollRecordDto = {
  id: number;
  payrollPeriodId: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  status: string;
  createdAtUtc: string;
  items: PayrollRecordItemDto[];
};

export type ProcessPayrollRequestDto = {
  startDate: string;
  endDate: string;
};

export type EmployeeCompensationDto = {
  id: number;
  employeeId: string;
  employeeNumber: string;
  employeeName: string;
  department: string;
  position: string;
  compensationType: string;
  baseAmount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  createdAtUtc: string;
  updatedAtUtc?: string | null;
};

export type CreateEmployeeCompensationRequestDto = {
  employeeId: string;
  compensationType: string;
  baseAmount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export type UpdateEmployeeCompensationRequestDto = {
  compensationType: string;
  baseAmount: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
};

export function processPayroll(dto: ProcessPayrollRequestDto) {
  return apiRequest<PayrollPeriodDto>("/api/payroll/process", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function getPayrollPeriods() {
  return apiRequest<PayrollPeriodDto[]>("/api/payroll/periods");
}

export function getPayrollRecords(periodId: number) {
  return apiRequest<PayrollRecordDto[]>(`/api/payroll/records/${periodId}`);
}

export function getEmployeePayslips(employeeId: string) {
  return apiRequest<PayrollRecordDto[]>(`/api/payroll/payslips/${employeeId}`);
}

export function getCompensations() {
  return apiRequest<EmployeeCompensationDto[]>("/api/payroll/compensations");
}

export function getEmployeeCompensations(employeeId: string) {
  return apiRequest<EmployeeCompensationDto[]>(
    `/api/payroll/compensations/employees/${employeeId}`
  );
}

export function createCompensation(dto: CreateEmployeeCompensationRequestDto) {
  return apiRequest<EmployeeCompensationDto>("/api/payroll/compensations", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function updateCompensation(
  id: number,
  dto: UpdateEmployeeCompensationRequestDto
) {
  return apiRequest<EmployeeCompensationDto>(`/api/payroll/compensations/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}
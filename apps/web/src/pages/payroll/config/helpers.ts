import type { PayrollPeriodDto } from '../../../lib/payroll';
import type { EmployeeDto } from '../../../lib/employees';
import type { EmployeesResponse } from './types';

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

export const formatDate = (value?: string | null) => {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

export const formatPeriod = (period: PayrollPeriodDto) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return `${period.startDate} - ${period.endDate}`;
    }

    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }

    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
};

export const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'E';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const getEmployeeDisplayName = (employee: EmployeeDto) => {
    const firstName = employee.firstName?.trim() ?? '';
    const lastName = employee.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || employee.employeeNumber;
};

export const extractEmployeeItems = (response: EmployeesResponse): EmployeeDto[] => {
    const payload = response && typeof response === 'object' && 'data' in response
        ? response.data
        : response;

    return payload && typeof payload === 'object' && 'items' in payload
        ? payload.items ?? []
        : [];
};

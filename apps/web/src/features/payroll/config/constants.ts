import {
    DollarSign,
    FileText,
    Printer,
    WalletCards,
} from 'lucide-react';
import type { CompensationFormState, Tab } from './types';

export const emptyCompensationForm: CompensationFormState = {
    employeeId: '',
    compensationType: 'Monthly',
    baseAmount: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    isActive: true,
};

export const tabs = [
    { id: 'periods' as Tab, label: 'Payroll Periods', icon: FileText },
    { id: 'compensation' as Tab, label: 'Employee Compensation', icon: WalletCards },
    { id: 'payslips' as Tab, label: 'Released Payslips', icon: Printer },
    { id: '13th' as Tab, label: '13th Month Pay', icon: DollarSign },
];

export const statusBadge: Record<string, string> = {
    Processed: 'badge-success',
    Released: 'badge-success',
    Active: 'badge-success',
    Inactive: 'badge-warning',
};

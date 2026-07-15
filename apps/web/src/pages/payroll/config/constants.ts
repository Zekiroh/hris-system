import {
    DollarSign,
    FileText,
    Printer,
    TrendingDown,
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
    { id: 'records' as Tab, label: 'Payroll Records', icon: FileText },
    { id: 'compensation' as Tab, label: 'Compensation', icon: WalletCards },
    { id: 'deductions' as Tab, label: 'Deductions', icon: TrendingDown },
    { id: '13th' as Tab, label: '13th Month Pay', icon: DollarSign },
    { id: 'payslip' as Tab, label: 'Payslip', icon: Printer },
];

export const govDeductions: Array<{ name: string; status: string; desc: string; color: string }> = [
    { name: 'SSS Contributions', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#2563eb' },
    { name: 'PhilHealth', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#059669' },
    { name: 'Pag-IBIG', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#d97706' },
    { name: 'Withholding Tax', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#dc2626' },
];

export const statusBadge: Record<string, string> = {
    Processed: 'badge-success',
    Pending: 'badge-warning',
    Computed: 'badge-success',
    Generated: 'badge-success',
    Active: 'badge-success',
    Inactive: 'badge-warning',
};

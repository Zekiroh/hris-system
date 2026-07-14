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

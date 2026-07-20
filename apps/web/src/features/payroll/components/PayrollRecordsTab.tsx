import { Eye } from 'lucide-react';
import { formatCurrency } from '../config/helpers';
import type { PayrollRecordRow } from '../config/types';

type PayrollRecordsTabProps = {
    loadingPayroll: boolean;
    payrollRecords: PayrollRecordRow[];
    totals: {
        grossPay: number;
        deductions: number;
        netPay: number;
    };
    onProcessPayroll: () => void;
    onViewRecord: (record: PayrollRecordRow) => void;
};

const statusBadge: Record<string, string> = {
    Processed: 'badge-success',
    Pending: 'badge-warning',
    Computed: 'badge-success',
    Generated: 'badge-success',
    Active: 'badge-success',
    Inactive: 'badge-warning',
};

const PayrollRecordsTab = ({
    loadingPayroll,
    payrollRecords,
    totals,
    onProcessPayroll,
    onViewRecord,
}: PayrollRecordsTabProps) => (
    <div className="space-y-5">
        <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">Payroll Records</h3>
            <button onClick={onProcessPayroll} className="btn btn-primary">Process Payroll</button>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead><tr>{['Period', 'Employees', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                    {loadingPayroll ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-sm text-gray-500">Loading payroll records...</td>
                        </tr>
                    ) : payrollRecords.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-sm text-gray-500">No payroll records found.</td>
                        </tr>
                    ) : (
                        payrollRecords.map((r, idx) => (
                            <tr key={r.periodId} style={{ animationDelay: `${idx * 0.05}s` }}>
                                <td className="font-medium">{r.period}</td>
                                <td>{r.employees}</td>
                                <td>{r.grossPay}</td>
                                <td className="!text-red-500">{r.deductions}</td>
                                <td className="font-bold">{r.netPay}</td>
                                <td><span className={`badge ${statusBadge[r.status] || 'badge-warning'}`}>● {r.status}</span></td>
                                <td>
                                    <button onClick={() => onViewRecord(r)} className="btn-ghost btn-icon text-slate-500">
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Payroll Summary</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-xl font-bold text-gray-900">{formatCurrency(totals.grossPay)}</p><p className="text-xs text-gray-500">Total Gross</p></div>
                <div><p className="text-xl font-bold text-red-500">{formatCurrency(totals.deductions)}</p><p className="text-xs text-gray-500">Total Deductions</p></div>
                <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netPay)}</p><p className="text-xs text-gray-500">Total Net</p></div>
            </div>
        </div>
    </div>
);

export default PayrollRecordsTab;

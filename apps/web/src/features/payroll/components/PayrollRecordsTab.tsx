import { CheckCircle2, Eye, Lock, PlayCircle } from 'lucide-react';
import { formatCurrency, formatDate, isProcessed, isReleased } from '../config/helpers';
import { usePayrollTablePagination } from '../config/pagination';
import type { PayrollRecordRow } from '../config/types';
import TablePagination, { TablePlaceholderRows } from './TablePagination';

type PayrollRecordsTabProps = {
    loadingPayroll: boolean;
    payrollRecords: PayrollRecordRow[];
    totals: {
        grossPay: number;
        deductions: number;
        netPay: number;
    };
    releasingPeriodId: number | null;
    onProcessPayroll: () => void;
    onViewRecord: (record: PayrollRecordRow) => void;
    onReleasePeriod: (periodId: number) => void;
};

const periodStatusBadge: Record<string, string> = {
    Processed: 'badge-warning',
    Released: 'badge-success',
};

const PayrollRecordsTab = ({
    loadingPayroll,
    payrollRecords,
    totals,
    releasingPeriodId,
    onProcessPayroll,
    onViewRecord,
    onReleasePeriod,
}: PayrollRecordsTabProps) => {
    const {
        currentPage,
        totalPages,
        pageItems: paginatedPayrollRecords,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(payrollRecords);

    return (
    <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 className="text-base font-bold text-gray-800">Payroll Periods</h3>
                <p className="text-sm text-gray-500">Process payroll, review records, and release periods when ready.</p>
            </div>
            <button onClick={onProcessPayroll} className="btn btn-primary" title="Process payroll">
                <PlayCircle className="w-4 h-4" /> Process Payroll
            </button>
        </div>

        {loadingPayroll ? (
            <p className="text-sm text-gray-500">Loading payroll periods...</p>
        ) : payrollRecords.length === 0 ? (
            <p className="text-sm text-gray-500">No payroll periods found.</p>
        ) : null}

        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead>
                    <tr>
                        {[
                            'Payroll Date Range',
                            'Employees',
                            'Gross Pay',
                            'Deductions',
                            'Net Pay',
                            'Status',
                            'Processed Date',
                            'Released Date',
                            'Actions',
                        ].map((header) => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {!loadingPayroll && (
                        paginatedPayrollRecords.map((row) => {
                            const canRelease = isProcessed(row.status);
                            const released = isReleased(row.status);
                            return (
                                <tr key={row.periodId}>
                                    <td className="font-medium whitespace-nowrap">{row.period}</td>
                                    <td>{row.employees}</td>
                                    <td>{row.grossPay}</td>
                                    <td className="!text-red-500">{row.deductions}</td>
                                    <td className="font-bold">{row.netPay}</td>
                                    <td>
                                        <span className={`badge ${periodStatusBadge[row.status] || 'badge-warning'}`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(row.periodDto.processedAtUtc)}</td>
                                    <td>{formatDate(row.periodDto.releasedAtUtc)}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onViewRecord(row)}
                                                className="btn-ghost btn-icon text-slate-500"
                                                title="View payroll period details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {canRelease && (
                                                <button
                                                    onClick={() => onReleasePeriod(row.periodId)}
                                                    disabled={releasingPeriodId === row.periodId}
                                                    className="btn-ghost btn-icon text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                                                    title="Release payroll period"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                            )}
                                            {released && (
                                                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                                                    <Lock className="w-3 h-3" /> Released
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    <TablePlaceholderRows
                        actualRowCount={loadingPayroll ? 0 : paginatedPayrollRecords.length}
                        columnCount={9}
                    />
                </tbody>
            </table>
            </div>

        <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loadingPayroll}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
        />

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Payroll Summary</h4>
            <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
                <div><p className="text-xl font-bold text-gray-900">{formatCurrency(totals.grossPay)}</p><p className="text-xs text-gray-500">Total Gross</p></div>
                <div><p className="text-xl font-bold text-red-500">{formatCurrency(totals.deductions)}</p><p className="text-xs text-gray-500">Total Deductions</p></div>
                <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netPay)}</p><p className="text-xs text-gray-500">Total Net</p></div>
            </div>
        </div>
    </div>
    );
};

export default PayrollRecordsTab;

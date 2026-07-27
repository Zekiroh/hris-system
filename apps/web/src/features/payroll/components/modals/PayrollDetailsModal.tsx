import { Download, X } from 'lucide-react';
import { formatCurrency, isReleased } from '../../config/helpers';
import { usePayrollTablePagination } from '../../config/pagination';
import type { PayrollRecordRow } from '../../config/types';
import TablePagination, { TablePlaceholderRows } from '../TablePagination';

type PayrollDetailsModalProps = {
    open: boolean;
    record: PayrollRecordRow | null;
    downloadingRecordId: number | null;
    onClose: () => void;
    onDownloadRecord: (recordId: number) => void;
};

const emptyPayrollRecords: PayrollRecordRow['records'] = [];

const PayrollDetailsModal = ({
    open,
    record,
    downloadingRecordId,
    onClose,
    onDownloadRecord,
}: PayrollDetailsModalProps) => {
    const employeeRecords = record?.records ?? emptyPayrollRecords;
    const {
        currentPage,
        totalPages,
        pageItems: paginatedEmployeeRecords,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(employeeRecords);

    if (!open || !record) return null;

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-5xl">
                <div className="pro-modal-header">
                    <div>
                        <h3>Payroll Period Details</h3>
                        <p className="text-sm text-gray-500">{record.period}</p>
                    </div>
                    <button onClick={onClose} className="btn-ghost btn-icon" title="Close payroll details">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-5">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-xs uppercase text-gray-400">Employees</p>
                            <p className="text-lg font-bold text-gray-800">{record.employees}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-xs uppercase text-gray-400">Gross Pay</p>
                            <p className="text-lg font-bold text-gray-800">{record.grossPay}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-xs uppercase text-gray-400">Deductions</p>
                            <p className="text-lg font-bold text-red-500">{record.deductions}</p>
                        </div>
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <p className="text-xs uppercase text-gray-400">Net Pay</p>
                            <p className="text-lg font-bold text-emerald-600">{record.netPay}</p>
                        </div>
                    </div>

                    {record.records.length === 0 && (
                        <p className="text-sm text-gray-500">No employee records found for this period.</p>
                    )}

                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="pro-table">
                            <thead>
                                <tr>
                                    {[
                                        'Employee Number',
                                        'Employee Name',
                                        'Department',
                                        'Position',
                                        'Earnings',
                                        'Deductions',
                                        'Gross Pay',
                                        'Total Deductions',
                                        'Net Pay',
                                        'Status',
                                        'PDF',
                                    ].map((header) => <th key={header}>{header}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {record.records.length > 0 && (
                                    paginatedEmployeeRecords.map((employeeRecord) => {
                                        const earnings = employeeRecord.items.filter((item) => item.type.toLowerCase() === 'earning');
                                        const deductions = employeeRecord.items.filter((item) => item.type.toLowerCase() === 'deduction');

                                        return (
                                            <tr key={employeeRecord.id} className="align-top">
                                                <td className="font-medium">{employeeRecord.employeeNumber}</td>
                                                <td>{employeeRecord.employeeName}</td>
                                                <td>{employeeRecord.department || '—'}</td>
                                                <td>{employeeRecord.position || '—'}</td>
                                                <td>
                                                    <div className="space-y-1">
                                                        {earnings.length === 0 ? '—' : earnings.map((item) => (
                                                            <div key={item.id} className="flex min-w-48 justify-between gap-3 text-xs">
                                                                <span className="text-gray-500">{item.description}</span>
                                                                <span className="font-semibold">{formatCurrency(item.amount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="space-y-1">
                                                        {deductions.length === 0 ? '—' : deductions.map((item) => (
                                                            <div key={item.id} className="flex min-w-48 justify-between gap-3 text-xs">
                                                                <span className="text-gray-500">{item.description}</span>
                                                                <span className="font-semibold text-red-500">{formatCurrency(item.amount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>{formatCurrency(employeeRecord.grossPay)}</td>
                                                <td className="!text-red-500">{formatCurrency(employeeRecord.totalDeductions)}</td>
                                                <td className="font-bold">{formatCurrency(employeeRecord.netPay)}</td>
                                                <td>
                                                    <span className={`badge ${isReleased(employeeRecord.status) ? 'badge-success' : 'badge-warning'}`}>
                                                        {employeeRecord.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    {isReleased(employeeRecord.status) ? (
                                                        <button
                                                            onClick={() => onDownloadRecord(employeeRecord.id)}
                                                            disabled={downloadingRecordId === employeeRecord.id}
                                                            className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50 disabled:opacity-50"
                                                            title="Download backend payslip PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">Unavailable</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                                <TablePlaceholderRows
                                    actualRowCount={paginatedEmployeeRecords.length}
                                    columnCount={11}
                                />
                            </tbody>
                        </table>
                    </div>
                    <TablePagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPrevious={goToPreviousPage}
                        onNext={goToNextPage}
                    />
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} className="btn btn-primary">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PayrollDetailsModal;

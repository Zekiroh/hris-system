import { useMemo, useState } from 'react';
import { Download, Eye, Search } from 'lucide-react';
import type { PayrollRecordDto } from '../../../services/api/payroll/payroll';
import { formatCurrency, formatDate, getRecordPeriodLabel } from '../config/helpers';
import { usePayrollTablePagination } from '../config/pagination';
import type { PayrollRecordRow } from '../config/types';
import TablePagination, { TablePlaceholderRows } from './TablePagination';

type PayslipTabProps = {
    loadingPayroll: boolean;
    releasedPayrollRows: PayrollRecordRow[];
    downloadingRecordId: number | null;
    onPreview: (record: PayrollRecordDto) => void;
    onDownload: (recordId: number) => void;
};

const PayslipTab = ({
    loadingPayroll,
    releasedPayrollRows,
    downloadingRecordId,
    onPreview,
    onDownload,
}: PayslipTabProps) => {
    const [selectedPeriodId, setSelectedPeriodId] = useState('all');
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const releasedRecords = useMemo(
        () => releasedPayrollRows.flatMap((row) => row.records.filter((record) => record.status === 'Released')),
        [releasedPayrollRows]
    );

    const departments = useMemo(
        () => Array.from(new Set(releasedRecords.map((record) => record.department).filter(Boolean))).sort(),
        [releasedRecords]
    );

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();

        return releasedRecords.filter((record) => {
            const matchesPeriod = selectedPeriodId === 'all' || record.payrollPeriodId === Number(selectedPeriodId);
            const matchesDepartment = departmentFilter === 'all' || record.department === departmentFilter;
            const matchesSearch = !query
                || record.employeeName.toLowerCase().includes(query)
                || record.employeeNumber.toLowerCase().includes(query);

            return matchesPeriod && matchesDepartment && matchesSearch;
        });
    }, [departmentFilter, releasedRecords, search, selectedPeriodId]);

    const {
        currentPage,
        totalPages,
        pageItems: paginatedRecords,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(filteredRecords);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-800">Released Payslips</h3>
                    <p className="text-sm text-gray-500">Download backend-generated PDFs from released payroll periods.</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <select value={selectedPeriodId} onChange={(event) => setSelectedPeriodId(event.target.value)} className="pro-select lg:w-64">
                    <option value="all">All Released Periods</option>
                    {releasedPayrollRows.map((row) => (
                        <option key={row.periodId} value={row.periodId}>{row.period}</option>
                    ))}
                </select>
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pro-input pl-11"
                        placeholder="Search employee name or number"
                    />
                </div>
                <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)} className="pro-select lg:w-56">
                    <option value="all">All Departments</option>
                    {departments.map((department) => (
                        <option key={department} value={department}>{department}</option>
                    ))}
                </select>
            </div>

            {loadingPayroll ? (
                <p className="text-sm text-gray-500">Loading released payslips...</p>
            ) : filteredRecords.length === 0 ? (
                <p className="text-sm text-gray-500">No released payslips found.</p>
            ) : null}

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                    <thead>
                        <tr>
                            {[
                                'Employee Number',
                                'Employee Name',
                                'Department',
                                'Position',
                                'Period Date Range',
                                'Released Date',
                                'Gross Pay',
                                'Deductions',
                                'Net Pay',
                                'Actions',
                            ].map((header) => <th key={header}>{header}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {!loadingPayroll && (
                            paginatedRecords.map((record) => (
                                <tr key={record.id}>
                                    <td className="font-medium">{record.employeeNumber}</td>
                                    <td>{record.employeeName}</td>
                                    <td>{record.department || '—'}</td>
                                    <td>{record.position || '—'}</td>
                                    <td className="whitespace-nowrap">{getRecordPeriodLabel(record)}</td>
                                    <td>{formatDate(record.releasedAtUtc)}</td>
                                    <td>{formatCurrency(record.grossPay)}</td>
                                    <td className="!text-red-500">{formatCurrency(record.totalDeductions)}</td>
                                    <td className="font-bold">{formatCurrency(record.netPay)}</td>
                                    <td>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => onPreview(record)}
                                                className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                                title="View payslip details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDownload(record.id)}
                                                disabled={downloadingRecordId === record.id}
                                                className="btn-ghost btn-icon text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                                                title="Download backend payslip PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        <TablePlaceholderRows
                            actualRowCount={loadingPayroll ? 0 : paginatedRecords.length}
                            columnCount={10}
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
        </div>
    );
};

export default PayslipTab;

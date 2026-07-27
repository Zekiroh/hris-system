import { RefreshCw } from 'lucide-react';
import type { ThirteenthMonthPayDto } from '../../../services/api/payroll/payroll';
import { formatCurrency } from '../config/helpers';
import { usePayrollTablePagination } from '../config/pagination';
import TablePagination, { TablePlaceholderRows } from './TablePagination';

type ThirteenthMonthTabProps = {
    year: string;
    records: ThirteenthMonthPayDto[];
    loading: boolean;
    loaded: boolean;
    error: string;
    summary: {
        totalEmployees: number;
        totalBasicSalaryEarned: number;
        totalThirteenthMonthPay: number;
    };
    onYearChange: (value: string) => void;
    onLoad: () => void;
};

const ThirteenthMonthTab = ({
    year,
    records,
    loading,
    loaded,
    error,
    summary,
    onYearChange,
    onLoad,
}: ThirteenthMonthTabProps) => {
    const {
        currentPage,
        totalPages,
        pageItems: paginatedRecords,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(records);

    return (
    <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h3 className="text-base font-bold text-gray-800">13th Month Pay</h3>
                <p className="text-sm text-gray-500">Retrieve backend-computed 13th-month pay by year.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                    type="number"
                    min="2000"
                    max="2100"
                    value={year}
                    onChange={(event) => onYearChange(event.target.value)}
                    className="pro-input sm:w-32"
                    aria-label="13th month payroll year"
                />
                <button onClick={onLoad} disabled={loading} className="btn btn-primary" title={loaded ? 'Refresh 13th month computation' : 'Load 13th month computation'}>
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {loaded ? 'Refresh' : 'Load Computation'}
                </button>
            </div>
        </div>

        {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Computation Summary</h4>
            <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
                <div><p className="text-xl font-bold text-gray-900">{loaded ? summary.totalEmployees : '—'}</p><p className="text-xs text-gray-500">Total Employees</p></div>
                <div><p className="text-xl font-bold text-gray-900">{loaded ? formatCurrency(summary.totalBasicSalaryEarned) : '—'}</p><p className="text-xs text-gray-500">Total Basic Salary Earned</p></div>
                <div><p className="text-xl font-bold text-emerald-600">{loaded ? formatCurrency(summary.totalThirteenthMonthPay) : '—'}</p><p className="text-xs text-gray-500">Total 13th Month Pay</p></div>
            </div>
        </div>

        {loading ? (
            <p className="text-sm text-gray-500">Loading 13th month computation...</p>
        ) : !loaded ? (
            <p className="text-sm text-gray-500">Choose a year and load the computation.</p>
        ) : records.length === 0 ? (
            <p className="text-sm text-gray-500">No 13th month pay records found for this year.</p>
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
                            'Basic Salary Earned',
                            '13th Month Pay',
                        ].map((header) => <th key={header}>{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {!loading && loaded && (
                        paginatedRecords.map((record) => (
                            <tr key={`${record.employeeId}-${record.year}`}>
                                <td className="font-medium">{record.employeeNumber}</td>
                                <td>{record.employeeName}</td>
                                <td>{record.department || '—'}</td>
                                <td>{record.position || '—'}</td>
                                <td>{formatCurrency(record.basicSalaryEarned)}</td>
                                <td className="font-bold text-emerald-600">{formatCurrency(record.thirteenthMonthPay)}</td>
                            </tr>
                        ))
                    )}
                    <TablePlaceholderRows
                        actualRowCount={!loading && loaded ? paginatedRecords.length : 0}
                        columnCount={6}
                    />
                </tbody>
            </table>
        </div>
        <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            loading={loading}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
        />
    </div>
    );
};

export default ThirteenthMonthTab;

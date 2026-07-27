import { useMemo, useState } from 'react';
import { Download, Eye, RefreshCw, Search, WalletCards } from 'lucide-react';
import type { PayrollRecordDto } from '../../../services/api/payroll/payroll';
import { formatCurrency, formatDate, getRecordPeriodLabel } from '../config/helpers';
import { usePayrollTablePagination } from '../config/pagination';
import TablePagination, { TablePlaceholderRows } from '../components/TablePagination';
import PayslipPreviewModal from '../components/modals/PayslipPreviewModal';
import { useUserPayslips } from '../hooks/useUserPayslips';

const MiniNetPayChart = ({ records }: { records: PayrollRecordDto[] }) => {
    const chartRecords = [...records].reverse().slice(-6);
    const maxNetPay = Math.max(0, ...chartRecords.map((record) => record.netPay));

    if (chartRecords.length === 0) {
        return null;
    }

    return (
        <div className="pro-card p-5">
            <h3 className="text-sm font-bold text-gray-800">Net Pay History</h3>
            <div className="mt-4 flex h-36 items-end gap-3">
                {chartRecords.map((record) => {
                    const height = maxNetPay > 0 ? Math.max(8, Math.round((record.netPay / maxNetPay) * 100)) : 8;

                    return (
                        <div key={record.id} className="flex flex-1 flex-col items-center gap-2">
                            <div className="flex h-28 w-full items-end justify-center">
                                <div
                                    className="w-full max-w-10 rounded-t bg-emerald-500"
                                    style={{ height: `${height}%` }}
                                    title={`${getRecordPeriodLabel(record)}: ${formatCurrency(record.netPay)}`}
                                />
                            </div>
                            <p className="max-w-full truncate text-[10px] text-gray-400">{new Date(record.payrollPeriodEndDate).getFullYear()}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const UserPayroll = () => {
    const {
        records,
        years,
        loading,
        error,
        downloadError,
        downloadingRecordId,
        refresh,
        download,
    } = useUserPayslips();
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('all');
    const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecordDto | null>(null);

    const filteredRecords = useMemo(() => {
        const query = search.trim().toLowerCase();

        return records.filter((record) => {
            const periodLabel = getRecordPeriodLabel(record).toLowerCase();
            const year = new Date(record.payrollPeriodEndDate).getFullYear();
            const matchesSearch = !query || periodLabel.includes(query) || String(year).includes(query);
            const matchesYear = yearFilter === 'all' || year === Number(yearFilter);

            return matchesSearch && matchesYear;
        });
    }, [records, search, yearFilter]);

    const {
        currentPage,
        totalPages,
        pageItems: paginatedRecords,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(filteredRecords);

    const latestPayslip = records[0] ?? null;
    const latestEarnings = latestPayslip?.items.filter((item) => item.type.toLowerCase() === 'earning') ?? [];
    const latestDeductions = latestPayslip?.items.filter((item) => item.type.toLowerCase() === 'deduction') ?? [];
    const selectedEarnings = selectedPayslip?.items.filter((item) => item.type.toLowerCase() === 'earning') ?? [];
    const selectedDeductions = selectedPayslip?.items.filter((item) => item.type.toLowerCase() === 'deduction') ?? [];
    const selectedEmployerContributions = selectedPayslip?.items.filter((item) => item.type.toLowerCase() === 'employer contribution') ?? [];

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>My Payslips</h1>
                <p>View released payslips and download backend-generated PDFs</p>
            </div>

            {error && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {downloadError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {downloadError}
                </div>
            )}

            {loading && (
                <div className="pro-card p-10 text-center text-sm text-gray-500">Loading your released payslips...</div>
            )}

            {!loading && records.length === 0 && (
                <div className="pro-card p-10 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <WalletCards className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">No released payslips yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Released payslips will appear here after payroll is released.</p>
                </div>
            )}

            <>
                    {!loading && latestPayslip && (
                        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                            <div className="pro-card p-5 xl:col-span-2">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase text-gray-400">Latest Released Payslip</p>
                                        <h2 className="mt-1 text-xl font-bold text-gray-900">{getRecordPeriodLabel(latestPayslip)}</h2>
                                        <p className="mt-1 text-sm text-gray-500">Released {formatDate(latestPayslip.releasedAtUtc)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setSelectedPayslip(latestPayslip)} className="btn btn-secondary" title="View latest payslip details">
                                            <Eye className="w-4 h-4" /> View Details
                                        </button>
                                        <button
                                            onClick={() => download(latestPayslip.id)}
                                            disabled={downloadingRecordId === latestPayslip.id}
                                            className="btn btn-primary"
                                            title="Download latest backend payslip PDF"
                                        >
                                            <Download className="w-4 h-4" />
                                            {downloadingRecordId === latestPayslip.id ? 'Downloading...' : 'Download PDF'}
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                    <div className="rounded-xl bg-gray-50 p-4">
                                        <p className="text-xs uppercase text-gray-400">Gross Pay</p>
                                        <p className="mt-1 text-lg font-bold text-gray-800">{formatCurrency(latestPayslip.grossPay)}</p>
                                    </div>
                                    <div className="rounded-xl bg-red-50 p-4">
                                        <p className="text-xs uppercase text-gray-400">Deductions</p>
                                        <p className="mt-1 text-lg font-bold text-red-500">{formatCurrency(latestPayslip.totalDeductions)}</p>
                                    </div>
                                    <div className="rounded-xl bg-emerald-50 p-4">
                                        <p className="text-xs uppercase text-gray-400">Net Pay</p>
                                        <p className="mt-1 text-lg font-bold text-emerald-600">{formatCurrency(latestPayslip.netPay)}</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Earnings</h3>
                                        <div className="mt-2 space-y-2">
                                            {latestEarnings.length === 0 ? (
                                                <p className="text-sm text-gray-500">No earning items returned.</p>
                                            ) : latestEarnings.map((item) => (
                                                <div key={item.id} className="flex justify-between gap-3 text-sm">
                                                    <span className="text-gray-500">{item.description}</span>
                                                    <span className="font-semibold text-gray-800">{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Deductions</h3>
                                        <div className="mt-2 space-y-2">
                                            {latestDeductions.length === 0 ? (
                                                <p className="text-sm text-gray-500">No deduction items returned.</p>
                                            ) : latestDeductions.map((item) => (
                                                <div key={item.id} className="flex justify-between gap-3 text-sm">
                                                    <span className="text-gray-500">{item.description}</span>
                                                    <span className="font-semibold text-red-500">{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <MiniNetPayChart records={records} />
                        </div>
                    )}

                    <div className="pro-card">
                        <div className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Released Payslip History</h3>
                                <p className="text-sm text-gray-500">Showing {filteredRecords.length} of {records.length} released records</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        className="pro-input pl-11 sm:w-64"
                                        placeholder="Search period or year"
                                    />
                                </div>
                                <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} className="pro-select sm:w-40">
                                    <option value="all">All Years</option>
                                    {years.map((year) => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <button onClick={refresh} className="btn btn-secondary" title="Refresh released payslips">
                                    <RefreshCw className="w-4 h-4" /> Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <p className="px-5 pb-3 text-sm text-gray-500">Loading your released payslips...</p>
                        ) : filteredRecords.length === 0 && (
                            <p className="px-5 pb-3 text-sm text-gray-500">No payslips match your filters.</p>
                        )}

                        <div className="overflow-x-auto">
                            <table className="pro-table">
                                <thead>
                                    <tr>
                                        {['Period', 'Released Date', 'Employee', 'Department', 'Position', 'Gross Pay', 'Deductions', 'Net Pay', 'Actions'].map((header) => <th key={header}>{header}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!loading && filteredRecords.length > 0 && (
                                        paginatedRecords.map((record) => (
                                            <tr key={record.id}>
                                                <td className="font-medium whitespace-nowrap">{getRecordPeriodLabel(record)}</td>
                                                <td>{formatDate(record.releasedAtUtc)}</td>
                                                <td>
                                                    <div className="font-semibold text-gray-800">{record.employeeName}</div>
                                                    <div className="text-xs text-gray-400">{record.employeeNumber}</div>
                                                </td>
                                                <td>{record.department || '—'}</td>
                                                <td>{record.position || '—'}</td>
                                                <td>{formatCurrency(record.grossPay)}</td>
                                                <td className="!text-red-500">{formatCurrency(record.totalDeductions)}</td>
                                                <td className="font-bold">{formatCurrency(record.netPay)}</td>
                                                <td>
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => setSelectedPayslip(record)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50" title="View payslip details">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => download(record.id)}
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
                                        actualRowCount={loading ? 0 : paginatedRecords.length}
                                        columnCount={9}
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
            </>

            <PayslipPreviewModal
                open={selectedPayslip !== null}
                selectedPayslip={selectedPayslip}
                selectedPayslipEarnings={selectedEarnings}
                selectedPayslipDeductions={selectedDeductions}
                selectedPayslipEmployerContributions={selectedEmployerContributions}
                downloadingRecordId={downloadingRecordId}
                onClose={() => setSelectedPayslip(null)}
                onDownload={download}
            />
        </div>
    );
};

export default UserPayroll;

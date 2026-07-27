import { useMemo, useState } from 'react';
import { Edit3, Plus, Search } from 'lucide-react';
import type { EmployeeDto } from '../../../services/api/employees/employees';
import type { EmployeeCompensationDto } from '../../../services/api/payroll/payroll';
import { formatCurrency, formatDate, getEmployeeDisplayName } from '../config/helpers';
import { usePayrollTablePagination } from '../config/pagination';
import TablePagination, { TablePlaceholderRows } from './TablePagination';

type CompensationTabProps = {
    loadingCompensations: boolean;
    compensations: EmployeeCompensationDto[];
    activeCompensationCount: number;
    employeesWithoutCompensation: EmployeeDto[];
    compensationError: string;
    compensationSuccess: string;
    onAddCompensation: () => void;
    onEditCompensation: (compensation: EmployeeCompensationDto) => void;
};

const CompensationTab = ({
    loadingCompensations,
    compensations,
    activeCompensationCount,
    employeesWithoutCompensation,
    compensationError,
    compensationSuccess,
    onAddCompensation,
    onEditCompensation,
}: CompensationTabProps) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

    const filteredCompensations = useMemo(() => {
        const query = search.trim().toLowerCase();

        return compensations.filter((compensation) => {
            const matchesSearch = !query
                || compensation.employeeName.toLowerCase().includes(query)
                || compensation.employeeNumber.toLowerCase().includes(query);
            const matchesStatus = statusFilter === 'All'
                || (statusFilter === 'Active' ? compensation.isActive : !compensation.isActive);

            return matchesSearch && matchesStatus;
        });
    }, [compensations, search, statusFilter]);

    const {
        currentPage,
        totalPages,
        pageItems: paginatedCompensations,
        goToPreviousPage,
        goToNextPage,
    } = usePayrollTablePagination(filteredCompensations);

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-base font-bold text-gray-800">Employee Compensation</h3>
                    <p className="text-sm text-gray-500">Assign and update salary records used by payroll processing.</p>
                </div>
                <button onClick={onAddCompensation} className="btn btn-primary" title="Add employee compensation">
                    <Plus className="w-4 h-4" /> Add Compensation
                </button>
            </div>

            {compensationError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {compensationError}
                </div>
            )}

            {compensationSuccess && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {compensationSuccess}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Active Compensation</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCompensationCount}</p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Missing Compensation</p>
                    <p className="mt-1 text-2xl font-bold text-orange-600">{employeesWithoutCompensation.length}</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <p className="text-xs font-semibold uppercase text-gray-500">Payroll Source</p>
                    <p className="mt-1 text-sm font-bold text-blue-600">Active employee compensation</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        className="pro-input pl-11"
                        placeholder="Search employee name or number"
                    />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="pro-select lg:w-44">
                    <option value="All">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {loadingCompensations ? (
                <p className="text-sm text-gray-500">Loading compensation records...</p>
            ) : filteredCompensations.length === 0 ? (
                <p className="text-sm text-gray-500">No compensation records found.</p>
            ) : null}

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table">
                    <thead>
                        <tr>{['Employee', 'Department', 'Position', 'Monthly Base Salary', 'Effective From', 'Effective To', 'Current Status', 'Action'].map((header) => <th key={header}>{header}</th>)}</tr>
                    </thead>
                    <tbody>
                        {!loadingCompensations && (
                            paginatedCompensations.map((compensation) => (
                                <tr key={compensation.id}>
                                    <td>
                                        <div className="font-semibold text-gray-800">{compensation.employeeName}</div>
                                        <div className="text-xs text-gray-400">{compensation.employeeNumber}</div>
                                    </td>
                                    <td>{compensation.department || '—'}</td>
                                    <td>{compensation.position || '—'}</td>
                                    <td className="font-bold">{formatCurrency(compensation.baseAmount)}</td>
                                    <td>{formatDate(compensation.effectiveFrom)}</td>
                                    <td>{formatDate(compensation.effectiveTo)}</td>
                                    <td>
                                        <span className={`badge ${compensation.isActive ? 'badge-success' : 'badge-warning'}`}>
                                            {compensation.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => onEditCompensation(compensation)}
                                            className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                            title="Edit employee compensation"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        <TablePlaceholderRows
                            actualRowCount={loadingCompensations ? 0 : paginatedCompensations.length}
                            columnCount={8}
                        />
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                loading={loadingCompensations}
                onPrevious={goToPreviousPage}
                onNext={goToNextPage}
            />

            {employeesWithoutCompensation.length > 0 && (
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                    <h4 className="text-sm font-bold text-orange-700 mb-2">Employees not included in payroll yet</h4>
                    <p className="text-sm text-orange-600">
                        These employees need active compensation before payroll processing can generate released payslips:
                        {' '}
                        {employeesWithoutCompensation.slice(0, 5).map(getEmployeeDisplayName).join(', ')}
                        {employeesWithoutCompensation.length > 5 ? `, +${employeesWithoutCompensation.length - 5} more` : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CompensationTab;

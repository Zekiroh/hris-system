import { Edit3, Plus } from 'lucide-react';
import type { EmployeeDto } from '../../../services/api/employees/employees';
import type { EmployeeCompensationDto } from '../../../services/api/payroll/payroll';
import { formatCurrency, formatDate, getEmployeeDisplayName } from '../config/helpers';

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
}: CompensationTabProps) => (
    <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h3 className="text-base font-bold text-gray-800">Employee Compensation</h3>
                <p className="text-sm text-gray-500">Assign and update salary records used by payroll processing.</p>
            </div>
            <button onClick={onAddCompensation} className="btn btn-primary">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead>
                    <tr>{['Employee', 'Department', 'Position', 'Type', 'Base Amount', 'Effective From', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {loadingCompensations ? (
                        <tr>
                            <td colSpan={8} className="text-center py-8 text-sm text-gray-500">Loading compensation records...</td>
                        </tr>
                    ) : compensations.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center py-8 text-sm text-gray-500">No compensation records found.</td>
                        </tr>
                    ) : (
                        compensations.map((compensation) => (
                            <tr key={compensation.id}>
                                <td>
                                    <div className="font-semibold text-gray-800">{compensation.employeeName}</div>
                                    <div className="text-xs text-gray-400">{compensation.employeeNumber}</div>
                                </td>
                                <td>{compensation.department || '—'}</td>
                                <td>{compensation.position || '—'}</td>
                                <td>{compensation.compensationType}</td>
                                <td className="font-bold">{formatCurrency(compensation.baseAmount)}</td>
                                <td>{formatDate(compensation.effectiveFrom)}</td>
                                <td><span className={`badge ${compensation.isActive ? 'badge-success' : 'badge-warning'}`}>? {compensation.isActive ? 'Active' : 'Inactive'}</span></td>
                                <td>
                                    <button onClick={() => onEditCompensation(compensation)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {employeesWithoutCompensation.length > 0 && (
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                <h4 className="text-sm font-bold text-orange-700 mb-2">Employees not included in payroll yet</h4>
                <p className="text-sm text-orange-600">
                    These employees need active compensation before payroll processing can generate payslips:
                    {' '}
                    {employeesWithoutCompensation.slice(0, 5).map(getEmployeeDisplayName).join(', ')}
                    {employeesWithoutCompensation.length > 5 ? `, +${employeesWithoutCompensation.length - 5} more` : ''}
                </p>
            </div>
        )}
    </div>
);

export default CompensationTab;
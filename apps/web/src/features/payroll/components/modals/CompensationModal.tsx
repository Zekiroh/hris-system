import { X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { EmployeeDto } from '../../../../services/api/employees/employees';
import type { EmployeeCompensationDto } from '../../../../services/api/payroll/payroll';
import { getEmployeeDisplayName } from '../../config/helpers';
import type { CompensationFormState } from '../../config/types';

type CompensationModalProps = {
    open: boolean;
    editingCompensation: EmployeeCompensationDto | null;
    compensationForm: CompensationFormState;
    employees: EmployeeDto[];
    compensationError: string;
    savingCompensation: boolean;
    onClose: () => void;
    onSave: () => void;
    setCompensationForm: Dispatch<SetStateAction<CompensationFormState>>;
};

const CompensationModal = ({
    open,
    editingCompensation,
    compensationForm,
    employees,
    compensationError,
    savingCompensation,
    onClose,
    onSave,
    setCompensationForm,
}: CompensationModalProps) => {
    if (!open) return null;

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-lg">
                <div className="pro-modal-header">
                    <h3>{editingCompensation ? 'Edit Compensation' : 'Add Compensation'}</h3>
                    <button
                        onClick={onClose}
                        disabled={savingCompensation}
                        className="btn-ghost btn-icon disabled:opacity-50"
                        title="Close compensation form"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-4">
                    {compensationError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {compensationError}
                        </div>
                    )}
                    {!editingCompensation && (
                        <div>
                            <label className="pro-label">Employee</label>
                            <select
                                value={compensationForm.employeeId}
                                onChange={(event) => setCompensationForm((current) => ({ ...current, employeeId: event.target.value }))}
                                className="pro-select"
                                disabled={savingCompensation}
                            >
                                <option value="">Select employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.employeeNumber} - {getEmployeeDisplayName(employee)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {editingCompensation && (
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <p className="text-xs font-semibold uppercase text-gray-400">Employee</p>
                            <p className="font-bold text-gray-800">{editingCompensation.employeeName}</p>
                            <p className="text-xs text-gray-500">{editingCompensation.employeeNumber}</p>
                        </div>
                    )}
                    <div>
                        <label className="pro-label">Monthly Base Salary</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={compensationForm.baseAmount}
                            onChange={(event) => setCompensationForm((current) => ({ ...current, baseAmount: event.target.value }))}
                            className="pro-input"
                            placeholder="0.00"
                            disabled={savingCompensation}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="pro-label">Effective From</label>
                            <input
                                type="date"
                                value={compensationForm.effectiveFrom}
                                onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveFrom: event.target.value }))}
                                className="pro-input"
                                disabled={savingCompensation}
                            />
                        </div>
                        <div>
                            <label className="pro-label">Effective To</label>
                            <input
                                type="date"
                                value={compensationForm.effectiveTo}
                                onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveTo: event.target.value }))}
                                className="pro-input"
                                disabled={savingCompensation}
                            />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                            type="checkbox"
                            checked={compensationForm.isActive}
                            onChange={(event) => setCompensationForm((current) => ({ ...current, isActive: event.target.checked }))}
                            disabled={savingCompensation}
                        />
                        Active compensation
                    </label>
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} disabled={savingCompensation} className="btn btn-secondary">Cancel</button>
                    <button onClick={onSave} disabled={savingCompensation} className="btn btn-primary" title="Save employee compensation">
                        {savingCompensation ? 'Saving...' : 'Save Compensation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CompensationModal;

import { X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import type { EmployeeDto } from '../../../lib/employees';
import type { EmployeeCompensationDto } from '../../../lib/payroll';
import { getEmployeeDisplayName } from '../config/helpers';
import type { CompensationFormState } from '../config/types';

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
                    <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
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
                            <select value={compensationForm.employeeId} onChange={(event) => setCompensationForm((current) => ({ ...current, employeeId: event.target.value }))} className="pro-select">
                                <option value="">Select employee</option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {employee.employeeNumber} — {getEmployeeDisplayName(employee)}
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
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Compensation Type</label>
                            <select value={compensationForm.compensationType} onChange={(event) => setCompensationForm((current) => ({ ...current, compensationType: event.target.value }))} className="pro-select">
                                <option value="Monthly">Monthly</option>
                                <option value="Daily">Daily</option>
                            </select>
                        </div>
                        <div>
                            <label className="pro-label">Base Amount</label>
                            <input type="number" min="0" step="0.01" value={compensationForm.baseAmount} onChange={(event) => setCompensationForm((current) => ({ ...current, baseAmount: event.target.value }))} className="pro-input" placeholder="0.00" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Effective From</label>
                            <input type="date" value={compensationForm.effectiveFrom} onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveFrom: event.target.value }))} className="pro-input" />
                        </div>
                        <div>
                            <label className="pro-label">Effective To</label>
                            <input type="date" value={compensationForm.effectiveTo} onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveTo: event.target.value }))} className="pro-input" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <input type="checkbox" checked={compensationForm.isActive} onChange={(event) => setCompensationForm((current) => ({ ...current, isActive: event.target.checked }))} />
                        Active compensation
                    </label>
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onSave} disabled={savingCompensation} className="btn btn-primary">{savingCompensation ? 'Saving...' : 'Save Compensation'}</button>
                </div>
            </div>
        </div>
    );
};

export default CompensationModal;

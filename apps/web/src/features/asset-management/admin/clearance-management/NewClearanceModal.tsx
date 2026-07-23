import { X } from 'lucide-react';
import type { EmployeeDto } from '../../../../services/api/employees/employees';
import { getEmployeeName } from '../../assetManagementHelpers';
import type { ClearanceFormState } from '../../assetManagementTypes';

type NewClearanceModalProps = {
    clearanceForm: ClearanceFormState;
    employees: EmployeeDto[];
    isCreatingClearance: boolean;
    onClose: () => void;
    onSave: () => void;
    onFormChange: (field: keyof ClearanceFormState, value: string) => void;
};

const NewClearanceModal = ({
    clearanceForm,
    employees,
    isCreatingClearance,
    onClose,
    onSave,
    onFormChange,
}: NewClearanceModalProps) => {
    const selectedEmployee = employees.find(employee => employee.id === clearanceForm.employeeId);
    const selectedDepartment = selectedEmployee?.department ?? '';
    const getEmployeeOptionLabel = (employee: EmployeeDto) =>
        getEmployeeName(employee) || employee.employeeNumber;

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header">
                    <h3>Process Employee Clearance</h3>
                    <button onClick={onClose} disabled={isCreatingClearance} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="pro-modal-body space-y-4">
                    <div>
                        <label className="pro-label">Select Employee</label>
                        <select
                            className="pro-select"
                            value={clearanceForm.employeeId}
                            onChange={e => onFormChange('employeeId', e.target.value)}
                            disabled={isCreatingClearance}
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(employee => (
                                <option key={employee.id} value={employee.id}>{getEmployeeOptionLabel(employee)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="pro-label">Department</label>
                        <input
                            type="text"
                            className="pro-input"
                            value={selectedDepartment}
                            placeholder="Derived from selected employee"
                            disabled
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="pro-label">Last Day of Work</label>
                        <input
                            type="date"
                            className="pro-input"
                            value={clearanceForm.lastWorkingDay}
                            onChange={e => onFormChange('lastWorkingDay', e.target.value)}
                            disabled={isCreatingClearance}
                        />
                    </div>
                    <div>
                        <label className="pro-label">Notes / Remarks</label>
                        <textarea
                            rows={3}
                            className="pro-input resize-none"
                            placeholder="Add any final notes..."
                            value={clearanceForm.remarks}
                            onChange={e => onFormChange('remarks', e.target.value)}
                            disabled={isCreatingClearance}
                        />
                    </div>
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} disabled={isCreatingClearance} className="btn btn-secondary">Cancel</button>
                    <button onClick={onSave} disabled={isCreatingClearance} className="btn btn-primary">
                        {isCreatingClearance ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewClearanceModal;
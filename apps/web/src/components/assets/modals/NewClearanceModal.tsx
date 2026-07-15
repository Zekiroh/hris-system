import { X } from 'lucide-react';
import type { ClearanceFormState } from '../assetManagementTypes';

type NewClearanceModalProps = {
    clearanceForm: ClearanceFormState;
    employees: string[];
    departments: string[];
    onClose: () => void;
    onSave: () => void;
    onFormChange: (field: keyof ClearanceFormState, value: string) => void;
};

const NewClearanceModal = ({
    clearanceForm,
    employees,
    departments,
    onClose,
    onSave,
    onFormChange,
}: NewClearanceModalProps) => {
    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header">
                    <h3>Process Employee Clearance</h3>
                    <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="pro-modal-body space-y-4">
                    <div>
                        <label className="pro-label">Select Employee</label>
                        <select
                            className="pro-select"
                            value={clearanceForm.employee}
                            onChange={e => onFormChange('employee', e.target.value)}
                        >
                            <option value="">-- Choose Employee --</option>
                            {employees.map(emp => (
                                <option key={emp} value={emp}>{emp}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="pro-label">Department</label>
                        <select
                            className="pro-select"
                            value={clearanceForm.department}
                            onChange={e => onFormChange('department', e.target.value)}
                        >
                            <option value="">-- Choose Department --</option>
                            {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="pro-label">Last Day of Work</label>
                        <input
                            type="date"
                            className="pro-input"
                            value={clearanceForm.lastDay}
                            onChange={e => onFormChange('lastDay', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="pro-label">Notes / Remarks</label>
                        <textarea
                            rows={3}
                            className="pro-input resize-none"
                            placeholder="Add any final notes..."
                            value={clearanceForm.notes}
                            onChange={e => onFormChange('notes', e.target.value)}
                        />
                    </div>
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onSave} className="btn btn-primary">Save Record</button>
                </div>
            </div>
        </div>
    );
};

export default NewClearanceModal;

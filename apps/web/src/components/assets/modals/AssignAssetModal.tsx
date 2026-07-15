import type { FormEvent } from 'react';
import { X } from 'lucide-react';
import type { AssetDto } from '../../../lib/assets';
import type { EmployeeDto } from '../../../lib/employees';
import type { AssignAssetFormState } from '../assetManagementTypes';

type AssignAssetModalProps = {
    selectedAsset: AssetDto;
    assignForm: AssignAssetFormState;
    activeEmployees: EmployeeDto[];
    isLoadingEmployees: boolean;
    isAssigningAsset: boolean;
    onClose: () => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onFormChange: (field: keyof AssignAssetFormState, value: string) => void;
    getEmployeeName: (employee: EmployeeDto) => string;
};

const AssignAssetModal = ({
    selectedAsset,
    assignForm,
    activeEmployees,
    isLoadingEmployees,
    isAssigningAsset,
    onClose,
    onSubmit,
    onFormChange,
    getEmployeeName,
}: AssignAssetModalProps) => {
    return (
        <div className="pro-modal-overlay" onClick={onClose}>
            <form className="pro-modal max-w-md overflow-hidden" onClick={e => e.stopPropagation()} onSubmit={onSubmit}>
                <div className="pro-modal-header border-b border-gray-100">
                    <div>
                        <h3>Assign Asset</h3>
                        <p className="text-xs text-gray-400 mt-1">Assign {selectedAsset.assetCode} to an active employee.</p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-ghost btn-icon" disabled={isAssigningAsset}>
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-5">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                        <p className="text-sm font-bold text-gray-800">{selectedAsset.assetName}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedAsset.assetCode} • {selectedAsset.category}</p>
                    </div>

                    <div>
                        <label className="pro-label">Employee <span className="text-red-500">*</span></label>
                        <select
                            className="pro-select"
                            value={assignForm.employeeId}
                            onChange={e => onFormChange('employeeId', e.target.value)}
                            disabled={isLoadingEmployees || isAssigningAsset}
                        >
                            <option value="">-- Choose Employee --</option>
                            {activeEmployees.map(employee => (
                                <option key={employee.id} value={employee.id}>
                                    {getEmployeeName(employee)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="pro-label">Assigned Date</label>
                        <input
                            type="date"
                            className="pro-input"
                            value={assignForm.assignedDate}
                            onChange={e => onFormChange('assignedDate', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="pro-label">Remarks</label>
                        <textarea
                            rows={3}
                            placeholder="Optional assignment remarks..."
                            className="pro-input resize-none"
                            value={assignForm.remarks}
                            onChange={e => onFormChange('remarks', e.target.value)}
                        />
                    </div>
                </div>
                <div className="pro-modal-footer border-t border-gray-100">
                    <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button type="submit" disabled={isAssigningAsset || isLoadingEmployees} className="btn btn-primary">
                        {isAssigningAsset ? 'Assigning...' : 'Assign Asset'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssignAssetModal;

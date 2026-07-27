import { X } from 'lucide-react';
import { kpiCriteria } from '../../assetManagementConfig';
import { getEmployeeName } from '../../assetManagementHelpers';
import type { EvaluationForm } from '../../assetManagementTypes';
import type { EmployeeDto } from '../../../../services/api/employees/employees';

type AddEvaluationModalProps = {
    evaluationForm: EvaluationForm;
    employees: EmployeeDto[];
    isLoadingEmployees: boolean;
    isSavingEvaluation: boolean;
    evaluationFormError: string;
    weightedScore: number;
    onClose: () => void;
    onSubmit: () => void;
    onFormChange: <K extends keyof EvaluationForm>(field: K, value: EvaluationForm[K]) => void;
    onKpiScoreChange: (key: string, value: number) => void;
};

const AddEvaluationModal = ({
    evaluationForm,
    employees,
    isLoadingEmployees,
    isSavingEvaluation,
    evaluationFormError,
    weightedScore,
    onClose,
    onSubmit,
    onFormChange,
    onKpiScoreChange,
}: AddEvaluationModalProps) => {
    const getEmployeeOptionLabel = (employee: EmployeeDto) =>
        getEmployeeName(employee) || employee.employeeNumber;

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header">
                    <h3>New Performance Evaluation</h3>
                    <button onClick={onClose} disabled={isSavingEvaluation} className="btn-ghost btn-icon">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="pro-modal-body space-y-4">
                    {evaluationFormError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                            {evaluationFormError}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Employee</label>
                            <select
                                className="pro-select"
                                value={evaluationForm.employeeId}
                                onChange={e => onFormChange('employeeId', e.target.value)}
                                disabled={isLoadingEmployees || isSavingEvaluation}
                            >
                                <option value="">-- Choose Employee --</option>
                                {employees.map(employee => (
                                    <option key={employee.id} value={employee.id}>
                                        {getEmployeeOptionLabel(employee)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="pro-label">Review Period</label>
                            <input
                                type="text"
                                className="pro-input"
                                placeholder="e.g. Q3 2026"
                                value={evaluationForm.reviewPeriod}
                                onChange={e => onFormChange('reviewPeriod', e.target.value)}
                                disabled={isSavingEvaluation}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="pro-label">Reviewer</label>
                        <input
                            type="text"
                            className="pro-input"
                            placeholder="Reviewer name"
                            value={evaluationForm.reviewerName}
                            onChange={e => onFormChange('reviewerName', e.target.value)}
                            disabled={isSavingEvaluation}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="pro-label !mb-0">KPI Scorecard</label>
                            <span className="text-sm font-bold text-emerald-600">{weightedScore.toFixed(2)} / 5.0</span>
                        </div>

                        {kpiCriteria.map(criterion => (
                            <div key={criterion.key} className="rounded-xl border border-gray-100 p-3">
                                <div className="mb-1 flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-800">
                                        {criterion.label}
                                        <span className="ml-2 text-xs font-normal text-gray-400">({criterion.weight}%)</span>
                                    </span>
                                    <span className="text-sm font-bold text-gray-700">
                                        {evaluationForm.kpiScores[criterion.key] ?? 0}/5
                                    </span>
                                </div>
                                <p className="mb-2 text-xs text-gray-500">{criterion.description}</p>
                                <input
                                    type="range"
                                    min={1}
                                    max={5}
                                    step={1}
                                    value={evaluationForm.kpiScores[criterion.key] ?? 3}
                                    onChange={e => onKpiScoreChange(criterion.key, Number(e.target.value))}
                                    className="w-full accent-emerald-600"
                                    disabled={isSavingEvaluation}
                                />
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="pro-label">Notes / Remarks</label>
                        <textarea
                            rows={3}
                            className="pro-input resize-none"
                            placeholder="Add any final notes..."
                            value={evaluationForm.remarks}
                            onChange={e => onFormChange('remarks', e.target.value)}
                            disabled={isSavingEvaluation}
                        />
                    </div>
                </div>

                <div className="pro-modal-footer">
                    <button onClick={onClose} disabled={isSavingEvaluation} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button onClick={onSubmit} disabled={isSavingEvaluation} className="btn btn-primary">
                        {isSavingEvaluation ? 'Saving...' : 'Save Record'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEvaluationModal;
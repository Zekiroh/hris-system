import { X } from 'lucide-react';

type ProcessPayrollModalProps = {
    open: boolean;
    processStartDate: string;
    processEndDate: string;
    processingPayroll: boolean;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onClose: () => void;
    onProcess: () => void;
};

const ProcessPayrollModal = ({
    open,
    processStartDate,
    processEndDate,
    processingPayroll,
    onStartDateChange,
    onEndDateChange,
    onClose,
    onProcess,
}: ProcessPayrollModalProps) => {
    if (!open) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-lg">
                <div className="pro-modal-header"><h3>Process Payroll</h3><button onClick={onClose} disabled={processingPayroll} className="btn-ghost btn-icon disabled:opacity-50" title="Close process payroll form"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="pro-label">Start Date</label><input type="date" value={processStartDate} onChange={(event) => onStartDateChange(event.target.value)} className="pro-input" disabled={processingPayroll} /></div>
                        <div><label className="pro-label">End Date</label><input type="date" value={processEndDate} onChange={(event) => onEndDateChange(event.target.value)} className="pro-input" disabled={processingPayroll} /></div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-gray-600">Employees to process: <strong>Based on active compensation</strong></p>
                        <p className="text-gray-600">Includes: <strong>Basic pay, approved overtime, late/undertime deductions, and absence deductions</strong></p>
                    </div>
                </div>
                <div className="pro-modal-footer"><button onClick={onClose} disabled={processingPayroll} className="btn btn-secondary">Cancel</button><button onClick={onProcess} disabled={processingPayroll} className="btn btn-primary" title="Process payroll">{processingPayroll ? 'Processing...' : 'Process Payroll'}</button></div>
            </div>
        </div>
    );
};

export default ProcessPayrollModal;

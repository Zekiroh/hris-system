import { X } from 'lucide-react';

type GeneratePayslipsModalProps = {
    open: boolean;
    payslipCount: number;
    onClose: () => void;
};

const GeneratePayslipsModal = ({ open, payslipCount, onClose }: GeneratePayslipsModalProps) => {
    if (!open) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md">
                <div className="pro-modal-header"><h3>Generate All Payslips</h3><button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    <p className="text-sm text-gray-600">Payslips are generated automatically from processed payroll records.</p>
                    <div className="bg-emerald-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-500">{payslipCount} payslips available for the latest payroll period.</p>
                    </div>
                </div>
                <div className="pro-modal-footer"><button onClick={onClose} className="btn btn-primary">Close</button></div>
            </div>
        </div>
    );
};

export default GeneratePayslipsModal;

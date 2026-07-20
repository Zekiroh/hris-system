import { X } from 'lucide-react';

type ComputeThirteenthMonthModalProps = {
    open: boolean;
    onClose: () => void;
};

const ComputeThirteenthMonthModal = ({ open, onClose }: ComputeThirteenthMonthModalProps) => {
    if (!open) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md">
                <div className="pro-modal-header"><h3>Compute 13th Month Pay</h3><button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    <p className="text-sm text-gray-600">13th month computation is not available yet. This will be enabled once the backend service is implemented.</p>
                    <div className="bg-orange-50 p-4 rounded-xl">
                        <p className="text-orange-700 text-sm font-medium">Current payroll scope: compensation, payroll processing, payroll records, and payslips.</p>
                    </div>
                </div>
                <div className="pro-modal-footer"><button onClick={onClose} className="btn btn-primary">Close</button></div>
            </div>
        </div>
    );
};

export default ComputeThirteenthMonthModal;

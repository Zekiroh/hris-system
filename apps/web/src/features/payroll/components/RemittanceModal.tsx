import { X } from 'lucide-react';

type RemittanceModalProps = {
    open: boolean;
    onClose: () => void;
};

const RemittanceModal = ({ open, onClose }: RemittanceModalProps) => {
    if (!open) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md">
                <div className="pro-modal-header"><h3>Generate Remittance Report</h3><button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    <p className="text-sm text-gray-600">Government remittance reports will be available after the Government Compliance module is implemented.</p>
                </div>
                <div className="pro-modal-footer"><button onClick={onClose} className="btn btn-primary">Close</button></div>
            </div>
        </div>
    );
};

export default RemittanceModal;

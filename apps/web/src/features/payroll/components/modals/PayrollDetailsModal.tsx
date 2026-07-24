import { X } from 'lucide-react';
import type { PayrollRecordRow } from '../../config/types';

type PayrollDetailsModalProps = {
    open: boolean;
    record: PayrollRecordRow | null;
    onClose: () => void;
};

const PayrollDetailsModal = ({ open, record, onClose }: PayrollDetailsModalProps) => {
    if (!open || !record) return null;

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-lg">
                <div className="pro-modal-header"><h3>Payroll Details</h3><button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                <div className="pro-modal-body space-y-4">
                    {[
                        ['Period', record.period],
                        ['Employees', String(record.employees)],
                        ['Gross Pay', record.grossPay],
                        ['Deductions', record.deductions],
                        ['Net Pay', record.netPay],
                        ['Status', record.status],
                    ].map(([label, value]) => (
                        <div key={label} className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">{label}</span><span className="font-bold">{value}</span></div>
                    ))}
                </div>
                <div className="pro-modal-footer"><button onClick={onClose} className="btn btn-primary">Close</button></div>
            </div>
        </div>
    );
};

export default PayrollDetailsModal;

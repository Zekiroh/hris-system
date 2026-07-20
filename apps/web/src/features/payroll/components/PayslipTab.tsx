import { Download, Eye } from 'lucide-react';
import type { PayrollRecordDto } from '../../../lib/payroll';
import { getInitials } from '../config/helpers';

export type PayslipListItem = {
    name: string;
    id: string;
    netPay: string;
    status: string;
    record: PayrollRecordDto;
};

type PayslipTabProps = {
    loadingPayroll: boolean;
    payslipList: PayslipListItem[];
    statusBadge: Record<string, string>;
    onGeneratePayslips: () => void;
    onPreview: (record: PayrollRecordDto) => void;
};

const PayslipTab = ({
    loadingPayroll,
    payslipList,
    statusBadge,
    onGeneratePayslips,
    onPreview,
}: PayslipTabProps) => (
    <div className="space-y-5">
        <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-gray-800">Employee Payslips</h3>
            <button onClick={onGeneratePayslips} className="btn btn-primary">Generate All Payslips</button>
        </div>
        {loadingPayroll ? (
            <div className="text-center py-8 text-sm text-gray-500">Loading payslips...</div>
        ) : payslipList.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">No payslips found.</div>
        ) : (
            payslipList.map(emp => (
                <div key={`${emp.id}-${emp.record.id}`} className="pro-card !shadow-none border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">{getInitials(emp.name)}</div>
                        <div>
                            <p className="font-bold text-gray-800">{emp.name}</p>
                            <p className="text-xs text-gray-400">{emp.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="font-bold">{emp.netPay}</p>
                            <span className={`badge ${statusBadge[emp.status] || 'badge-success'}`}>● {emp.status}</span>
                        </div>
                        <button onClick={() => onPreview(emp.record)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                        <button className="btn-ghost btn-icon text-slate-500"><Download className="w-4 h-4" /></button>
                    </div>
                </div>
            ))
        )}
    </div>
);

export default PayslipTab;

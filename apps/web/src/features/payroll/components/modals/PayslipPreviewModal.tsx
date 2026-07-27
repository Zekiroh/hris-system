import { Download, X } from 'lucide-react';
import type { PayrollRecordDto, PayrollRecordItemDto } from '../../../../services/api/payroll/payroll';
import { formatCurrency, formatDate, getRecordPeriodLabel } from '../../config/helpers';

type PayslipPreviewModalProps = {
    open: boolean;
    selectedPayslip: PayrollRecordDto | null;
    selectedPayslipEarnings: PayrollRecordItemDto[];
    selectedPayslipDeductions: PayrollRecordItemDto[];
    selectedPayslipEmployerContributions: PayrollRecordItemDto[];
    downloadingRecordId: number | null;
    onClose: () => void;
    onDownload: (recordId: number) => void;
};

const PayslipPreviewModal = ({
    open,
    selectedPayslip,
    selectedPayslipEarnings,
    selectedPayslipDeductions,
    selectedPayslipEmployerContributions,
    downloadingRecordId,
    onClose,
    onDownload,
}: PayslipPreviewModalProps) => {
    if (!open || !selectedPayslip) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-lg">
                <div className="pro-modal-header">
                    <div>
                        <h3>Payslip Details</h3>
                        <p className="text-sm text-gray-500">{getRecordPeriodLabel(selectedPayslip)}</p>
                    </div>
                    <button onClick={onClose} className="btn-ghost btn-icon" title="Close payslip details">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                            ['Employee Number', selectedPayslip.employeeNumber],
                            ['Employee', selectedPayslip.employeeName],
                            ['Department', selectedPayslip.department || '—'],
                            ['Position', selectedPayslip.position || '—'],
                            ['Pay Period', getRecordPeriodLabel(selectedPayslip)],
                            ['Released Date', formatDate(selectedPayslip.releasedAtUtc)],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className="text-xs text-gray-400">{label}</p>
                                <p className="font-bold text-gray-800">{value}</p>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Earnings</h4>
                        <div className="space-y-2">
                            {selectedPayslipEarnings.length === 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Gross Pay</span><span className="font-semibold">{formatCurrency(selectedPayslip.grossPay)}</span></div>
                            ) : (
                                selectedPayslipEarnings.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-gray-600">{item.description}</span><span className="font-semibold">{formatCurrency(item.amount)}</span></div>
                                ))
                            )}
                            <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Earnings</span><span>{formatCurrency(selectedPayslip.grossPay)}</span></div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Deductions</h4>
                        <div className="space-y-2">
                            {selectedPayslipDeductions.length === 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Total Deductions</span><span className="text-red-500 font-medium">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                            ) : (
                                selectedPayslipDeductions.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-gray-600">{item.description}</span><span className="text-red-500 font-medium">{formatCurrency(item.amount)}</span></div>
                                ))
                            )}
                            <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Deductions</span><span className="text-red-500">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                        </div>
                    </div>
                    {selectedPayslipEmployerContributions.length > 0 && (
                        <div>
                            <div className="flex items-baseline justify-between gap-3">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Employer Contributions</h4>
                                <span className="text-xs text-gray-400">Not deducted from net pay</span>
                            </div>
                            <div className="space-y-2">
                                {selectedPayslipEmployerContributions.map((item) => (
                                    <div key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-gray-600">{item.description}</span><span className="font-medium text-gray-800">{formatCurrency(item.amount)}</span></div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-emerald-500 text-white rounded-xl p-4 flex justify-between items-center">
                        <span className="font-bold">Net Pay</span>
                        <span className="font-bold text-xl">{formatCurrency(selectedPayslip.netPay)}</span>
                    </div>
                </div>
                <div className="pro-modal-footer">
                    <button
                        onClick={() => onDownload(selectedPayslip.id)}
                        disabled={downloadingRecordId === selectedPayslip.id}
                        className="btn btn-secondary"
                    >
                        <Download className="w-4 h-4" />
                        {downloadingRecordId === selectedPayslip.id ? 'Downloading...' : 'Download PDF'}
                    </button>
                    <button onClick={onClose} className="btn btn-primary">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PayslipPreviewModal;

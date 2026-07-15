import { Download } from 'lucide-react';
import type { PayrollPeriodDto, PayrollRecordDto, PayrollRecordItemDto } from '../../../lib/payroll';
import { formatCurrency, formatDate, formatPeriod } from '../config/helpers';

type PayslipPreviewModalProps = {
    open: boolean;
    selectedPayslip: PayrollRecordDto | null;
    selectedPayslipEarnings: PayrollRecordItemDto[];
    selectedPayslipDeductions: PayrollRecordItemDto[];
    selectedPayrollPeriod: PayrollPeriodDto | undefined;
    onClose: () => void;
};

const PayslipPreviewModal = ({
    open,
    selectedPayslip,
    selectedPayslipEarnings,
    selectedPayslipDeductions,
    selectedPayrollPeriod,
    onClose,
}: PayslipPreviewModalProps) => {
    if (!open || !selectedPayslip) {
        return null;
    }

    return (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-lg">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 rounded-t-2xl text-center">
                    <h3 className="text-lg font-bold">SIMPLEVIA Technologies, Inc.</h3>
                    <p className="text-xs text-emerald-100/80">Employee Payslip</p>
                </div>
                <div className="pro-modal-body space-y-5">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                            ['Employee ID', selectedPayslip.employeeNumber],
                            ['Employee', selectedPayslip.employeeName],
                            ['Department', '—'],
                            ['Pay Period', selectedPayrollPeriod ? formatPeriod(selectedPayrollPeriod) : '—'],
                            ['Payment Date', formatDate(selectedPayslip.createdAtUtc)],
                        ].map(([label, val]) => (
                            <div key={label}><p className="text-gray-400 text-xs">{label}</p><p className="font-bold text-gray-800">{val}</p></div>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Earnings</h4>
                        <div className="space-y-2">
                            {selectedPayslipEarnings.length === 0 ? (
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Gross Pay</span><span className="font-semibold">{formatCurrency(selectedPayslip.grossPay)}</span></div>
                            ) : (
                                selectedPayslipEarnings.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.description}</span><span className="font-semibold">{formatCurrency(item.amount)}</span></div>
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
                                    <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.description}</span><span className="text-red-500 font-medium">{formatCurrency(item.amount)}</span></div>
                                ))
                            )}
                            <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Deductions</span><span className="text-red-500">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                        </div>
                    </div>
                    <div className="bg-emerald-500 text-white rounded-xl p-4 flex justify-between items-center">
                        <span className="font-bold">Net Pay</span>
                        <span className="font-bold text-xl">{formatCurrency(selectedPayslip.netPay)}</span>
                    </div>
                </div>
                <div className="pro-modal-footer">
                    <button className="btn btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
                    <button onClick={onClose} className="btn btn-primary">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PayslipPreviewModal;

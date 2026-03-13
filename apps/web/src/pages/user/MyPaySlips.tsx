import { useState } from 'react';
import { DollarSign, Download, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PayslipDetail {
    period: string;
    releaseDate: string;
    grossPay: string;
    deductions: string;
    netPay: string;
    employee: string;
    empId: string;
    earnings: { label: string; amount: string }[];
    deductionItems: { label: string; amount: string }[];
    totalGross: string;
    totalDeductions: string;
    netTakeHome: string;
}

const payslipData: PayslipDetail[] = [
    {
        period: 'Jan 16 - 31, 2026', releaseDate: 'Jan 31, 2026', grossPay: '₱28,000.00', deductions: '-₱3,470.00', netPay: '₱24,530.00',
        employee: 'Rafael Santos (EMP-0012)', empId: 'EMP-0012',
        earnings: [
            { label: 'Basic Salary', amount: '₱25,000.00' },
            { label: 'De Minimis Allowance', amount: '₱2,010.00' },
            { label: 'Over-time Pay (4.5 hrs)', amount: '₱1,000.00' },
        ],
        deductionItems: [
            { label: 'Withholding Tax', amount: '₱2,100.00' },
            { label: 'SSS Contribution', amount: '₱900.00' },
            { label: 'PhilHealth', amount: '₱375.00' },
            { label: 'Pag-IBIG', amount: '₱100.00' },
        ],
        totalGross: '₱28,000.00', totalDeductions: '₱3,475.00', netTakeHome: '₱24,525.00',
    },
    {
        period: 'Jan 01 - 15, 2026', releaseDate: 'Jan 15, 2026', grossPay: '₱28,000.00', deductions: '-₱3,470.00', netPay: '₱24,530.00',
        employee: 'Rafael Santos (EMP-0012)', empId: 'EMP-0012',
        earnings: [
            { label: 'Basic Salary', amount: '₱25,000.00' },
            { label: 'De Minimis Allowance', amount: '₱2,010.00' },
            { label: 'Over-time Pay (4.5 hrs)', amount: '₱1,000.00' },
        ],
        deductionItems: [
            { label: 'Withholding Tax', amount: '₱2,100.00' },
            { label: 'SSS Contribution', amount: '₱900.00' },
            { label: 'PhilHealth', amount: '₱375.00' },
            { label: 'Pag-IBIG', amount: '₱100.00' },
        ],
        totalGross: '₱28,000.00', totalDeductions: '₱3,475.00', netTakeHome: '₱24,525.00',
    },
    {
        period: 'Dec 16 - 31, 2025', releaseDate: 'Dec 31, 2025', grossPay: '₱28,000.00', deductions: '-₱3,470.00', netPay: '₱24,530.00',
        employee: 'Rafael Santos (EMP-0012)', empId: 'EMP-0012',
        earnings: [{ label: 'Basic Salary', amount: '₱25,000.00' }, { label: 'De Minimis Allowance', amount: '₱2,010.00' }, { label: 'Over-time Pay', amount: '₱1,000.00' }],
        deductionItems: [{ label: 'Withholding Tax', amount: '₱2,100.00' }, { label: 'SSS Contribution', amount: '₱900.00' }, { label: 'PhilHealth', amount: '₱375.00' }, { label: 'Pag-IBIG', amount: '₱100.00' }],
        totalGross: '₱28,000.00', totalDeductions: '₱3,475.00', netTakeHome: '₱24,525.00',
    },
    {
        period: 'Dec 01 - 15, 2025', releaseDate: 'Dec 15, 2025', grossPay: '₱28,000.00', deductions: '-₱3,470.00', netPay: '₱24,550.00',
        employee: 'Rafael Santos (EMP-0012)', empId: 'EMP-0012',
        earnings: [{ label: 'Basic Salary', amount: '₱25,000.00' }, { label: 'De Minimis Allowance', amount: '₱2,010.00' }, { label: 'Over-time Pay', amount: '₱1,000.00' }],
        deductionItems: [{ label: 'Withholding Tax', amount: '₱2,100.00' }, { label: 'SSS Contribution', amount: '₱900.00' }, { label: 'PhilHealth', amount: '₱375.00' }, { label: 'Pag-IBIG', amount: '₱100.00' }],
        totalGross: '₱28,000.00', totalDeductions: '₱3,475.00', netTakeHome: '₱24,525.00',
    },
];

const MyPaySlips = () => {
    const [selectedPayslip, setSelectedPayslip] = useState<PayslipDetail | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 10;

    const ytdCards = [
        { label: 'YTD GROSS EARNINGS', value: '₱56,000.00', icon: DollarSign, color: '#059669', bg: '#ecfdf5' },
        { label: 'YTD NET PAY', value: '₱56,000.00', icon: DollarSign, color: '#2563eb', bg: '#eff6ff' },
        { label: 'YTD DEDUCTIONS', value: '₱56,000.00', icon: DollarSign, color: '#dc2626', bg: '#fef2f2' },
        { label: 'NEXT PAY', value: '₱56,000.00', icon: DollarSign, color: '#7c3aed', bg: '#f5f3ff' },
    ];

    const totalPages = Math.ceil(payslipData.length / perPage);

    return (
        <div className="space-y-6 pb-6">
            <div className="page-header animate-fade-in-up">
                <h1>My Pay Slips</h1>
                <p>View and download your payslip history</p>
            </div>

            {/* YTD Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                {ytdCards.map((card, i) => (
                    <div key={i} className="pro-card !p-0 overflow-hidden">
                        <div className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.bg }}>
                                <card.icon className="w-5 h-5" style={{ color: card.color }} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{card.label}</p>
                                <p className="text-lg font-bold text-gray-800">{card.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Latest Pay Highlight */}
            <div className="pro-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200">LATEST PAY (NET AMOUNT)</p>
                        <p className="text-3xl font-bold mt-1">₱24,530.00</p>
                        <p className="text-xs text-emerald-200 mt-1 flex items-center gap-1">
                            📅 Period: January 16 - 31, 2026
                        </p>
                    </div>
                    <div className="flex items-center gap-8 p-5 bg-gray-50">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">TOTAL GROSS</p>
                            <p className="text-xl font-bold text-gray-800 mt-1">₱28,000.00</p>
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">TOTAL DEDUCTIONS</p>
                            <p className="text-xl font-bold text-red-500 mt-1">₱3,470.00</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payslip History Table */}
            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-emerald-600 font-bold text-sm">Payslip History</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">PAY PERIOD</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">RELEASE DATE</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">GROSS PAY</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">DEDUCTIONS</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">NET PAY</th>
                                <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payslipData.map((slip, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">{slip.period}</td>
                                    <td className="px-5 py-3 text-sm text-gray-500">{slip.releaseDate}</td>
                                    <td className="px-5 py-3 text-sm text-gray-700">{slip.grossPay}</td>
                                    <td className="px-5 py-3 text-sm text-red-500 font-medium">{slip.deductions}</td>
                                    <td className="px-5 py-3 text-sm font-bold text-emerald-600">{slip.netPay}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setSelectedPayslip(slip)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-colors"
                                                title="View"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors" title="Download">
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 flex items-center justify-between text-xs text-gray-400">
                    <span>Showing {payslipData.length} of {payslipData.length}</span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" disabled={currentPage === 1}>
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)}
                                className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                                {i + 1}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" disabled={currentPage === totalPages}>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payslip Detail Modal */}
            {selectedPayslip && (
                <>
                    <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setSelectedPayslip(null)} />
                    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800">Payslip Details</h3>
                                <button onClick={() => setSelectedPayslip(null)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Company Header */}
                            <div className="text-center mb-6 pb-6 border-b border-gray-100">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                                    <span className="text-emerald-600 font-bold text-sm">SV</span>
                                </div>
                                <p className="text-sm font-bold text-gray-800">Simplevia</p>
                                <p className="text-xs text-gray-400">Technologies Inc</p>
                                <p className="text-xs text-gray-500 mt-2">Employee: <span className="font-semibold text-gray-700">{selectedPayslip.employee}</span></p>
                                <p className="text-xs text-gray-400">Pay Period: {selectedPayslip.period}</p>
                            </div>

                            {/* Earnings & Deductions */}
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">EARNINGS</h4>
                                    <div className="space-y-2">
                                        {selectedPayslip.earnings.map((e, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-500">{e.label}</span>
                                                <span className="font-semibold text-gray-700">{e.amount}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                                            <span className="font-bold text-gray-700">Total Gross Pay</span>
                                            <span className="font-bold text-gray-700">{selectedPayslip.totalGross}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">DEDUCTIONS</h4>
                                    <div className="space-y-2">
                                        {selectedPayslip.deductionItems.map((d, i) => (
                                            <div key={i} className="flex justify-between text-xs">
                                                <span className="text-gray-500">{d.label}</span>
                                                <span className="font-semibold text-gray-700">{d.amount}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-xs pt-2 border-t border-gray-100">
                                            <span className="font-bold text-red-500">Total Deductions</span>
                                            <span className="font-bold text-red-500">{selectedPayslip.totalDeductions}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Net Take Home */}
                            <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white text-center mb-4">
                                <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-200">NET TAKE HOME PAY</p>
                                <p className="text-3xl font-bold mt-1">{selectedPayslip.netTakeHome}</p>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors">
                                <Download className="w-4 h-4" /> Download (PDF)
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default MyPaySlips;

import { useState } from 'react';
import { DollarSign, TrendingDown, Percent, FileText, X, Download, Eye, Printer } from 'lucide-react';

type Tab = 'records' | 'deductions' | '13th' | 'payslip';

const Payroll = () => {
    const [activeTab, setActiveTab] = useState<Tab>('records');
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRemittanceModal, setShowRemittanceModal] = useState(false);
    const [showComputeModal, setShowComputeModal] = useState(false);
    const [show13thDetails, setShow13thDetails] = useState(false);
    const [showGeneratePayslips, setShowGeneratePayslips] = useState(false);
    const [showPayslipPreview, setShowPayslipPreview] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);

    const tabs = [
        { id: 'records' as Tab, label: 'Payroll Records', icon: FileText },
        { id: 'deductions' as Tab, label: 'Deductions', icon: TrendingDown },
        { id: '13th' as Tab, label: '13th Month Pay', icon: DollarSign },
        { id: 'payslip' as Tab, label: 'Payslip', icon: Printer },
    ];

    const statCards = [
        { label: 'Total Payroll', value: '₱8,400,000', icon: DollarSign, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Total Deductions', value: '₱1,700,000', icon: TrendingDown, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Avg Tax Rate', value: '8.5%', icon: Percent, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Net Payroll', value: '₱6,700,000', icon: DollarSign, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const payrollRecords = [
        { period: 'Jan 1-15, 2026', employees: 245, grossPay: '₱4,200,000', deductions: '₱850,000', netPay: '₱3,350,000', status: 'Processed' },
        { period: 'Jan 16-31, 2026', employees: 245, grossPay: '₱4,200,000', deductions: '₱850,000', netPay: '₱3,350,000', status: 'Processed' },
        { period: 'Feb 1-15, 2026', employees: 245, grossPay: '₱4,200,000', deductions: '₱850,000', netPay: '₱3,350,000', status: 'Pending' },
    ];

    const govDeductions = [
        { name: 'SSS Contributions', amount: '₱245,000', desc: 'Total for 245 employees', color: '#2563eb' },
        { name: 'PhilHealth', amount: '₱128,000', desc: 'Total for 245 employees', color: '#059669' },
        { name: 'Pag-IBIG', amount: '₱89,000', desc: 'Total for 245 employees', color: '#d97706' },
        { name: 'Withholding Tax', amount: '₱1,280,000', desc: 'Total for 245 employees', color: '#dc2626' },
    ];

    const thirteenthMonthData = [
        { empId: 'EMP-001', name: 'Dela Cruz, Juan', totalSalary: '₱480,000', thirteenthMonth: '₱40,000', status: 'Computed' },
        { empId: 'EMP-002', name: 'Santos, Maria', totalSalary: '₱540,000', thirteenthMonth: '₱45,000', status: 'Computed' },
        { empId: 'EMP-003', name: 'Reyes, Jose', totalSalary: '₱360,000', thirteenthMonth: '₱30,000', status: 'Pending' },
        { empId: 'EMP-004', name: 'Garcia, Ana', totalSalary: '₱420,000', thirteenthMonth: '₱35,000', status: 'Computed' },
    ];

    const payslipList = [
        { name: 'Dela Cruz, Juan', id: 'EMP-001', netPay: '₱28,500', status: 'Generated' },
        { name: 'Santos, Maria', id: 'EMP-002', netPay: '₱32,200', status: 'Generated' },
        { name: 'Reyes, Jose', id: 'EMP-003', netPay: '₱24,800', status: 'Pending' },
        { name: 'Garcia, Ana', id: 'EMP-004', netPay: '₱26,100', status: 'Generated' },
        { name: 'Bautista, Pedro', id: 'EMP-005', netPay: '₱22,300', status: 'Pending' },
    ];

    const statusBadge: Record<string, string> = {
        Processed: 'badge-success',
        Pending: 'badge-warning',
        Computed: 'badge-success',
        Generated: 'badge-success',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header animate-fade-in-up">
                <h1>Payroll</h1>
                <p>Manage payroll processing, deductions, and payslips</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="stat-label">{card.label}</p>
                                <p className="stat-value text-lg">{card.value}</p>
                            </div>
                            <div className="stat-icon">
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs Card */}
            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <div className="pro-tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* Payroll Records Tab */}
                    {activeTab === 'records' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Payroll Records</h3>
                                <button onClick={() => setShowProcessModal(true)} className="btn btn-primary">Process Payroll</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Period', 'Employees', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {payrollRecords.map((r, i) => (
                                            <tr key={i}>
                                                <td className="!font-medium !text-gray-800">{r.period}</td>
                                                <td>{r.employees}</td>
                                                <td>{r.grossPay}</td>
                                                <td className="!text-red-500">{r.deductions}</td>
                                                <td className="!font-bold !text-gray-900">{r.netPay}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td><button onClick={() => { setSelectedRecord(r); setShowDetailsModal(true); }} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Summary */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Payroll Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xl font-bold text-gray-900">₱8,400,000</p><p className="text-xs text-gray-500">Total Gross</p></div>
                                    <div><p className="text-xl font-bold text-red-500">₱1,700,000</p><p className="text-xs text-gray-500">Total Deductions</p></div>
                                    <div><p className="text-xl font-bold text-emerald-600">₱6,700,000</p><p className="text-xs text-gray-500">Total Net</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Deductions Tab */}
                    {activeTab === 'deductions' && (
                        <div className="space-y-6">
                            <h3 className="text-base font-bold text-gray-800">Government Deductions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {govDeductions.map(d => (
                                    <div key={d.name} className="pro-card !shadow-none border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: d.color + '15' }}>
                                            <DollarSign className="w-5 h-5" style={{ color: d.color }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                            <p className="text-lg font-bold" style={{ color: d.color }}>{d.amount}</p>
                                            <p className="text-xs text-gray-400">{d.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pro-card !shadow-none border border-gray-100 p-5">
                                <h4 className="text-sm font-bold text-gray-700 mb-4">Deductions Tracking — Monthly Breakdown</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-lg font-bold text-blue-600">₱462,000</p><p className="text-xs text-gray-500">Employee Share</p></div>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"><p className="text-lg font-bold text-emerald-600">₱580,000</p><p className="text-xs text-gray-500">Employer Share</p></div>
                                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100"><p className="text-lg font-bold text-orange-600">₱1,042,000</p><p className="text-xs text-gray-500">Total Remittance</p></div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowRemittanceModal(true)} className="btn btn-primary">Generate Remittance Report</button>
                                <button className="btn btn-secondary"><Download className="w-4 h-4" /> Export to Excel</button>
                            </div>
                        </div>
                    )}

                    {/* 13th Month Pay Tab */}
                    {activeTab === '13th' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">13th Month Pay Computation</h3>
                                <button onClick={() => setShowComputeModal(true)} className="btn btn-primary">Compute All</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee ID', 'Employee Name', 'Total Basic Salary (YTD)', '13th Month Pay', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {thirteenthMonthData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-mono text-xs">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td>{r.totalSalary}</td>
                                                <td className="!font-bold !text-emerald-600">{r.thirteenthMonth}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td><button onClick={() => setShow13thDetails(true)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Computation Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xl font-bold text-gray-900">245</p><p className="text-xs text-gray-500">Total Employees</p></div>
                                    <div><p className="text-xl font-bold text-gray-900">₱98,400,000</p><p className="text-xs text-gray-500">Total Basic Salary Annual</p></div>
                                    <div><p className="text-xl font-bold text-emerald-600">₱8,200,000</p><p className="text-xs text-gray-500">Total 13th Month</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payslip Tab */}
                    {activeTab === 'payslip' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Employee Payslips</h3>
                                <button onClick={() => setShowGeneratePayslips(true)} className="btn btn-primary">Generate All Payslips</button>
                            </div>
                            <div className="space-y-3">
                                {payslipList.map(emp => (
                                    <div key={emp.id} className="pro-card !shadow-none border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">{emp.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{emp.netPay}</p>
                                                <span className={`badge text-[10px] ${statusBadge[emp.status]}`}><span className="badge-dot" />{emp.status}</span>
                                            </div>
                                            <button onClick={() => setShowPayslipPreview(true)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                                            <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Process Payroll Modal */}
            {showProcessModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Process Payroll</h3><button onClick={() => setShowProcessModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Payroll Period</label><select className="pro-select"><option>Feb 16-28, 2026</option><option>Mar 1-15, 2026</option></select></div>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 border border-gray-100">
                                <p className="text-gray-600">Employees to process: <strong>245</strong></p>
                                <p className="text-gray-600">Estimated total: <strong>₱4,200,000</strong></p>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowProcessModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowProcessModal(false)} className="btn btn-primary">Process Payroll</button></div>
                    </div>
                </div>
            )}

            {/* Payroll Details Modal */}
            {showDetailsModal && selectedRecord && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Payroll Details</h3><button onClick={() => setShowDetailsModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-1">
                            {[['Period', selectedRecord.period], ['Employees', selectedRecord.employees], ['Gross Pay', selectedRecord.grossPay], ['Deductions', selectedRecord.deductions], ['Net Pay', selectedRecord.netPay], ['Status', selectedRecord.status]].map(([label, value]: any) => (
                                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-bold text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary">Close</button></div>
                    </div>
                </div>
            )}

            {/* Generate Remittance Report Modal */}
            {showRemittanceModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Generate Remittance Report</h3><button onClick={() => setShowRemittanceModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Report Type</label><select className="pro-select"><option>SSS Contribution Report</option><option>PhilHealth</option><option>Pag-IBIG</option><option>BIR Withholding Tax</option></select></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Month</label><select className="pro-select">{['January', 'February', 'March'].map(m => <option key={m}>{m}</option>)}</select></div>
                                <div><label className="pro-label">Year</label><select className="pro-select"><option>2026</option><option>2025</option></select></div>
                            </div>
                            <div>
                                <label className="pro-label">Format</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="format" defaultChecked className="accent-emerald-600" /> PDF</label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="format" className="accent-emerald-600" /> Excel</label>
                                </div>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowRemittanceModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowRemittanceModal(false)} className="btn btn-primary">Generate Report</button></div>
                    </div>
                </div>
            )}

            {/* Compute 13th Month Modal */}
            {showComputeModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Compute 13th Month Pay</h3><button onClick={() => setShowComputeModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <p className="text-sm text-gray-600">This will compute 13th month pay for all eligible employees based on their year-to-date basic salary.</p>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 border border-gray-100">
                                <p className="text-gray-600">Eligible Employees: <strong>245</strong></p>
                                <p className="text-gray-600">Estimated Total: <strong>₱8,200,000</strong></p>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" className="accent-emerald-600" /> Send notification to employees</label>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowComputeModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowComputeModal(false)} className="btn btn-primary">Generate Report</button></div>
                    </div>
                </div>
            )}

            {/* 13th Month Details Modal */}
            {show13thDetails && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>13th Month Pay Details</h3><button onClick={() => setShow13thDetails(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-1">
                            {[['Employee', 'Dela Cruz, Juan'], ['Employee ID', 'EMP-001'], ['Total Basic Salary (YTD)', '₱480,000'], ['Months Employed', '12'], ['Divisor', '12'], ['13th Month Pay', '₱40,000']].map(([label, value]) => (
                                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-bold text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pro-modal-footer">
                            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
                            <button onClick={() => setShow13thDetails(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate All Payslips Modal */}
            {showGeneratePayslips && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Generate All Payslips</h3><button onClick={() => setShowGeneratePayslips(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Payroll Period</label><select className="pro-select"><option>Feb 1-15, 2026</option><option>Jan 16-31, 2026</option></select></div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" className="accent-emerald-600" defaultChecked /> Email Notification</label>
                            <p className="text-sm text-gray-500">245 payslips will be generated</p>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowGeneratePayslips(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowGeneratePayslips(false)} className="btn btn-primary">Start Generation</button></div>
                    </div>
                </div>
            )}

            {/* Payslip Preview Modal */}
            {showPayslipPreview && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-lg !p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white text-center">
                            <h3 className="text-lg font-bold">SIMPLEVIA Technologies, Inc.</h3>
                            <p className="text-xs text-emerald-100/80">Employee Payslip</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[['Employee ID', 'EMP-001'], ['Position', 'Admin Officer'], ['Department', 'Admin'], ['Pay Period', 'Feb 1-15, 2026'], ['Payment Date', 'Feb 15, 2026']].map(([l, v]) => (
                                    <div key={l}><p className="text-gray-400 text-xs">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                                ))}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Earnings</h4>
                                <div className="space-y-1.5">
                                    {[['Basic Salary', '₱25,000'], ['Overtime Pay', '₱2,500'], ['Allowances', '₱3,000']].map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-sm"><span className="text-gray-600">{l}</span><span className="font-semibold">{v}</span></div>
                                    ))}
                                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Earnings</span><span>₱30,500</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Deductions</h4>
                                <div className="space-y-1.5">
                                    {[['SSS', '₱800'], ['PhilHealth', '₱400'], ['Pag-IBIG', '₱200'], ['Tax', '₱600']].map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-sm"><span className="text-gray-600">{l}</span><span className="text-red-500 font-medium">{v}</span></div>
                                    ))}
                                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Deductions</span><span className="text-red-500">₱2,000</span></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 flex justify-between text-white shadow-sm">
                                <span className="font-bold">Net Pay</span>
                                <span className="font-bold text-xl">₱28,500</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 pb-5">
                            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
                            <button onClick={() => setShowPayslipPreview(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;

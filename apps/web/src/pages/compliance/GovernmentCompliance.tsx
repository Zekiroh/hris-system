import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Download, X, Mail, Shield } from 'lucide-react';

type Tab = 'sss' | 'philhealth' | 'pagibig' | 'bir' | 'history';

const GovernmentCompliance = () => {
    const [activeTab, setActiveTab] = useState<Tab>('sss');
    const [showReportModal, setShowReportModal] = useState(false);
    const [showAlphalistModal, setShowAlphalistModal] = useState(false);
    const [showHistoryReportModal, setShowHistoryReportModal] = useState(false);

    const tabs = [
        { id: 'sss' as Tab, label: 'SSS', icon: Shield },
        { id: 'philhealth' as Tab, label: 'PhilHealth', icon: CheckCircle },
        { id: 'pagibig' as Tab, label: 'Pag-IBIG', icon: Shield },
        { id: 'bir' as Tab, label: 'BIR 2316', icon: AlertTriangle },
        { id: 'history' as Tab, label: 'Employment History', icon: Mail },
    ];

    const statCards = [
        { label: 'SSS Compliant', value: 245, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'PhilHealth Current', value: 245, icon: CheckCircle, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Pag-IBIG', value: 245, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Pending 2316', value: 12, icon: XCircle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    ];

    const statusBadge: Record<string, string> = {
        Current: 'badge-success',
        Pending: 'badge-warning',
        Remitted: 'badge-success',
        Signed: 'badge-success',
        'Pending Signature': 'badge-warning',
        Due: 'badge-danger',
        Paid: 'badge-success',
        Submitted: 'badge-success',
        Cleared: 'badge-info',
        Completed: 'badge-success',
    };

    const sssData = [
        { empId: 'EMP-001', name: 'Dela Cruz, Juan', sssNo: '34-1234567-8', monthly: '₱1,560', empShare: '₱630', erShare: '₱930', status: 'Current' },
        { empId: 'EMP-002', name: 'Santos, Maria', sssNo: '34-2345678-9', monthly: '₱2,080', empShare: '₱840', erShare: '₱1,240', status: 'Current' },
        { empId: 'EMP-003', name: 'Reyes, Jose', sssNo: '34-3456789-0', monthly: '₱1,200', empShare: '₱480', erShare: '₱720', status: 'Pending' },
    ];

    const philhealthData = [
        { empId: 'EMP-001', name: 'Dela Cruz, Juan', phNo: '12-123456789-0', rate: '5.0%', monthly: '₱1,000', empShare: '₱500', erShare: '₱500', status: 'Current' },
        { empId: 'EMP-002', name: 'Santos, Maria', phNo: '12-234567890-1', rate: '5.0%', monthly: '₱1,250', empShare: '₱625', erShare: '₱625', status: 'Current' },
    ];

    const pagibigData = [
        { name: 'Dela Cruz, Juan', midNo: '1234-5678-9012', mandatory: '₱200', mp2: '₱500', total: '₱700', status: 'Remitted' },
        { name: 'Santos, Maria', midNo: '2345-6789-0123', mandatory: '₱200', mp2: '-', total: '₱200', status: 'Remitted' },
        { name: 'Reyes, Jose', midNo: '3456-7890-1234', mandatory: '₱200', mp2: '₱300', total: '₱500', status: 'Remitted' },
    ];

    const birData = [
        { name: 'Dela Cruz, Juan', tin: '123-456-789-000', taxableIncome: '₱480,000', taxWithheld: '₱48,000', formStatus: 'Signed' },
        { name: 'Santos, Maria', tin: '234-567-890-001', taxableIncome: '₱540,000', taxWithheld: '₱62,000', formStatus: 'Signed' },
        { name: 'Reyes, Jose', tin: '345-678-901-002', taxableIncome: '₱360,000', taxWithheld: '₱28,000', formStatus: 'Pending Signature' },
    ];

    const historyData = [
        { date: '2026-02-20', employee: 'Fernandez, Rosa', event: 'Enrollment', reportedTo: 'SSS', status: 'Submitted' },
        { date: '2026-02-15', employee: 'Bautista, Pedro', event: 'Separation', reportedTo: 'SSS / PhilHealth / Pag-IBIG', status: 'Completed' },
        { date: '2026-01-10', employee: 'Garcia, Ana', event: 'Status Update', reportedTo: 'PhilHealth', status: 'Cleared' },
    ];

    const remittanceSchedule = [
        { month: 'January 2026', dueDate: 'Feb 10, 2026', status: 'Paid' },
        { month: 'February 2026', dueDate: 'Mar 10, 2026', status: 'Due' },
    ];

    const ReportModal = ({ title, show, onClose }: { title: string; show: boolean; onClose: () => void }) => {
        if (!show) return null;
        return (
            <div className="pro-modal-overlay">
                <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="pro-modal-header"><h3>{title}</h3><button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                    <div className="pro-modal-body space-y-4">
                        <div><label className="pro-label">Report Period</label><select className="pro-select"><option>January 2026</option><option>February 2026</option><option>Q1 2026</option><option>Annual 2025</option></select></div>
                        <div>
                            <label className="pro-label">Format</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reportFmt" defaultChecked className="accent-emerald-600" /> Excel</label>
                                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="reportFmt" className="accent-emerald-600" /> PDF</label>
                            </div>
                        </div>
                    </div>
                    <div className="pro-modal-footer"><button onClick={onClose} className="btn btn-secondary">Cancel</button><button onClick={onClose} className="btn btn-primary">Generate & Download</button></div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header animate-fade-in-up">
                <h1>Government Compliance Tracker</h1>
                <p>Monitor and manage government agency contributions and compliance</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="stat-label">{card.label}</p>
                                <p className="stat-value">{card.value}</p>
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
                    <div className="pro-tabs" style={{ overflowX: 'auto' }}>
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {/* SSS Tab */}
                    {activeTab === 'sss' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">SSS Contributions Monitor</h3>
                                <button onClick={() => setShowReportModal(true)} className="btn btn-primary"><Download className="w-4 h-4" /> Export Reports</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee ID', 'Employee Name', 'SSS Number', 'Monthly', 'EE Share', 'ER Share', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {sssData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-mono text-xs">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td className="font-mono text-xs">{r.sssNo}</td>
                                                <td>{r.monthly}</td>
                                                <td>{r.empShare}</td>
                                                <td>{r.erShare}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Monthly Summary</h4>
                                    <div className="space-y-2.5">
                                        {[['Total SSS Contributions', '₱245,000'], ['Employee Share', '₱98,000'], ['Employer Share', '₱147,000']].map(([l, v]) => (
                                            <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-bold text-gray-900">{v}</span></div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Remittance Schedule</h4>
                                    <div className="space-y-2.5">
                                        {remittanceSchedule.map((r, i) => (
                                            <div key={i} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{r.month}</span>
                                                <span className="text-gray-400 text-xs">Due: {r.dueDate}</span>
                                                <span className={`badge text-[10px] ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PhilHealth Tab */}
                    {activeTab === 'philhealth' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">PhilHealth Contributions Monitor</h3>
                                <button onClick={() => setShowReportModal(true)} className="btn btn-primary"><Download className="w-4 h-4" /> Export Reports</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee ID', 'Employee Name', 'PhilHealth No.', 'Rate', 'Monthly', 'EE Share', 'ER Share', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {philhealthData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-mono text-xs">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td className="font-mono text-xs">{r.phNo}</td>
                                                <td><span className="badge badge-info"><span className="badge-dot" />{r.rate}</span></td>
                                                <td>{r.monthly}</td>
                                                <td>{r.empShare}</td>
                                                <td>{r.erShare}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">PhilHealth Contributions Summary</h4>
                                <div className="space-y-2.5">
                                    {[['Total Contributions', '₱128,000'], ['Remittance Deadline', 'March 10, 2026']].map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-sm"><span className="text-gray-500">{l}</span><span className="font-bold text-gray-900">{v}</span></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pag-IBIG Tab */}
                    {activeTab === 'pagibig' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Pag-IBIG Fund (HDMF) Monitor</h3>
                                <button onClick={() => setShowReportModal(true)} className="btn btn-primary"><Download className="w-4 h-4" /> Export Reports</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                                <div className="pro-card !shadow-none border border-gray-100 p-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">Contribution Rates</h4>
                                    <div className="space-y-1.5 text-sm">
                                        <p className="text-gray-600">Employee Rate: <strong>2%</strong></p>
                                        <p className="text-gray-600">Employer Rate: <strong>2%</strong></p>
                                        <span className="badge badge-info mt-2 inline-flex"><span className="badge-dot" />Max Limit Applied</span>
                                    </div>
                                </div>
                                <div className="pro-card !shadow-none border border-gray-100 p-5">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">MP2 Savings Program</h4>
                                    <p className="text-3xl font-bold text-emerald-600">45</p>
                                    <p className="text-xs text-gray-500">Employees Enrolled</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee', 'MID Number', 'Mandatory', 'MP2 Savings', 'Total', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {pagibigData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td className="font-mono text-xs">{r.midNo}</td>
                                                <td>{r.mandatory}</td>
                                                <td>{r.mp2}</td>
                                                <td className="!font-bold">{r.total}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* BIR 2316 Tab */}
                    {activeTab === 'bir' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                                <h3 className="text-base font-bold text-gray-800">BIR Form 2316</h3>
                                <div className="flex gap-2">
                                    <button onClick={() => setShowReportModal(true)} className="btn btn-primary"><Download className="w-4 h-4" /> Export</button>
                                    <button className="btn btn-secondary"><Mail className="w-4 h-4" /> Email All</button>
                                    <button onClick={() => setShowAlphalistModal(true)} className="btn btn-secondary">Alphalist</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-2">
                                <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-100"><p className="text-xl font-bold text-emerald-700">233/245</p><p className="text-xs text-gray-500">Signed Forms</p></div>
                                <div className="bg-orange-50 rounded-xl p-4 text-center border border-orange-100"><p className="text-xl font-bold text-orange-600">12</p><p className="text-xs text-gray-500">Pending Signature</p></div>
                                <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100"><p className="text-xl font-bold text-blue-600">₱1.25M</p><p className="text-xs text-gray-500">Total Tax Withheld YTD</p></div>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee', 'TIN', 'Taxable Income', 'Tax Withheld', 'Form Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {birData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td className="font-mono text-xs">{r.tin}</td>
                                                <td>{r.taxableIncome}</td>
                                                <td>{r.taxWithheld}</td>
                                                <td><span className={`badge ${statusBadge[r.formStatus]}`}><span className="badge-dot" />{r.formStatus}</span></td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"><Download className="w-4 h-4" /></button>
                                                        <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"><Mail className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Employment History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Employment Status History (Government Reporting)</h3>
                                <button onClick={() => setShowHistoryReportModal(true)} className="btn btn-primary"><Download className="w-4 h-4" /> Generate Reports</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Date', 'Employee', 'Event', 'Reported To', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {historyData.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.date}</td>
                                                <td className="!font-medium !text-gray-800">{r.employee}</td>
                                                <td>{r.event}</td>
                                                <td>{r.reportedTo}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ReportModal title="Generate Reports" show={showReportModal} onClose={() => setShowReportModal(false)} />

            {/* BIR Alphalist Modal */}
            {showAlphalistModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>BIR Alphalist</h3><button onClick={() => setShowAlphalistModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Report Period</label><select className="pro-select"><option>Annual 2025</option><option>Annual 2026</option></select></div>
                            <div>
                                <label className="pro-label">Format</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="alphaFmt" defaultChecked className="accent-emerald-600" /> Excel</label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="alphaFmt" className="accent-emerald-600" /> PDF</label>
                                </div>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowAlphalistModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowAlphalistModal(false)} className="btn btn-primary">Generate & Download</button></div>
                    </div>
                </div>
            )}

            <ReportModal title="Employment History Report" show={showHistoryReportModal} onClose={() => setShowHistoryReportModal(false)} />
        </div>
    );
};

export default GovernmentCompliance;

import { useState } from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Plus, X, Calendar } from 'lucide-react';

type Tab = 'request' | 'balance' | 'history';
type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

const LeaveManagement = () => {
    const [activeTab, setActiveTab] = useState<Tab>('request');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showBalanceHistory, setShowBalanceHistory] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState('');

    const tabs = [
        { id: 'request' as Tab, label: 'Leave Requests', icon: Calendar },
        { id: 'balance' as Tab, label: 'Leave Balance', icon: CheckCircle },
        { id: 'history' as Tab, label: 'Leave History', icon: Clock },
    ];

    const statCards = [
        { label: 'Pending', value: 8, icon: Clock, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Approved', value: 42, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Rejected', value: 5, icon: XCircle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'On Leave Today', value: 3, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
    ];

    const statusBadge: Record<string, string> = {
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-danger',
    };

    const leaveRequests = [
        { employee: 'Dela Cruz, Juan', department: 'SimpleVia', leaveType: 'Vacation Leave', startDate: '2026-02-26', endDate: '2026-02-28', days: 3, status: 'Pending' as LeaveStatus },
        { employee: 'Santos, Maria', department: 'SimpleVia', leaveType: 'Sick Leave', startDate: '2026-02-20', endDate: '2026-02-21', days: 2, status: 'Approved' as LeaveStatus },
        { employee: 'Reyes, Jose', department: 'SimpleVia', leaveType: 'Emergency Leave', startDate: '2026-02-18', endDate: '2026-02-18', days: 1, status: 'Rejected' as LeaveStatus },
        { employee: 'Garcia, Ana', department: 'SimpleVia', leaveType: 'Vacation Leave', startDate: '2026-03-01', endDate: '2026-03-05', days: 5, status: 'Pending' as LeaveStatus },
        { employee: 'Fernandez, Rosa', department: 'SimpleVia', leaveType: 'Sick Leave', startDate: '2026-02-24', endDate: '2026-02-25', days: 2, status: 'Approved' as LeaveStatus },
    ];

    const leaveBalances = [
        { name: 'Dela Cruz, Juan', id: 'EMP-001', vacation: { total: 15, used: 5 }, sick: { total: 15, used: 3 }, emergency: { total: 5, used: 1 } },
        { name: 'Santos, Maria', id: 'EMP-002', vacation: { total: 15, used: 8 }, sick: { total: 15, used: 6 }, emergency: { total: 5, used: 0 } },
        { name: 'Reyes, Jose', id: 'EMP-003', vacation: { total: 15, used: 2 }, sick: { total: 15, used: 1 }, emergency: { total: 5, used: 2 } },
        { name: 'Garcia, Ana', id: 'EMP-004', vacation: { total: 15, used: 10 }, sick: { total: 15, used: 4 }, emergency: { total: 5, used: 0 } },
    ];

    const balanceHistoryData = [
        { date: '2026-02-20', leaveType: 'Sick Leave', action: 'Used', days: 2 },
        { date: '2026-01-15', leaveType: 'Vacation Leave', action: 'Used', days: 3 },
        { date: '2026-01-01', leaveType: 'All Types', action: 'Credited', days: 35 },
    ];

    const leaveHistory = [
        { dateApplied: '2026-02-15', employee: 'Dela Cruz, Juan', leaveType: 'Vacation Leave', duration: '3 days', status: 'Approved' as LeaveStatus, approver: 'Admin User' },
        { dateApplied: '2026-02-10', employee: 'Santos, Maria', leaveType: 'Sick Leave', duration: '2 days', status: 'Approved' as LeaveStatus, approver: 'Admin User' },
        { dateApplied: '2026-02-08', employee: 'Reyes, Jose', leaveType: 'Emergency Leave', duration: '1 day', status: 'Rejected' as LeaveStatus, approver: 'Admin User' },
        { dateApplied: '2026-01-28', employee: 'Garcia, Ana', leaveType: 'Vacation Leave', duration: '5 days', status: 'Approved' as LeaveStatus, approver: 'Admin User' },
    ];

    const BalanceCard = ({ label, total, used, color }: { label: string; total: number; used: number; color: string }) => {
        const remaining = total - used;
        const pct = (remaining / total) * 100;
        return (
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">{label}</p>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm" style={{ background: color }}>
                        {remaining}
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-900">{remaining}<span className="text-xs text-gray-400 font-medium ml-1">/ {total}</span></p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Remaining</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-sm font-bold text-gray-500">{used}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Used</p>
                    </div>
                </div>
                <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center animate-fade-in-up">
                <div className="page-header" style={{ marginBottom: 0 }}>
                    <h1>Leave Management</h1>
                    <p>Manage leave requests, balances, and history</p>
                </div>
                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary">
                    <Plus className="w-4 h-4" /> Apply for Leave
                </button>
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
                    {/* Leave Request Tab */}
                    {activeTab === 'request' && (
                        <div className="overflow-x-auto rounded-xl border border-gray-100">
                            <table className="pro-table">
                                <thead>
                                    <tr>
                                        {['Employee', 'Department', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status'].map(h => (
                                            <th key={h}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveRequests.map((r, i) => (
                                        <tr key={i}>
                                            <td className="!font-medium !text-gray-800">{r.employee}</td>
                                            <td>{r.department}</td>
                                            <td>{r.leaveType}</td>
                                            <td>{r.startDate}</td>
                                            <td>{r.endDate}</td>
                                            <td className="!font-semibold">{r.days}</td>
                                            <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Leave Balance Tab */}
                    {activeTab === 'balance' && (
                        <div className="space-y-5">
                            {leaveBalances.map(emp => (
                                <div key={emp.id} className="pro-card !shadow-none border border-gray-100 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setSelectedEmployee(emp.name); setShowBalanceHistory(true); }} className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
                                            View History →
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <BalanceCard label="Vacation Leave" total={emp.vacation.total} used={emp.vacation.used} color="#059669" />
                                        <BalanceCard label="Sick Leave" total={emp.sick.total} used={emp.sick.used} color="#d97706" />
                                        <BalanceCard label="Emergency Leave" total={emp.emergency.total} used={emp.emergency.used} color="#dc2626" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Leave History Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-5">
                            <div className="flex items-end gap-3 flex-wrap">
                                <div><label className="pro-label">Date From</label><input type="date" className="pro-input !w-auto" /></div>
                                <div><label className="pro-label">Date To</label><input type="date" className="pro-input !w-auto" /></div>
                                <button className="btn btn-primary h-fit">Generate Report</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            {['Date Applied', 'Employee', 'Leave Type', 'Duration', 'Status', 'Approver'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaveHistory.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.dateApplied}</td>
                                                <td className="!font-medium !text-gray-800">{r.employee}</td>
                                                <td>{r.leaveType}</td>
                                                <td>{r.duration}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td>{r.approver}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Apply for Leave Modal */}
            {showApplyModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Apply for Leave</h3>
                            <button onClick={() => setShowApplyModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div>
                                <label className="pro-label">Employee</label>
                                <select className="pro-select">
                                    <option value="" disabled selected>Select Employee</option>
                                    <option>Dela Cruz, Juan</option>
                                    <option>Santos, Maria</option>
                                    <option>Reyes, Jose</option>
                                    <option>Garcia, Ana</option>
                                    <option>Bautista, Pedro</option>
                                    <option>Fernandez, Rosa</option>
                                </select>
                            </div>
                            <div>
                                <label className="pro-label">Leave Type</label>
                                <select className="pro-select">
                                    <option>Vacation Leave</option>
                                    <option>Sick Leave</option>
                                    <option>Emergency Leave</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Start Date</label><input type="date" className="pro-input" /></div>
                                <div><label className="pro-label">End Date</label><input type="date" className="pro-input" /></div>
                            </div>
                            <div><label className="pro-label">Reason</label><textarea rows={3} className="pro-input resize-none" placeholder="Reason for leave..." /></div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowApplyModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={() => setShowApplyModal(false)} className="btn btn-primary">Submit Application</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Balance History Modal */}
            {showBalanceHistory && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Leave Balance History</h3>
                            <button onClick={() => setShowBalanceHistory(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body">
                            <p className="text-sm text-gray-500 mb-4 font-medium">{selectedEmployee}</p>
                            <div className="rounded-xl border border-gray-100 overflow-hidden">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            {['Date', 'Leave Type', 'Action', 'Days'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {balanceHistoryData.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.date}</td>
                                                <td>{r.leaveType}</td>
                                                <td>
                                                    <span className={`badge ${r.action === 'Used' ? 'badge-danger' : 'badge-success'}`}>
                                                        <span className="badge-dot" />{r.action}
                                                    </span>
                                                </td>
                                                <td className="!font-semibold">{r.days}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowBalanceHistory(false)} className="btn btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaveManagement;

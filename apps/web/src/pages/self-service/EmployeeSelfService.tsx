import { useState } from 'react';
import { User, FileText, Calendar, Bell, Download, Eye } from 'lucide-react';

type Tab = 'profile' | 'payslips' | 'leave' | 'attendance' | 'requests';

const EmployeeSelfService = () => {
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    const tabs = [
        { id: 'profile' as Tab, label: 'My Profile', icon: User },
        { id: 'payslips' as Tab, label: 'My Payslips', icon: FileText },
        { id: 'leave' as Tab, label: 'My Leave', icon: Calendar },
        { id: 'requests' as Tab, label: 'My Requests', icon: Bell },
    ];

    const profile = {
        name: 'Juan Dela Cruz',
        id: 'EMP-001',
        position: 'Admin Officer',
        department: 'Administration',
        email: 'juan.delacruz@simplevia.com',
        phone: '+63 912 345 6789',
        hireDate: 'January 15, 2024',
        status: 'Active',
    };

    const payslips = [
        { period: 'Feb 1-15, 2026', netPay: '₱28,500', date: 'Feb 15, 2026' },
        { period: 'Jan 16-31, 2026', netPay: '₱28,500', date: 'Jan 31, 2026' },
        { period: 'Jan 1-15, 2026', netPay: '₱27,800', date: 'Jan 15, 2026' },
    ];

    const myLeave = {
        vacation: { total: 15, used: 5, remaining: 10 },
        sick: { total: 15, used: 3, remaining: 12 },
        emergency: { total: 5, used: 1, remaining: 4 },
    };

    const myRequests = [
        { type: 'Leave Request', date: '2026-02-20', details: 'Vacation Leave - 3 days', status: 'Pending' },
        { type: 'Overtime Request', date: '2026-02-18', details: '2 hours - Project deadline', status: 'Approved' },
        { type: 'Certificate Request', date: '2026-02-15', details: 'Certificate of Employment', status: 'Completed' },
    ];

    const statusBadge: Record<string, string> = {
        Present: 'badge-success',
        Late: 'badge-warning',
        Absent: 'badge-danger',
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Completed: 'badge-info',
        Active: 'badge-success',
    };

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Employee Self-Service</h1>
                <p>View your personal information, payslips, and submit requests</p>
            </div>

            {/* Employee Banner Card */}
            <div className="rounded-2xl overflow-hidden animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #059669, #10b981, #34d399)', animationDelay: '0.1s', opacity: 0 }}>
                <div className="p-6 flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold border-2 border-white/30">JD</div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                        <p className="text-emerald-100 text-sm">{profile.position} • {profile.department}</p>
                        <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 text-white backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse" />{profile.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs Card */}
            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
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
                    {activeTab === 'profile' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {Object.entries(profile).map(([key, value]) => (
                                <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'payslips' && (
                        <div className="space-y-3">
                            {payslips.map(p => (
                                <div key={p.period} className="pro-card !shadow-none border border-gray-100 !p-4 flex items-center justify-between hover:border-emerald-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{p.period}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Paid: {p.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-bold text-emerald-600">{p.netPay}</p>
                                        <button className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                                        <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"><Download className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'leave' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Vacation Leave', ...myLeave.vacation, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
                                { label: 'Sick Leave', ...myLeave.sick, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
                                { label: 'Emergency Leave', ...myLeave.emergency, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
                            ].map(l => (
                                <div key={l.label} className="rounded-xl p-5 border border-gray-100 bg-white">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: l.gradient }}>
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs text-gray-500 font-semibold">{l.label}</p>
                                    </div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <p className="text-2xl font-bold text-gray-800">{l.remaining}</p>
                                        <p className="text-xs text-gray-400 mb-1">/ {l.total} remaining</p>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="h-2 rounded-full transition-all" style={{ width: `${(l.remaining / l.total) * 100}%`, background: l.gradient }} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1.5">{l.used} used</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'requests' && (
                        <div className="space-y-3">
                            {myRequests.map((r, i) => (
                                <div key={i} className="pro-card !shadow-none border border-gray-100 !p-4 flex items-center justify-between hover:border-emerald-200 transition-colors">
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{r.type}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{r.date} • {r.details}</p>
                                    </div>
                                    <span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeeSelfService;

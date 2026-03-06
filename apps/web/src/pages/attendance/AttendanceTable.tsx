import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Clock, Upload, X, Plus, Check, Edit, Eye } from 'lucide-react';

type Tab = 'dtr' | 'overtime' | 'setup';

const AttendanceTable = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dtr');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showOvertimeModal, setShowOvertimeModal] = useState(false);
    const [showAddShiftModal, setShowAddShiftModal] = useState(false);
    const [showEditShiftModal, setShowEditShiftModal] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);
    const [shiftForm, setShiftForm] = useState({ name: '', timeIn: '08:00', timeOut: '17:00', grace: '15', status: 'Active' });

    const tabs = [
        { id: 'dtr' as Tab, label: 'Daily Time Record', icon: Clock },
        { id: 'overtime' as Tab, label: 'Overtime', icon: AlertTriangle },
        { id: 'setup' as Tab, label: 'DTR Setup', icon: CheckCircle },
    ];

    const statCards = [
        { label: 'Present', value: 220, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Late', value: 12, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Absent', value: 8, icon: XCircle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Total Hours', value: '1,760', icon: Clock, gradient: 'linear-gradient(135deg, #6366f1, #818cf8)' },
    ];

    const [dtrRecords, setDtrRecords] = useState(() => {
        const saved = localStorage.getItem('attendance_logs');
        const userLogs = saved ? JSON.parse(saved) : [];
        const baseRecords = [
            { empId: 'EMP-001', name: 'Dela Cruz, Juan', timeIn: '07:55 AM', timeOut: '05:01 PM', status: 'Present', late: '-', overtime: '0:01' },
            { empId: 'EMP-002', name: 'Santos, Maria', timeIn: '08:15 AM', timeOut: '05:30 PM', status: 'Late', late: '15 min', overtime: '0:30' },
            { empId: 'EMP-003', name: 'Reyes, Jose', timeIn: '-', timeOut: '-', status: 'Absent', late: '-', overtime: '-' },
            { empId: 'EMP-004', name: 'Garcia, Ana', timeIn: '07:45 AM', timeOut: '06:00 PM', status: 'Present', late: '-', overtime: '1:00' },
            { empId: 'EMP-005', name: 'Bautista, Pedro', timeIn: '08:05 AM', timeOut: '05:00 PM', status: 'Late', late: '5 min', overtime: '-' },
            { empId: 'EMP-006', name: 'Fernandez, Rosa', timeIn: '07:50 AM', timeOut: '05:15 PM', status: 'Present', late: '-', overtime: '0:15' },
        ];
        // Combine with user logs, mapping fields accordingly
        const mappedUserLogs = userLogs.map((l: any) => ({
            empId: 'EMP-USER',
            name: 'Employee User',
            timeIn: l.timeIn,
            timeOut: l.timeOut,
            status: l.status,
            late: '-',
            overtime: '0:00'
        }));
        return [...mappedUserLogs, ...baseRecords];
    });

    useEffect(() => {
        const handleStorageChange = () => {
            const saved = localStorage.getItem('attendance_logs');
            if (saved) {
                const userLogs = JSON.parse(saved);
                const mappedUserLogs = userLogs.map((l: any) => ({
                    empId: 'EMP-USER',
                    name: 'Employee User',
                    timeIn: l.timeIn,
                    timeOut: l.timeOut,
                    status: l.status,
                    late: '-',
                    overtime: '0:00'
                }));
                // Using a callback to ensure we have latest state
                setDtrRecords(prev => {
                    const baseRecords = prev.filter(r => r.empId !== 'EMP-USER');
                    return [...mappedUserLogs, ...baseRecords];
                });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        const checkInterval = setInterval(handleStorageChange, 2000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(checkInterval);
        };
    }, []);

    const overtimeRequests = [
        { date: '2026-02-24', employee: 'Dela Cruz, Juan', duration: '2 hours', reason: 'Project deadline', status: 'Pending' },
        { date: '2026-02-23', employee: 'Garcia, Ana', duration: '3 hours', reason: 'Client deliverable', status: 'Approved' },
        { date: '2026-02-22', employee: 'Santos, Maria', duration: '1.5 hours', reason: 'System maintenance', status: 'Rejected' },
        { date: '2026-02-21', employee: 'Fernandez, Rosa', duration: '2 hours', reason: 'Report compilation', status: 'Pending' },
    ];

    const [shifts, setShifts] = useState([
        { id: 1, name: 'Regular Shift', timeIn: '08:00 AM', timeOut: '05:00 PM', grace: '15 min', employees: 180, status: 'Active' },
        { id: 2, name: 'Early Shift', timeIn: '06:00 AM', timeOut: '03:00 PM', grace: '10 min', employees: 35, status: 'Active' },
        { id: 3, name: 'Night Shift', timeIn: '10:00 PM', timeOut: '07:00 AM', grace: '15 min', employees: 20, status: 'Active' },
        { id: 4, name: 'Flexi Time', timeIn: '09:00 AM', timeOut: '06:00 PM', grace: '30 min', employees: 10, status: 'Inactive' },
    ]);

    const statusBadge: Record<string, string> = {
        Present: 'badge-success',
        Late: 'badge-warning',
        Absent: 'badge-danger',
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-danger',
        Active: 'badge-success',
        Inactive: 'badge-neutral',
    };

    const lateStats = [
        { label: 'Total Late Employees', value: 12 },
        { label: 'Total Late Minutes', value: '145 min' },
        { label: 'Avg Late Duration', value: '12 min' },
    ];

    const calendarDays = Array.from({ length: 28 }, (_, i) => i + 1);
    const today = new Date().getDate();

    const openEditShift = (shift: any) => {
        setEditingShift(shift);
        setShiftForm({ name: shift.name, timeIn: shift.timeIn, timeOut: shift.timeOut, grace: shift.grace.replace(' min', ''), status: shift.status });
        setShowEditShiftModal(true);
    };

    const handleAddShift = () => {
        setShifts([...shifts, { id: Date.now(), name: shiftForm.name, timeIn: shiftForm.timeIn, timeOut: shiftForm.timeOut, grace: shiftForm.grace + ' min', employees: 0, status: shiftForm.status }]);
        setShowAddShiftModal(false);
        setShiftForm({ name: '', timeIn: '08:00', timeOut: '17:00', grace: '15', status: 'Active' });
    };

    const handleEditShift = () => {
        if (!editingShift) return;
        setShifts(shifts.map(s => s.id === editingShift.id ? { ...s, name: shiftForm.name, timeIn: shiftForm.timeIn, timeOut: shiftForm.timeOut, grace: shiftForm.grace + ' min', status: shiftForm.status } : s));
        setShowEditShiftModal(false);
        setEditingShift(null);
    };

    const ShiftFormModal = ({ title, onSubmit, submitLabel, onClose }: { title: string; onSubmit: () => void; submitLabel: string; onClose: () => void }) => (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="pro-modal-body space-y-4">
                    <div>
                        <label className="pro-label">Shift Name</label>
                        <input type="text" value={shiftForm.name} onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })} className="pro-input" placeholder="e.g. Morning Shift" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Time In</label>
                            <input type="time" value={shiftForm.timeIn} onChange={e => setShiftForm({ ...shiftForm, timeIn: e.target.value })} className="pro-input" />
                        </div>
                        <div>
                            <label className="pro-label">Time Out</label>
                            <input type="time" value={shiftForm.timeOut} onChange={e => setShiftForm({ ...shiftForm, timeOut: e.target.value })} className="pro-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Grace Period (min)</label>
                            <input type="number" value={shiftForm.grace} onChange={e => setShiftForm({ ...shiftForm, grace: e.target.value })} className="pro-input" />
                        </div>
                        <div>
                            <label className="pro-label">Status</label>
                            <select value={shiftForm.status} onChange={e => setShiftForm({ ...shiftForm, status: e.target.value })} className="pro-select">
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="pro-modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={onSubmit} className="btn btn-primary">{submitLabel}</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header animate-fade-in-up">
                <h1>Time & Attendance</h1>
                <p>Monitor daily attendance, overtime, and shift schedules</p>
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

            {/* Tabs + Content */}
            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                {/* Tab Bar */}
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
                    {/* Daily Time Record Tab */}
                    {activeTab === 'dtr' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Attendance Records</h3>
                                <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                                    <Upload className="w-4 h-4" /> Upload DTR
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            {['Employee ID', 'Name', 'Time In', 'Time Out', 'Status', 'Late', 'Overtime', 'Actions'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dtrRecords.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-mono text-xs">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td>{r.timeIn}</td>
                                                <td>{r.timeOut}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td>{r.late}</td>
                                                <td>{r.overtime}</td>
                                                <td>
                                                    <div className="flex gap-1 justify-center">
                                                        <button className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50" title="Edit"><Edit className="w-4 h-4" /></button>
                                                        <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100" title="Hide"><Eye className="w-4 h-4" /></button>
                                                        <button className="btn-ghost btn-icon text-rose-500 hover:bg-rose-50" title="Block"><XCircle className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Late & Undertime + Calendar */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-2">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Late & Undertime Summary</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        {lateStats.map(s => (
                                            <div key={s.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                                                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">February 2026</h4>
                                    <div className="grid grid-cols-7 gap-1 text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                            <div key={i} className="text-[10px] text-gray-400 font-semibold py-1">{d}</div>
                                        ))}
                                        {calendarDays.map(d => (
                                            <div key={d} className={`text-xs py-1.5 rounded-lg cursor-pointer transition-colors ${d === today ? 'bg-emerald-500 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-emerald-50'}`}>{d}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overtime Tab */}
                    {activeTab === 'overtime' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Overtime Requests</h3>
                                <button onClick={() => setShowOvertimeModal(true)} className="btn btn-primary">
                                    <Plus className="w-4 h-4" /> Request Overtime
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            {['Date', 'Employee', 'Duration', 'Reason', 'Status', 'Action'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {overtimeRequests.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.date}</td>
                                                <td className="!font-medium !text-gray-800">{r.name || r.employee}</td>
                                                <td>{r.duration}</td>
                                                <td>{r.reason}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td>
                                                    {r.status === 'Pending' && (
                                                        <div className="flex gap-1">
                                                            <button className="btn-ghost btn-icon text-emerald-600 hover:bg-emerald-50"><Check className="w-4 h-4" /></button>
                                                            <button className="btn-ghost btn-icon text-red-500 hover:bg-red-50"><X className="w-4 h-4" /></button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* DTR Setup Tab */}
                    {activeTab === 'setup' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Shift Schedules</h3>
                                <button onClick={() => { setShiftForm({ name: '', timeIn: '08:00', timeOut: '17:00', grace: '15', status: 'Active' }); setShowAddShiftModal(true); }} className="btn btn-primary">
                                    <Plus className="w-4 h-4" /> Add Shift
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead>
                                        <tr>
                                            {['Shift Name', 'Time In', 'Time Out', 'Grace Period', 'Assigned', 'Status', 'Actions'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.map(s => (
                                            <tr key={s.id}>
                                                <td className="!font-medium !text-gray-800">{s.name}</td>
                                                <td>{s.timeIn}</td>
                                                <td>{s.timeOut}</td>
                                                <td>{s.grace}</td>
                                                <td>{s.employees}</td>
                                                <td><span className={`badge ${statusBadge[s.status]}`}><span className="badge-dot" />{s.status}</span></td>
                                                <td>
                                                    <button onClick={() => openEditShift(s)} className="btn-ghost btn-icon text-emerald-600 hover:bg-emerald-50">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload DTR Modal */}
            {showUploadModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Upload Daily Time Record</h3>
                            <button onClick={() => setShowUploadModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Date From</label><input type="date" className="pro-input" /></div>
                                <div><label className="pro-label">Date To</label><input type="date" className="pro-input" /></div>
                            </div>
                            <div>
                                <label className="pro-label">Entry Type</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="entry" defaultChecked className="accent-emerald-600" /> Biometric</label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="entry" className="accent-emerald-600" /> Manual Entry</label>
                                </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer group">
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-sm text-gray-600">Drag and drop file here or <span className="text-emerald-600 font-semibold">browse</span></p>
                                <p className="text-xs text-gray-400 mt-1">Supports CSV, XLSX</p>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-primary">Upload</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Overtime Modal */}
            {showOvertimeModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Request Overtime</h3>
                            <button onClick={() => setShowOvertimeModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Date</label><input type="date" className="pro-input" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Start Time</label><input type="time" className="pro-input" /></div>
                                <div><label className="pro-label">End Time</label><input type="time" className="pro-input" /></div>
                            </div>
                            <div>
                                <label className="pro-label">Reason</label>
                                <textarea rows={3} className="pro-input resize-none" placeholder="Describe reason for overtime..." />
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowOvertimeModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={() => setShowOvertimeModal(false)} className="btn btn-primary">Submit Request</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Shift Modal */}
            {showAddShiftModal && (
                <ShiftFormModal title="Add Shift" onSubmit={handleAddShift} submitLabel="Add Shift" onClose={() => setShowAddShiftModal(false)} />
            )}

            {/* Edit Shift Modal */}
            {showEditShiftModal && (
                <ShiftFormModal title="Edit Shift" onSubmit={handleEditShift} submitLabel="Save Changes" onClose={() => setShowEditShiftModal(false)} />
            )}
        </div>
    );
};

export default AttendanceTable;

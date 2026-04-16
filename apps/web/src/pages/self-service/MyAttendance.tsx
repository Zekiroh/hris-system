import { useEffect, useState } from 'react';
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    Clock,
    Upload,
    X,
    Plus,
    Check,
    Eye,
    Edit,
} from 'lucide-react';
import {
    adminAssignOvertimeRequest,
    getOvertimeRequests,
    reviewOvertimeRequest,
} from '../../lib/attendance';

type Tab = 'dtr' | 'overtime' | 'setup';

const AttendanceTable = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dtr');

    // Feature Modals
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showAssignOvertimeModal, setShowAssignOvertimeModal] = useState(false);

    // DTR Action Modals
    const [showViewDtrModal, setShowViewDtrModal] = useState(false);
    const [showEditDtrModal, setShowEditDtrModal] = useState(false);
    const [selectedDtrRecord, setSelectedDtrRecord] = useState<any>(null);

    // Shift Setup States
    const [showAddShiftModal, setShowAddShiftModal] = useState(false);
    const [showEditShiftModal, setShowEditShiftModal] = useState(false);
    const [editingShift, setEditingShift] = useState<any>(null);
    const [shiftForm, setShiftForm] = useState({
        name: '',
        timeIn: '08:00',
        timeOut: '17:00',
        grace: '15',
        status: 'Active',
    });

    // Admin Assign OT form
    const [assignOtForm, setAssignOtForm] = useState({
        employeeId: '',
        dateFrom: '',
        dateTo: '',
        requestedMinutes: '',
        reason: '',
    });
    const [submittingAssignOt, setSubmittingAssignOt] = useState(false);

    const tabs = [
        { id: 'dtr' as Tab, label: 'Daily Time Record', icon: Clock },
        { id: 'overtime' as Tab, label: 'Overtime', icon: AlertTriangle },
        { id: 'setup' as Tab, label: 'DTR Setup', icon: CheckCircle },
    ];

    const statCards = [
        { label: 'Present', value: 220, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Late', value: 12, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Absent', value: 8, icon: XCircle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Total Hours', value: '1,760', icon: Clock, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const [dtrRecords, setDtrRecords] = useState<any[]>(() => {
        const saved = localStorage.getItem('attendance_logs');
        const userLogs = saved ? JSON.parse(saved) : [];
        const baseRecords = [
            { id: 'm1', empId: 'EMP-001', name: 'Dela Cruz, Juan', date: '2026-03-05', timeIn: '07:55 AM', timeOut: '07:01 PM', status: 'Present', isOT: true, remarks: 'Project deployment' },
            { id: 'm2', empId: 'EMP-002', name: 'Santos, Maria', date: '2026-03-05', timeIn: '08:20 AM', timeOut: '06:30 PM', status: 'Late', isOT: true, remarks: 'Traffic / Client meeting' },
            { id: 'm3', empId: 'EMP-003', name: 'Reyes, Jose', date: '2026-03-05', timeIn: '-', timeOut: '-', status: 'Absent', isOT: false, remarks: 'Sick Leave' },
            { id: 'm4', empId: 'EMP-004', name: 'Garcia, Ana', date: '2026-03-05', timeIn: '07:45 AM', timeOut: '05:00 PM', status: 'Present', isOT: false, remarks: '-' },
            { id: 'm5', empId: 'EMP-005', name: 'Garcia, Carlos', date: '2026-03-05', timeIn: '08:45 AM', timeOut: '05:00 PM', status: 'Late', isOT: false, remarks: '-' },
        ];

        const mappedUserLogs = userLogs.map((l: any) => ({
            id: l.id,
            empId: 'EMP-USER',
            name: 'Employee User',
            date: l.date,
            timeIn: l.timeIn,
            timeOut: l.timeOut,
            status: l.status,
            isOT: l.isOT || false,
            remarks: l.remarks || '-',
        }));

        return [...mappedUserLogs, ...baseRecords];
    });

    const [overtimeRequests, setOvertimeRequests] = useState<any[]>([]);
    const [loadingOt, setLoadingOt] = useState(false);
    const [reviewingOtId, setReviewingOtId] = useState<number | null>(null);

    const [shifts, setShifts] = useState([
        { id: 1, name: 'Regular Shift', timeIn: '08:00 AM', timeOut: '05:00 PM', grace: '15 min', employees: 180, status: 'Active' },
        { id: 2, name: 'Early Shift', timeIn: '06:00 AM', timeOut: '03:00 PM', grace: '10 min', employees: 35, status: 'Active' },
        { id: 3, name: 'Night Shift', timeIn: '10:00 PM', timeOut: '07:00 AM', grace: '15 min', employees: 20, status: 'Active' },
        { id: 4, name: 'Flexi Time', timeIn: '09:00 AM', timeOut: '06:00 PM', grace: '30 min', employees: 10, status: 'Inactive' },
    ]);

    const fetchOt = async () => {
        try {
            setLoadingOt(true);

            const res = await getOvertimeRequests();

            const mapped = (res.items || []).map((o: any) => ({
                id: o.id,
                date: o.attendanceDate || '—',
                employee: o.employeeName || '—',
                duration: `${(Number(o.requestedMinutes ?? 0) / 60).toFixed(1)} hours`,
                reason: o.reason || '—',
                status: o.status || 'Pending',
            }));

            setOvertimeRequests(mapped);
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to load overtime requests.');
        } finally {
            setLoadingOt(false);
        }
    };

    useEffect(() => {
        fetchOt();
    }, []);

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

    const convertDisplayTimeTo24Hour = (time: string) => {
        const [rawTime, modifier] = time.split(' ');
        let [hours, minutes] = rawTime.split(':').map(Number);

        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    };

    const format24HourToDisplay = (time: string) => {
        const [hourString, minute] = time.split(':');
        let hour = Number(hourString);
        const modifier = hour >= 12 ? 'PM' : 'AM';

        if (hour === 0) hour = 12;
        else if (hour > 12) hour -= 12;

        return `${String(hour).padStart(2, '0')}:${minute} ${modifier}`;
    };

    const handleViewDtr = (record: any) => {
        setSelectedDtrRecord(record);
        setShowViewDtrModal(true);
    };

    const handleEditDtrClick = (record: any) => {
        setSelectedDtrRecord({ ...record });
        setShowEditDtrModal(true);
    };

    const handleSaveDtrEdit = () => {
        if (!selectedDtrRecord) return;

        setDtrRecords(prev => prev.map(r => (r.id === selectedDtrRecord.id ? selectedDtrRecord : r)));

        if (typeof selectedDtrRecord.id === 'number') {
            const saved = JSON.parse(localStorage.getItem('attendance_logs') || '[]');
            const updatedSaved = saved.map((o: any) =>
                o.id === selectedDtrRecord.id
                    ? {
                          ...o,
                          timeIn: selectedDtrRecord.timeIn,
                          timeOut: selectedDtrRecord.timeOut,
                          status: selectedDtrRecord.status,
                          isOT: selectedDtrRecord.isOT,
                      }
                    : o
            );
            localStorage.setItem('attendance_logs', JSON.stringify(updatedSaved));
        }

        setShowEditDtrModal(false);
    };

    const handleUpdateOvertimeStatus = async (
        id: number,
        newStatus: 'Approved' | 'Rejected'
    ) => {
        const action = newStatus === 'Approved' ? 'Approve' : 'Reject';

        try {
            setReviewingOtId(id);

            await reviewOvertimeRequest(id, {
                action,
                remarks: newStatus === 'Approved' ? 'Approved.' : 'Rejected.',
            });

            setOvertimeRequests(prev =>
                prev.map(r => (r.id === id ? { ...r, status: newStatus } : r))
            );
        } catch (err: any) {
            console.error(err);
            alert(err.message || `Failed to ${action.toLowerCase()} overtime request.`);
        } finally {
            setReviewingOtId(null);
        }
    };

    const handleAssignOvertime = async () => {
        if (
            !assignOtForm.employeeId.trim() ||
            !assignOtForm.dateFrom ||
            !assignOtForm.dateTo ||
            !assignOtForm.requestedMinutes ||
            !assignOtForm.reason.trim()
        ) {
            alert('Please complete all overtime assignment fields.');
            return;
        }

        try {
            setSubmittingAssignOt(true);

            await adminAssignOvertimeRequest({
                employeeId: assignOtForm.employeeId.trim(),
                dateFrom: assignOtForm.dateFrom,
                dateTo: assignOtForm.dateTo,
                requestedMinutes: Number(assignOtForm.requestedMinutes),
                reason: assignOtForm.reason.trim(),
            });

            alert('Overtime assigned successfully.');

            setShowAssignOvertimeModal(false);
            setAssignOtForm({
                employeeId: '',
                dateFrom: '',
                dateTo: '',
                requestedMinutes: '',
                reason: '',
            });

            await fetchOt();
        } catch (err: any) {
            console.error(err);
            alert(err.message || 'Failed to assign overtime.');
        } finally {
            setSubmittingAssignOt(false);
        }
    };

    const handleAddShift = () => {
        setShifts([
            ...shifts,
            {
                id: Date.now(),
                name: shiftForm.name,
                timeIn: format24HourToDisplay(shiftForm.timeIn),
                timeOut: format24HourToDisplay(shiftForm.timeOut),
                grace: shiftForm.grace + ' min',
                employees: 0,
                status: shiftForm.status,
            },
        ]);
        setShowAddShiftModal(false);
        setShiftForm({
            name: '',
            timeIn: '08:00',
            timeOut: '17:00',
            grace: '15',
            status: 'Active',
        });
    };

    const handleEditShiftClick = (shift: any) => {
        setEditingShift(shift);
        setShiftForm({
            name: shift.name,
            timeIn: convertDisplayTimeTo24Hour(shift.timeIn),
            timeOut: convertDisplayTimeTo24Hour(shift.timeOut),
            grace: shift.grace.replace(' min', ''),
            status: shift.status,
        });
        setShowEditShiftModal(true);
    };

    const handleEditShift = () => {
        if (!editingShift) return;

        setShifts(
            shifts.map(s =>
                s.id === editingShift.id
                    ? {
                          ...s,
                          name: shiftForm.name,
                          timeIn: format24HourToDisplay(shiftForm.timeIn),
                          timeOut: format24HourToDisplay(shiftForm.timeOut),
                          grace: shiftForm.grace + ' min',
                          status: shiftForm.status,
                      }
                    : s
            )
        );

        setShowEditShiftModal(false);
        setEditingShift(null);
        setShiftForm({
            name: '',
            timeIn: '08:00',
            timeOut: '17:00',
            grace: '15',
            status: 'Active',
        });
    };

    const ShiftFormModal = ({
        title,
        onSubmit,
        submitLabel,
        onClose,
    }: {
        title: string;
        onSubmit: () => void;
        submitLabel: string;
        onClose: () => void;
    }) => (
        <div className="pro-modal-overlay">
            <div className="pro-modal max-w-md w-full mx-4 sm:mx-auto" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header">
                    <h3>{title}</h3>
                    <button onClick={onClose} className="btn-ghost btn-icon">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-4">
                    <div>
                        <label className="pro-label">Shift Name</label>
                        <input
                            type="text"
                            value={shiftForm.name}
                            onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })}
                            className="pro-input"
                            placeholder="e.g. Morning Shift"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Time In</label>
                            <input
                                type="time"
                                value={shiftForm.timeIn}
                                onChange={e => setShiftForm({ ...shiftForm, timeIn: e.target.value })}
                                className="pro-input"
                            />
                        </div>
                        <div>
                            <label className="pro-label">Time Out</label>
                            <input
                                type="time"
                                value={shiftForm.timeOut}
                                onChange={e => setShiftForm({ ...shiftForm, timeOut: e.target.value })}
                                className="pro-input"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="pro-label">Grace Period (min)</label>
                            <input
                                type="number"
                                value={shiftForm.grace}
                                onChange={e => setShiftForm({ ...shiftForm, grace: e.target.value })}
                                className="pro-input"
                            />
                        </div>
                        <div>
                            <label className="pro-label">Status</label>
                            <select
                                value={shiftForm.status}
                                onChange={e => setShiftForm({ ...shiftForm, status: e.target.value })}
                                className="pro-select"
                            >
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
            <div className="page-header animate-fade-in-up">
                <h1>Time & Attendance</h1>
                <p>Monitor daily attendance, overtime, and shift schedules</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div
                        key={card.label}
                        className="stat-card animate-fade-in-up"
                        style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}
                    >
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

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <div className="pro-tabs">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'dtr' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Attendance Records</h3>
                                <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                                    <Upload className="w-4 h-4" /> Upload DTR
                                </button>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table w-full">
                                    <thead>
                                        <tr>
                                            {['Employee ID', 'Name', 'Date', 'Time In', 'Time Out', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dtrRecords.map(r => (
                                            <tr key={r.id}>
                                                <td className="font-mono text-xs whitespace-nowrap">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800 whitespace-nowrap">{r.name}</td>
                                                <td className="whitespace-nowrap">{r.date}</td>
                                                <td className="whitespace-nowrap font-mono">{r.timeIn}</td>
                                                <td className="whitespace-nowrap font-mono">{r.timeOut}</td>
                                                <td className="whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`badge ${statusBadge[r.status]}`}>
                                                            <span className="badge-dot" />
                                                            {r.status}
                                                        </span>
                                                        {r.isOT && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                                OT
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1 justify-center">
                                                        <button
                                                            onClick={() => handleEditDtrClick(r)}
                                                            className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                                            title="Edit Record"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleViewDtr(r)}
                                                            className="btn-ghost btn-icon text-gray-500 hover:bg-gray-100"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

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
                                            <div
                                                key={d}
                                                className={`text-xs py-1.5 rounded-lg cursor-pointer transition-colors ${
                                                    d === today ? 'bg-emerald-500 text-white font-bold shadow-sm' : 'text-gray-600 hover:bg-emerald-50'
                                                }`}
                                            >
                                                {d}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'overtime' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Overtime Requests</h3>
                                <button
                                    onClick={() => setShowAssignOvertimeModal(true)}
                                    className="btn btn-primary"
                                >
                                    <Plus className="w-4 h-4" /> Assign Overtime
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table w-full">
                                    <thead>
                                        <tr>
                                            {['Date', 'Employee', 'Duration', 'Reason', 'Status', 'Action'].map(h => (
                                                <th key={h} className="whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loadingOt ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-6 text-gray-400">
                                                    Loading overtime requests...
                                                </td>
                                            </tr>
                                        ) : overtimeRequests.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-6 text-gray-400">
                                                    No overtime requests found.
                                                </td>
                                            </tr>
                                        ) : (
                                            overtimeRequests.map(r => (
                                                <tr key={r.id}>
                                                    <td className="whitespace-nowrap">{r.date}</td>
                                                    <td className="!font-medium !text-gray-800 whitespace-nowrap">{r.employee}</td>
                                                    <td className="whitespace-nowrap font-bold text-amber-600">{r.duration}</td>
                                                    <td className="min-w-[200px]">
                                                        <p className="text-xs text-gray-600 truncate max-w-xs">{r.reason}</p>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${statusBadge[r.status]}`}>
                                                            <span className="badge-dot" />
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {r.status === 'Pending' ? (
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateOvertimeStatus(r.id, 'Approved')}
                                                                    disabled={reviewingOtId === r.id}
                                                                    className="btn-ghost btn-icon bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Approve"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleUpdateOvertimeStatus(r.id, 'Rejected')}
                                                                    disabled={reviewingOtId === r.id}
                                                                    className="btn-ghost btn-icon bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Reject"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">Resolved</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'setup' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Shift Schedules</h3>
                                <button
                                    onClick={() => {
                                        setShiftForm({
                                            name: '',
                                            timeIn: '08:00',
                                            timeOut: '17:00',
                                            grace: '15',
                                            status: 'Active',
                                        });
                                        setShowAddShiftModal(true);
                                    }}
                                    className="btn btn-primary"
                                >
                                    <Plus className="w-4 h-4" /> Add Shift
                                </button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table w-full">
                                    <thead>
                                        <tr>
                                            {['Shift Name', 'Time In', 'Time Out', 'Grace Period', 'Assigned', 'Status', 'Actions'].map(h => (
                                                <th key={h}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shifts.map(shift => (
                                            <tr key={shift.id}>
                                                <td className="!font-medium !text-gray-800">{shift.name}</td>
                                                <td>{shift.timeIn}</td>
                                                <td>{shift.timeOut}</td>
                                                <td>{shift.grace}</td>
                                                <td>{shift.employees}</td>
                                                <td>
                                                    <span className={`badge ${statusBadge[shift.status]}`}>
                                                        <span className="badge-dot" />
                                                        {shift.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="flex gap-1 justify-center">
                                                        <button
                                                            onClick={() => handleEditShiftClick(shift)}
                                                            className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                                            title="Edit Shift"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                setShifts(prev =>
                                                                    prev.map(s =>
                                                                        s.id === shift.id
                                                                            ? {
                                                                                  ...s,
                                                                                  status: s.status === 'Active' ? 'Inactive' : 'Active',
                                                                              }
                                                                            : s
                                                                    )
                                                                )
                                                            }
                                                            className="btn-ghost btn-icon text-gray-500 hover:bg-gray-100"
                                                            title={shift.status === 'Active' ? 'Deactivate Shift' : 'Activate Shift'}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
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

            {showEditDtrModal && selectedDtrRecord && (
                <div className="pro-modal-overlay z-[200]">
                    <div className="pro-modal max-w-md w-full mx-4 sm:mx-auto" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100 pb-4">
                            <h3>Edit Attendance Record</h3>
                            <button onClick={() => setShowEditDtrModal(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-2">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Employee</p>
                                <p className="font-bold text-gray-900">
                                    {selectedDtrRecord.name} <span className="text-gray-400 font-normal">({selectedDtrRecord.empId})</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Time In</label>
                                    <input
                                        type="text"
                                        value={selectedDtrRecord.timeIn}
                                        onChange={e => setSelectedDtrRecord({ ...selectedDtrRecord, timeIn: e.target.value })}
                                        className="pro-input font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Time Out</label>
                                    <input
                                        type="text"
                                        value={selectedDtrRecord.timeOut}
                                        onChange={e => setSelectedDtrRecord({ ...selectedDtrRecord, timeOut: e.target.value })}
                                        className="pro-input font-mono"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="pro-label">Core Status</label>
                                <select
                                    value={selectedDtrRecord.status}
                                    onChange={e => setSelectedDtrRecord({ ...selectedDtrRecord, status: e.target.value })}
                                    className="pro-select"
                                >
                                    <option value="Present">Present</option>
                                    <option value="Late">Late</option>
                                    <option value="Absent">Absent</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="isOT"
                                    checked={selectedDtrRecord.isOT || false}
                                    onChange={e => setSelectedDtrRecord({ ...selectedDtrRecord, isOT: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                />
                                <label htmlFor="isOT" className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                                    Include Overtime (OT) Status
                                </label>
                            </div>
                        </div>
                        <div className="pro-modal-footer flex-col sm:flex-row gap-2 sm:gap-0 border-t border-gray-100 pt-4">
                            <button onClick={() => setShowEditDtrModal(false)} className="btn btn-secondary w-full sm:w-auto">
                                Cancel
                            </button>
                            <button onClick={handleSaveDtrEdit} className="btn btn-primary w-full sm:w-auto">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showViewDtrModal && selectedDtrRecord && (
                <div className="pro-modal-overlay z-[200]">
                    <div className="pro-modal max-w-md w-full mx-4 sm:mx-auto" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100 pb-4">
                            <h3>Attendance Details</h3>
                            <button onClick={() => setShowViewDtrModal(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0">
                                    {selectedDtrRecord.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">{selectedDtrRecord.name}</h2>
                                    <p className="text-sm text-gray-500">{selectedDtrRecord.date}</p>
                                </div>
                                <div className="ml-auto flex gap-1">
                                    <span className={`badge ${statusBadge[selectedDtrRecord.status]}`}>
                                        <span className="badge-dot" />
                                        {selectedDtrRecord.status}
                                    </span>
                                    {selectedDtrRecord.isOT && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                            OT
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Time In</p>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-emerald-500" />
                                        <span className="text-lg font-black font-mono text-gray-800">{selectedDtrRecord.timeIn}</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">Time Out</p>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-rose-500" />
                                        <span className="text-lg font-black font-mono text-gray-800">{selectedDtrRecord.timeOut}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Remarks / Tasks</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedDtrRecord.remarks}</p>
                            </div>
                        </div>
                        <div className="pro-modal-footer pt-4 border-t border-gray-100">
                            <button onClick={() => setShowViewDtrModal(false)} className="btn btn-secondary w-full">
                                Close Window
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUploadModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md w-full mx-4 sm:mx-auto" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Upload Daily Time Record</h3>
                            <button onClick={() => setShowUploadModal(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Date From</label>
                                    <input type="date" className="pro-input" />
                                </div>
                                <div>
                                    <label className="pro-label">Date To</label>
                                    <input type="date" className="pro-input" />
                                </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer group">
                                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
                                <p className="text-sm text-gray-600">
                                    Drag and drop file here or <span className="text-emerald-600 font-semibold">browse</span>
                                </p>
                            </div>
                        </div>
                        <div className="pro-modal-footer flex-col sm:flex-row gap-2 sm:gap-0">
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-secondary w-full sm:w-auto">
                                Cancel
                            </button>
                            <button onClick={() => setShowUploadModal(false)} className="btn btn-primary w-full sm:w-auto">
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAssignOvertimeModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-lg w-full mx-4 sm:mx-auto" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Assign Overtime</h3>
                            <button onClick={() => setShowAssignOvertimeModal(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div>
                                <label className="pro-label">Employee ID</label>
                                <input
                                    type="text"
                                    value={assignOtForm.employeeId}
                                    onChange={e => setAssignOtForm({ ...assignOtForm, employeeId: e.target.value })}
                                    className="pro-input"
                                    placeholder="Enter employee ID / GUID"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Date From</label>
                                    <input
                                        type="date"
                                        value={assignOtForm.dateFrom}
                                        onChange={e => setAssignOtForm({ ...assignOtForm, dateFrom: e.target.value })}
                                        className="pro-input"
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Date To</label>
                                    <input
                                        type="date"
                                        value={assignOtForm.dateTo}
                                        onChange={e => setAssignOtForm({ ...assignOtForm, dateTo: e.target.value })}
                                        className="pro-input"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="pro-label">Requested Minutes</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={assignOtForm.requestedMinutes}
                                    onChange={e => setAssignOtForm({ ...assignOtForm, requestedMinutes: e.target.value })}
                                    className="pro-input"
                                    placeholder="e.g. 60, 120, 180"
                                />
                            </div>

                            <div>
                                <label className="pro-label">Reason</label>
                                <textarea
                                    rows={3}
                                    value={assignOtForm.reason}
                                    onChange={e => setAssignOtForm({ ...assignOtForm, reason: e.target.value })}
                                    className="pro-input resize-none"
                                    placeholder="Enter overtime assignment reason..."
                                />
                            </div>
                        </div>
                        <div className="pro-modal-footer flex-col sm:flex-row gap-2 sm:gap-0">
                            <button
                                onClick={() => setShowAssignOvertimeModal(false)}
                                className="btn btn-secondary w-full sm:w-auto"
                                disabled={submittingAssignOt}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignOvertime}
                                className="btn btn-primary w-full sm:w-auto"
                                disabled={submittingAssignOt}
                            >
                                {submittingAssignOt ? 'Assigning...' : 'Assign Overtime'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddShiftModal && (
                <ShiftFormModal
                    title="Add Shift"
                    onSubmit={handleAddShift}
                    submitLabel="Add Shift"
                    onClose={() => setShowAddShiftModal(false)}
                />
            )}

            {showEditShiftModal && (
                <ShiftFormModal
                    title="Edit Shift"
                    onSubmit={handleEditShift}
                    submitLabel="Save Changes"
                    onClose={() => {
                        setShowEditShiftModal(false);
                        setEditingShift(null);
                    }}
                />
            )}
        </div>
    );
};

export default AttendanceTable;
import { useState, useEffect } from 'react';
import { Clock, Send, Play, Square } from 'lucide-react';

const MyAttendance = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [punchedIn, setPunchedIn] = useState(false);
    const [punchedOut, setPunchedOut] = useState(false);
    const [attendanceForm, setAttendanceForm] = useState({
        timeIn: '',
        timeOut: '',
        overtime: '0',
        remarks: ''
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const [myAttendance, setMyAttendance] = useState(() => {
        const saved = localStorage.getItem('attendance_logs');
        return saved ? JSON.parse(saved) : [
            { id: 1, date: '2026-02-25', timeIn: '07:55 AM', timeOut: '05:01 PM', status: 'Present', hours: '8.1' },
            { id: 2, date: '2026-02-24', timeIn: '08:10 AM', timeOut: '05:30 PM', status: 'Late', hours: '8.3' },
            { id: 3, date: '2026-02-23', timeIn: '07:45 AM', timeOut: '06:00 PM', status: 'Present', hours: '9.25' },
        ];
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const statusBadge: Record<string, string> = {
        Present: 'badge-success',
        Late: 'badge-warning',
        Absent: 'badge-danger',
    };

    const handleTimeIn = () => {
        const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendanceForm(prev => ({ ...prev, timeIn: timeStr }));
        setPunchedIn(true);
    };

    const handleTimeOut = () => {
        const timeStr = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendanceForm(prev => ({ ...prev, timeOut: timeStr }));
        setPunchedOut(true);
    };

    const handleSubmitLog = () => {
        if (!punchedIn) {
            alert('Please record Time In first!');
            return;
        }

        const newLog = {
            id: Date.now(),
            date: currentTime.toISOString().split('T')[0],
            timeIn: attendanceForm.timeIn,
            timeOut: attendanceForm.timeOut || '--:--',
            status: 'Present',
            hours: '8.0', // Mock calculation
            remarks: attendanceForm.remarks
        };

        const updatedLogs = [newLog, ...myAttendance];
        setMyAttendance(updatedLogs);
        localStorage.setItem('attendance_logs', JSON.stringify(updatedLogs));

        // Trigger notification for TopBar and Admin
        localStorage.setItem('attendance_notification', JSON.stringify({
            id: Date.now(),
            title: 'Attendance Log Submitted',
            message: `Employee User recorded ${newLog.timeIn} - ${newLog.timeOut}`,
            time: 'Just now',
            type: 'attendance'
        }));

        alert('Attendance log submitted successfully!');
        setAttendanceForm({ timeIn: '', timeOut: '', overtime: '0', remarks: '' });
        setPunchedIn(false);
        setPunchedOut(false);
    };

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Attendance Log</h1>
                <p>Record your daily time in and time out with real-time tracking</p>
            </div>

            <div className="pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">Live Recording</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Capture actual time logs</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Current Time</p>
                                    <p className="text-2xl font-black text-emerald-600 font-mono tracking-tighter">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </p>
                                </div>
                                {!punchedIn ? (
                                    <button
                                        onClick={handleTimeIn}
                                        className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none flex items-center gap-2 px-6"
                                    >
                                        <Play className="w-4 h-4 fill-current" />
                                        Time In
                                    </button>
                                ) : !punchedOut ? (
                                    <button
                                        onClick={handleTimeOut}
                                        className="btn bg-rose-500 hover:bg-rose-600 text-white border-none flex items-center gap-2 px-6"
                                    >
                                        <Square className="w-4 h-4 fill-current" />
                                        Time Out
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                                        Day Logged
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex flex-col p-4 bg-gray-50 border border-gray-100 rounded-2xl transition-all">
                                <label className="text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Time In</label>
                                <span className={`text-xl font-black ${attendanceForm.timeIn ? 'text-emerald-700' : 'text-gray-300'}`}>
                                    {attendanceForm.timeIn || '--:-- --'}
                                </span>
                            </div>
                            <div className="flex flex-col p-4 bg-gray-50 border border-gray-100 rounded-2xl transition-all">
                                <label className="text-[10px] font-bold text-rose-500 mb-1 uppercase tracking-wider">Time Out</label>
                                <span className={`text-xl font-black ${attendanceForm.timeOut ? 'text-rose-600' : 'text-gray-300'}`}>
                                    {attendanceForm.timeOut || '--:-- --'}
                                </span>
                            </div>
                            <div className="flex flex-col p-3 bg-white border border-amber-100 rounded-2xl">
                                <label className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-wider">Overtime (Hrs)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    value={attendanceForm.overtime}
                                    onChange={(e) => setAttendanceForm({ ...attendanceForm, overtime: e.target.value })}
                                    className="text-lg font-black text-amber-600 bg-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Remarks / Comments</label>
                        <textarea
                            value={attendanceForm.remarks}
                            onChange={(e) => setAttendanceForm({ ...attendanceForm, remarks: e.target.value })}
                            className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all resize-none min-h-[120px]"
                            placeholder="Add notes for today's shift..."
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-gray-50 pt-4">
                    <button
                        onClick={handleSubmitLog}
                        disabled={!punchedIn}
                        className="btn btn-primary px-10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                        Finalize Log
                    </button>
                </div>
            </div>

            <div className="pro-card overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="p-4 border-b border-gray-50 bg-gray-100/30">
                    <h3 className="text-sm font-bold text-gray-800">Recent Logs</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                {['Date', 'Time In', 'Time Out', 'Status', 'Total Hours'].map(h => <th key={h}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {myAttendance.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.date}</td>
                                    <td className="font-mono text-xs font-bold text-emerald-600">{r.timeIn}</td>
                                    <td className="font-mono text-xs font-bold text-rose-500">{r.timeOut}</td>
                                    <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                    <td className="font-bold text-gray-700">{r.hours}h</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyAttendance;

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface AttendanceLog {
    id: number;
    date: string;
    timeIn: string;
    timeOut: string;
    status: string;
    hours: string;
    remarks: string;
    employee: string;
    empId: string;
    late: string;
    overtime: string;
}

interface AttendanceForm {
    timeIn: string;
    timeOut: string;
    overtime: string;
    remarks: string;
}

interface AttendanceContextType {
    attendanceForm: AttendanceForm;
    setAttendanceForm: React.Dispatch<React.SetStateAction<AttendanceForm>>;
    punchedIn: boolean;
    setPunchedIn: React.Dispatch<React.SetStateAction<boolean>>;
    punchedOut: boolean;
    setPunchedOut: React.Dispatch<React.SetStateAction<boolean>>;
    myAttendance: AttendanceLog[];
    setMyAttendance: React.Dispatch<React.SetStateAction<AttendanceLog[]>>;
    allRecords: AttendanceLog[];
    setAllRecords: React.Dispatch<React.SetStateAction<AttendanceLog[]>>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

// Default admin records
const defaultAdminRecords: AttendanceLog[] = [
    { id: 1, date: '2026-03-04', employee: 'Dela Cruz, Juan', empId: 'EMP-001', timeIn: '07:55 AM', timeOut: '05:01 PM', status: 'Present', late: '-', overtime: '0:01', hours: '8.0', remarks: '-' },
    { id: 2, date: '2026-03-04', employee: 'Santos, Maria', empId: 'EMP-002', timeIn: '08:15 AM', timeOut: '05:30 PM', status: 'Late', late: '15 min', overtime: '0:30', hours: '8.0', remarks: 'Traffic along EDSA' },
    { id: 3, date: '2026-03-04', employee: 'Reyes, Jose', empId: 'EMP-003', timeIn: '-', timeOut: '-', status: 'Absent', late: '-', overtime: '-', hours: '0', remarks: 'Sick leave' },
    { id: 4, date: '2026-03-04', employee: 'Garcia, Ana', empId: 'EMP-004', timeIn: '07:45 AM', timeOut: '06:00 PM', status: 'Present', late: '-', overtime: '1:00', hours: '9.0', remarks: '-' },
    { id: 5, date: '2026-03-04', employee: 'Bautista, Pedro', empId: 'EMP-005', timeIn: '08:05 AM', timeOut: '05:00 PM', status: 'Late', late: '5 min', overtime: '-', hours: '8.0', remarks: '-' },
    { id: 6, date: '2026-03-04', employee: 'Fernandez, Rosa', empId: 'EMP-006', timeIn: '07:50 AM', timeOut: '05:15 PM', status: 'Present', late: '-', overtime: '0:15', hours: '8.0', remarks: '-' },
];

// Default user logs
const defaultMyAttendance: AttendanceLog[] = [
    { id: 101, date: '2026-03-02', employee: 'Dela Cruz, Juan', empId: 'EMP-001', timeIn: '08:00 AM', timeOut: '05:00 PM', status: 'Present', late: '-', overtime: '-', hours: '8.0', remarks: 'Regular Shift' },
    { id: 102, date: '2026-03-01', employee: 'Dela Cruz, Juan', empId: 'EMP-001', timeIn: '07:45 AM', timeOut: '04:45 PM', status: 'Present', late: '-', overtime: '-', hours: '8.0', remarks: 'Early Shift' },
];

function loadFromStorage<T>(key: string, fallback: T): T {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return fallback;
}

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
    const [attendanceForm, setAttendanceForm] = useState<AttendanceForm>({ timeIn: '', timeOut: '', overtime: '0', remarks: '' });
    const [punchedIn, setPunchedIn] = useState(false);
    const [punchedOut, setPunchedOut] = useState(false);

    // User's own attendance logs (persisted)
    const [myAttendance, setMyAttendance] = useState<AttendanceLog[]>(
        () => loadFromStorage('my_attendance', defaultMyAttendance)
    );

    // All records visible to admin (persisted) — includes user-submitted logs
    const [allRecords, setAllRecords] = useState<AttendanceLog[]>(
        () => loadFromStorage('all_attendance_records', defaultAdminRecords)
    );

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('my_attendance', JSON.stringify(myAttendance));
    }, [myAttendance]);

    useEffect(() => {
        localStorage.setItem('all_attendance_records', JSON.stringify(allRecords));
    }, [allRecords]);

    return (
        <AttendanceContext.Provider value={{
            attendanceForm, setAttendanceForm,
            punchedIn, setPunchedIn,
            punchedOut, setPunchedOut,
            myAttendance, setMyAttendance,
            allRecords, setAllRecords,
        }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
    id: number;
    employee: string;
    department: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    status: LeaveStatus;
    reason: string;
}

export interface LeaveHistoryEntry {
    id: number;
    dateApplied: string;
    employee: string;
    leaveType: string;
    duration: string;
    status: LeaveStatus;
    approver: string;
}

export interface LeaveBalance {
    name: string;
    id: string;
    vacation: { total: number; used: number };
    sick: { total: number; used: number };
    emergency: { total: number; used: number };
}

export interface LeaveNotification {
    id: number;
    message: string;
    type: 'success' | 'danger' | 'info';
    timestamp: string;
    read: boolean;
}

interface LeaveContextType {
    leaveRequests: LeaveRequest[];
    leaveHistory: LeaveHistoryEntry[];
    leaveBalances: LeaveBalance[];
    notifications: LeaveNotification[];
    submitLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'department'>) => void;
    approveRequest: (id: number) => void;
    rejectRequest: (id: number) => void;
    deleteRequest: (id: number) => void;
    markNotificationRead: (id: number) => void;
    clearNotifications: () => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

// Default data
const defaultRequests: LeaveRequest[] = [
    { id: 1, employee: 'Dela Cruz, Juan', department: 'SimpleVia', leaveType: 'Vacation Leave', startDate: '2026-02-26', endDate: '2026-02-28', days: 3, status: 'Pending', reason: 'Family trip to province' },
    { id: 2, employee: 'Santos, Maria', department: 'SimpleVia', leaveType: 'Sick Leave', startDate: '2026-02-20', endDate: '2026-02-21', days: 2, status: 'Approved', reason: 'Fever and colds' },
    { id: 3, employee: 'Reyes, Jose', department: 'SimpleVia', leaveType: 'Emergency Leave', startDate: '2026-02-18', endDate: '2026-02-18', days: 1, status: 'Rejected', reason: 'Personal emergency' },
    { id: 4, employee: 'Garcia, Ana', department: 'SimpleVia', leaveType: 'Vacation Leave', startDate: '2026-03-01', endDate: '2026-03-05', days: 5, status: 'Pending', reason: 'Annual scheduled leave' },
    { id: 5, employee: 'Fernandez, Rosa', department: 'SimpleVia', leaveType: 'Sick Leave', startDate: '2026-02-24', endDate: '2026-02-25', days: 2, status: 'Approved', reason: 'Dental surgery' },
];

const defaultHistory: LeaveHistoryEntry[] = [
    { id: 1, dateApplied: '2026-02-15', employee: 'Dela Cruz, Juan', leaveType: 'Vacation Leave', duration: '3 days', status: 'Approved', approver: 'Admin User' },
    { id: 2, dateApplied: '2026-02-10', employee: 'Santos, Maria', leaveType: 'Sick Leave', duration: '2 days', status: 'Approved', approver: 'Admin User' },
    { id: 3, dateApplied: '2026-02-08', employee: 'Reyes, Jose', leaveType: 'Emergency Leave', duration: '1 day', status: 'Rejected', approver: 'Admin User' },
    { id: 4, dateApplied: '2026-01-28', employee: 'Garcia, Ana', leaveType: 'Vacation Leave', duration: '5 days', status: 'Approved', approver: 'Admin User' },
];

const defaultBalances: LeaveBalance[] = [
    { name: 'Dela Cruz, Juan', id: 'EMP-001', vacation: { total: 15, used: 5 }, sick: { total: 15, used: 3 }, emergency: { total: 5, used: 1 } },
    { name: 'Santos, Maria', id: 'EMP-002', vacation: { total: 15, used: 8 }, sick: { total: 15, used: 6 }, emergency: { total: 5, used: 0 } },
    { name: 'Reyes, Jose', id: 'EMP-003', vacation: { total: 15, used: 2 }, sick: { total: 15, used: 1 }, emergency: { total: 5, used: 2 } },
    { name: 'Garcia, Ana', id: 'EMP-004', vacation: { total: 15, used: 10 }, sick: { total: 15, used: 4 }, emergency: { total: 5, used: 0 } },
];

// Helper: load from localStorage or use default
function loadFromStorage<T>(key: string, fallback: T): T {
    try {
        const stored = localStorage.getItem(key);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore parse errors */ }
    return fallback;
}

export const LeaveProvider = ({ children }: { children: ReactNode }) => {
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(
        () => loadFromStorage('leave_requests', defaultRequests)
    );

    const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryEntry[]>(
        () => loadFromStorage('leave_history', defaultHistory)
    );

    const [leaveBalances] = useState<LeaveBalance[]>(
        () => loadFromStorage('leave_balances', defaultBalances)
    );

    const [notifications, setNotifications] = useState<LeaveNotification[]>(
        () => loadFromStorage('leave_notifications', [])
    );

    // Persist to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('leave_requests', JSON.stringify(leaveRequests));
    }, [leaveRequests]);

    useEffect(() => {
        localStorage.setItem('leave_history', JSON.stringify(leaveHistory));
    }, [leaveHistory]);

    useEffect(() => {
        localStorage.setItem('leave_notifications', JSON.stringify(notifications));
    }, [notifications]);

    // User submits a leave request → shows as Pending in both user & admin
    const submitLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'status' | 'department'>) => {
        const newRequest: LeaveRequest = {
            ...request,
            id: Date.now(),
            status: 'Pending',
            department: 'SimpleVia',
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
    };

    // Admin approves a pending request
    const approveRequest = (id: number) => {
        const request = leaveRequests.find(r => r.id === id);

        setLeaveRequests(prev => prev.map(r =>
            r.id === id ? { ...r, status: 'Approved' as LeaveStatus } : r
        ));

        if (request) {
            const historyEntry: LeaveHistoryEntry = {
                id: Date.now(),
                dateApplied: request.startDate,
                employee: request.employee,
                leaveType: request.leaveType,
                duration: `${request.days} day(s)`,
                status: 'Approved',
                approver: 'Admin User',
            };
            setLeaveHistory(prev => [historyEntry, ...prev]);

            const notification: LeaveNotification = {
                id: Date.now() + 1,
                message: `Your ${request.leaveType} request (${request.startDate} to ${request.endDate}) has been Approved by Admin.`,
                type: 'success',
                timestamp: new Date().toLocaleString(),
                read: false,
            };
            setNotifications(prev => [notification, ...prev]);
        }
    };

    // Admin rejects a pending request
    const rejectRequest = (id: number) => {
        const request = leaveRequests.find(r => r.id === id);

        setLeaveRequests(prev => prev.map(r =>
            r.id === id ? { ...r, status: 'Rejected' as LeaveStatus } : r
        ));

        if (request) {
            const historyEntry: LeaveHistoryEntry = {
                id: Date.now(),
                dateApplied: request.startDate,
                employee: request.employee,
                leaveType: request.leaveType,
                duration: `${request.days} day(s)`,
                status: 'Rejected',
                approver: 'Admin User',
            };
            setLeaveHistory(prev => [historyEntry, ...prev]);

            const notification: LeaveNotification = {
                id: Date.now() + 1,
                message: `Your ${request.leaveType} request (${request.startDate} to ${request.endDate}) has been Denied by Admin.`,
                type: 'danger',
                timestamp: new Date().toLocaleString(),
                read: false,
            };
            setNotifications(prev => [notification, ...prev]);
        }
    };

    // Admin deletes a request
    const deleteRequest = (id: number) => {
        setLeaveRequests(prev => prev.filter(r => r.id !== id));
    };

    // Notification helpers
    const markNotificationRead = (id: number) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const clearNotifications = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <LeaveContext.Provider value={{
            leaveRequests,
            leaveHistory,
            leaveBalances,
            notifications,
            submitLeaveRequest,
            approveRequest,
            rejectRequest,
            deleteRequest,
            markNotificationRead,
            clearNotifications,
        }}>
            {children}
        </LeaveContext.Provider>
    );
};

export const useLeave = () => {
    const ctx = useContext(LeaveContext);
    if (!ctx) throw new Error('useLeave must be used within LeaveProvider');
    return ctx;
};

import { createContext } from "react";

export type LeaveStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";

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
    type: "success" | "danger" | "info";
    timestamp: string;
    read: boolean;
}

export interface LeaveContextType {
    leaveRequests: LeaveRequest[];
    leaveHistory: LeaveHistoryEntry[];
    leaveBalances: LeaveBalance[];
    notifications: LeaveNotification[];
    submitLeaveRequest: (request: Omit<LeaveRequest, "id" | "status" | "department">) => void;
    approveRequest: (id: number) => void;
    rejectRequest: (id: number) => void;
    deleteRequest: (id: number) => void;
    markNotificationRead: (id: number) => void;
    clearNotifications: () => void;
}

export const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
    approveLeaveRequest,
    cancelLeaveRequest,
    createLeaveRequest,
    getAdminLeaveBalances,
    getAdminLeaveRequests,
    getMyLeaveBalances,
    getMyLeaveHistory,
    getMyLeaveRequests,
    rejectLeaveRequest,
    type LeaveBalanceDto,
    type LeaveBalanceTransactionDto,
    type LeaveRequestDto,
    type LeaveType,
} from "../lib/leave";

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

interface LeaveContextType {
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

type EmployeeScopedLeaveBalanceDto = LeaveBalanceDto & {
    employeeId?: string;
    employeeName?: string;
};

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

const emptyBalance: LeaveBalance = {
    name: "",
    id: "",
    vacation: { total: 0, used: 0 },
    sick: { total: 0, used: 0 },
    emergency: { total: 0, used: 0 },
};

function toUiLeaveType(leaveType: string): string {
    if (leaveType === "Vacation") return "Vacation Leave";
    if (leaveType === "Sick") return "Sick Leave";
    if (leaveType === "Emergency") return "Emergency Leave";
    return leaveType;
}

function toApiLeaveType(leaveType: string): LeaveType {
    if (leaveType === "Vacation Leave") return "Vacation";
    if (leaveType === "Sick Leave") return "Sick";
    if (leaveType === "Emergency Leave") return "Emergency";

    if (leaveType === "Vacation" || leaveType === "Sick" || leaveType === "Emergency") {
        return leaveType;
    }

    return "Vacation";
}

function toUiStatus(status: string): LeaveStatus {
    if (status === "Approved") return "Approved";
    if (status === "Rejected") return "Rejected";
    if (status === "Cancelled") return "Cancelled";
    return "Pending";
}

function formatDate(value: string): string {
    if (!value) return "";
    return value.slice(0, 10);
}

function formatDuration(days: number): string {
    return `${days} ${days === 1 ? "day" : "days"}`;
}

function buildEmptyEmployeeBalance(name: string, id: string): LeaveBalance {
    return {
        ...emptyBalance,
        name,
        id,
        vacation: { total: 0, used: 0 },
        sick: { total: 0, used: 0 },
        emergency: { total: 0, used: 0 },
    };
}

function applyBalanceDto(target: LeaveBalance, dto: LeaveBalanceDto): LeaveBalance {
    const next = {
        ...target,
        vacation: { ...target.vacation },
        sick: { ...target.sick },
        emergency: { ...target.emergency },
    };

    if (dto.leaveType === "Vacation") {
        next.vacation = {
            total: dto.totalCredits,
            used: dto.usedCredits,
        };
    }

    if (dto.leaveType === "Sick") {
        next.sick = {
            total: dto.totalCredits,
            used: dto.usedCredits,
        };
    }

    if (dto.leaveType === "Emergency") {
        next.emergency = {
            total: dto.totalCredits,
            used: dto.usedCredits,
        };
    }

    return next;
}

function mapRequestDto(dto: LeaveRequestDto): LeaveRequest {
    return {
        id: dto.id,
        employee: dto.employeeName || "Unknown Employee",
        department: "SimpleVia",
        leaveType: toUiLeaveType(dto.leaveType),
        startDate: formatDate(dto.startDate),
        endDate: formatDate(dto.endDate),
        days: dto.daysRequested,
        status: toUiStatus(dto.status),
        reason: dto.reason ?? "",
    };
}

function mapHistoryFromRequest(dto: LeaveRequestDto): LeaveHistoryEntry {
    return {
        id: dto.id,
        dateApplied: formatDate(dto.createdAtUtc),
        employee: dto.employeeName || "Unknown Employee",
        leaveType: toUiLeaveType(dto.leaveType),
        duration: formatDuration(dto.daysRequested),
        status: toUiStatus(dto.status),
        approver: dto.reviewedByName || "Admin User",
    };
}

function mapHistoryFromTransaction(dto: LeaveBalanceTransactionDto): LeaveHistoryEntry {
    return {
        id: -dto.id,
        dateApplied: formatDate(dto.createdAtUtc),
        employee: "Current User",
        leaveType: toUiLeaveType(dto.leaveType),
        duration: formatDuration(dto.days),
        status: "Approved",
        approver: dto.createdByName || "Admin User",
    };
}

function mapMyBalances(name: string, balances: LeaveBalanceDto[]): LeaveBalance[] {
    const current = balances.reduce(
        (acc, balance) => applyBalanceDto(acc, balance),
        buildEmptyEmployeeBalance(name, "Current User")
    );

    return [current];
}

function mapAdminBalances(requests: LeaveRequestDto[], balances: LeaveBalanceDto[]): LeaveBalance[] {
    const employeeNames = new Map<string, string>();

    requests.forEach((request) => {
        if (request.employeeId) {
            employeeNames.set(request.employeeId, request.employeeName || "Unknown Employee");
        }
    });

    const grouped = new Map<string, LeaveBalance>();

    balances.forEach((balance) => {
        const scopedBalance = balance as EmployeeScopedLeaveBalanceDto;
        const employeeId =
            scopedBalance.employeeId ||
            (employeeNames.size === 1 ? Array.from(employeeNames.keys())[0] : "LeaveBalances");

        const employeeName =
            scopedBalance.employeeName ||
            employeeNames.get(employeeId) ||
            (employeeId === "LeaveBalances" ? "Leave Balances" : "Unknown Employee");

        const current =
            grouped.get(employeeId) ?? buildEmptyEmployeeBalance(employeeName, employeeId);

        grouped.set(employeeId, applyBalanceDto(current, balance));
    });

    if (grouped.size > 0) {
        return Array.from(grouped.values());
    }

    return Array.from(employeeNames.entries()).map(([employeeId, employeeName]) =>
        buildEmptyEmployeeBalance(employeeName, employeeId)
    );
}

function getNotificationStorageKey(userKey: string): string {
    return `leave_notifications:${userKey}`;
}

function loadNotifications(userKey: string): LeaveNotification[] {
    try {
        const stored = localStorage.getItem(getNotificationStorageKey(userKey));
        if (!stored) return [];

        return JSON.parse(stored) as LeaveNotification[];
    } catch {
        return [];
    }
}

export const LeaveProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();

    const notificationUserKey = useMemo(() => {
        if (!user) return "anonymous";
        return `${user.role}:${user.fullName || "user"}`;
    }, [user]);

    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryEntry[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [notifications, setNotifications] = useState<LeaveNotification[]>(() =>
        loadNotifications(notificationUserKey)
    );

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const refreshLeaveData = useCallback(async () => {
        if (!user) {
            setLeaveRequests([]);
            setLeaveHistory([]);
            setLeaveBalances([]);
            return;
        }

        try {
            if (isAdmin) {
                const [adminRequestsResult, adminBalancesResult] = await Promise.allSettled([
                    getAdminLeaveRequests(),
                    getAdminLeaveBalances(),
                ]);

                const adminRequests =
                    adminRequestsResult.status === "fulfilled" ? adminRequestsResult.value : [];

                const adminBalances =
                    adminBalancesResult.status === "fulfilled" ? adminBalancesResult.value : [];

                setLeaveRequests(adminRequests.map(mapRequestDto));

                setLeaveHistory(
                    adminRequests
                        .filter(
                            (request) =>
                                request.status === "Approved" ||
                                request.status === "Rejected" ||
                                request.status === "Cancelled"
                        )
                        .map(mapHistoryFromRequest)
                );

                setLeaveBalances(mapAdminBalances(adminRequests, adminBalances));
                return;
            }

            const [myBalancesResult, myRequestsResult, myHistoryResult] = await Promise.allSettled([
                getMyLeaveBalances(),
                getMyLeaveRequests(),
                getMyLeaveHistory(),
            ]);

            const myRequests =
                myRequestsResult.status === "fulfilled" ? myRequestsResult.value : [];

            const myBalances =
                myBalancesResult.status === "fulfilled" ? myBalancesResult.value : [];

            const myHistory =
                myHistoryResult.status === "fulfilled" ? myHistoryResult.value : [];

            setLeaveRequests(myRequests.map(mapRequestDto));

            const finalizedRequests = myRequests.filter(
                (request) =>
                    request.status === "Approved" ||
                    request.status === "Rejected" ||
                    request.status === "Cancelled"
            );

            const requestHistory = finalizedRequests.map(mapHistoryFromRequest);
            const transactionHistory = myHistory.map(mapHistoryFromTransaction);
            const combinedHistory = [...requestHistory, ...transactionHistory].sort((a, b) =>
                b.dateApplied.localeCompare(a.dateApplied)
            );

            setLeaveHistory(combinedHistory);

            setLeaveBalances(mapMyBalances(user.fullName || "Current User", myBalances));
        } catch (error) {
            console.error("Failed to load leave management data", error);
        }
    }, [isAdmin, user]);

    useEffect(() => {
        void refreshLeaveData();
    }, [refreshLeaveData]);

    useEffect(() => {
        setNotifications(loadNotifications(notificationUserKey));
    }, [notificationUserKey]);

    useEffect(() => {
        if (!user) {
            localStorage.removeItem(getNotificationStorageKey(notificationUserKey));
            setNotifications([]);
            return;
        }

        localStorage.setItem(
            getNotificationStorageKey(notificationUserKey),
            JSON.stringify(notifications)
        );
    }, [notificationUserKey, notifications, user]);

    const submitLeaveRequest = (request: Omit<LeaveRequest, "id" | "status" | "department">) => {
        void (async () => {
            try {
                await createLeaveRequest({
                    leaveType: toApiLeaveType(request.leaveType),
                    startDate: request.startDate,
                    endDate: request.endDate,
                    reason: request.reason,
                });

                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message: `Your ${request.leaveType} request has been submitted.`,
                        type: "success",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);

                await refreshLeaveData();
            } catch (error) {
                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to submit leave request.",
                        type: "danger",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);
            }
        })();
    };

    const approveRequest = (id: number) => {
        void (async () => {
            try {
                await approveLeaveRequest(id, {});

                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message: "Leave request approved.",
                        type: "success",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);

                await refreshLeaveData();
            } catch (error) {
                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to approve leave request.",
                        type: "danger",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);
            }
        })();
    };

    const rejectRequest = (id: number) => {
        void (async () => {
            try {
                await rejectLeaveRequest(id, {});

                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message: "Leave request rejected.",
                        type: "danger",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);

                await refreshLeaveData();
            } catch (error) {
                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to reject leave request.",
                        type: "danger",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);
            }
        })();
    };

    const deleteRequest = (id: number) => {
        void (async () => {
            try {
                await cancelLeaveRequest(id);
                await refreshLeaveData();
            } catch (error) {
                setNotifications((prev) => [
                    {
                        id: Date.now(),
                        message:
                            error instanceof Error
                                ? error.message
                                : "Failed to cancel leave request.",
                        type: "danger",
                        timestamp: new Date().toLocaleString(),
                        read: false,
                    },
                    ...prev,
                ]);

                await refreshLeaveData();
            }
        })();
    };

    const markNotificationRead = (id: number) => {
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
    };

    const clearNotifications = () => {
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, read: true }))
        );
    };

    return (
        <LeaveContext.Provider
            value={{
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
            }}
        >
            {children}
        </LeaveContext.Provider>
    );
};

export const useLeave = () => {
    const ctx = useContext(LeaveContext);
    if (!ctx) throw new Error("useLeave must be used within LeaveProvider");
    return ctx;
};
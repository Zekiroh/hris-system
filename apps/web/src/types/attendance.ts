export type AttendanceStatus =
    | 'Present'
    | 'Late'
    | 'Absent'
    | 'Incomplete'
    | 'OnLeave';

export type AttendanceTab = 'dtr' | 'ot' | 'setup';

export type OvertimeRequestStatus =
    | 'Pending'
    | 'Approved'
    | 'Rejected'
    | 'Cancelled';

export type AttendanceOvertimeStatus = 'Approved' | 'Pending' | 'None';

export type ShiftStatus = 'Active' | 'Inactive';

export type AttendanceRecord = {
    id: string | number;
    empId: string;
    name: string;
    date: string;
    timeIn: string;
    timeOut: string;
    status: 'Present' | 'Late' | 'Absent';
    isOT: boolean;
    overtimeStatus?: AttendanceOvertimeStatus;
    remarks: string;
    lateMinutes: number;
    undertimeMinutes: number;
    overtimeMinutes: number;
    renderedMinutes: number;
};

export type DtrFilters = {
    dateFrom: string;
    dateTo: string;
    search: string;
    status: '' | 'Present' | 'Late' | 'Absent' | 'Undertime' | 'Overtime';
};

export type AdminDtrRecord = {
    id: number;
    empId: string;
    name: string;
    suffix?: string;
    date: string;
    timeIn: string;
    timeOut: string;
    status: string;
    isOT: boolean;
    isUndertime: boolean;
    overtimeStatus: AttendanceOvertimeStatus;
    task: string;
    accomplished: string;
    lateMinutes: number;
    undertimeMinutes: number;
    overtimeMinutes: number;
    renderedMinutes: number;
};

export type OvertimeRequestRow = {
    id: number;
    date: string;
    employee: string;
    duration: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
};

export type ShiftRecord = {
    id: number;
    name: string;
    timeIn: string;
    timeOut: string;
    grace: string;
    employees: number;
    assignedCount: number;
    status: ShiftStatus;
};

export type ShiftFormState = {
    name: string;
    timeIn: string;
    timeOut: string;
    grace: string;
    status: ShiftStatus;
};

export type StatusBadgeMap = Record<string, string>;

export type AdminAttendanceTab = AttendanceTab;
export type AdminOvertimeRequestRow = OvertimeRequestRow;
export type AdminShiftRecord = ShiftRecord;

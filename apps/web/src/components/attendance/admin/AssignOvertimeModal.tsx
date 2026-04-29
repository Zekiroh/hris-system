import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
    X,
    XCircle,
} from 'lucide-react';
import { createPortal } from 'react-dom';

export type AssignOvertimeEmployeeOption = {
    id: string;
    employeeNumber?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    suffix?: string | null;
};

export type AssignOvertimeAttendanceOption = {
    employeeNumber: string;
    date: string;
    timeIn?: string | null;
    timeOut?: string | null;
    status?: string | null;
};

type AssignOtFormState = {
    employeeId: string;
    dateFrom: string;
    dateTo: string;
    requestedMinutes: string;
    reason: string;
};

type PreviewDayStatus =
    | 'valid'
    | 'in-progress'
    | 'no-attendance'
    | 'non-working'
    | 'no-capacity'
    | 'invalid-range';

type PreviewDay = {
    key: string;
    apiDate: string;
    displayDate: string;
    dayName: string;
    timeOut: string;
    maxMinutes: number;
    status: PreviewDayStatus;
    message: string;
};

type Props = {
    isOpen: boolean;
    form: AssignOtFormState;
    employees: AssignOvertimeEmployeeOption[];
    loadingEmployees: boolean;
    attendanceRecords: AssignOvertimeAttendanceOption[];
    submitting: boolean;
    errorMessage?: string | null;
    onChange: (value: AssignOtFormState) => void;
    onClose: () => void;
    onSubmit: () => void;
};

const MAX_ADMIN_OT_MINUTES_PER_DAY = 180;
const OT_CUTOFF_MINUTES = 20 * 60 + 30;
const MAX_PREVIEW_DAYS = 31;
const MIN_PREVIEW_ROWS = 5;

const OVERTIME_HOUR_OPTIONS = [
    { label: '0.5 hour', minutes: 30 },
    { label: '1 hour', minutes: 60 },
    { label: '1.5 hours', minutes: 90 },
    { label: '2 hours', minutes: 120 },
    { label: '2.5 hours', minutes: 150 },
    { label: '3 hours', minutes: 180 },
];

const formatMinutes = (value: number | string) => {
    const minutes = Number(value);

    if (!Number.isFinite(minutes) || minutes <= 0) return '--';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    if (remainingMinutes === 0) return `${hours}h`;

    return `${hours}h ${remainingMinutes}m`;
};

const formatEmployeeName = (employee: AssignOvertimeEmployeeOption) => {
    const lastName = employee.lastName?.trim() || '';
    const firstName = employee.firstName?.trim() || '';
    const middleInitial = employee.middleName?.trim()
        ? ` ${employee.middleName.trim().charAt(0).toUpperCase()}.`
        : '';
    const suffix = employee.suffix?.trim() ? ` ${employee.suffix.trim()}` : '';

    const name =
        lastName || firstName
            ? `${lastName}${lastName && firstName ? ', ' : ''}${firstName}${middleInitial}${suffix}`
            : 'Unnamed Employee';

    return employee.employeeNumber ? `${name} (${employee.employeeNumber})` : name;
};

const parseApiDate = (value: string) => {
    if (!value) return null;

    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const toApiDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const toDisplayDate = (date: Date) =>
    date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

const getDayName = (date: Date) =>
    date.toLocaleDateString('en-US', {
        weekday: 'short',
    });

const parseTimeToMinutes = (value?: string | null) => {
    if (!value || value === '--') return null;

    const trimmed = value.trim();

    const twelveHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
    if (twelveHourMatch) {
        let hour = Number(twelveHourMatch[1]);
        const minute = Number(twelveHourMatch[2]);
        const modifier = twelveHourMatch[3].toUpperCase();

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

        if (modifier === 'AM' && hour === 12) hour = 0;
        if (modifier === 'PM' && hour !== 12) hour += 12;

        return hour * 60 + minute;
    }

    const timeOnlyMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (timeOnlyMatch) {
        const hour = Number(timeOnlyMatch[1]);
        const minute = Number(timeOnlyMatch[2]);

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

        return hour * 60 + minute;
    }

    return null;
};

const getDateRange = (dateFrom: string, dateTo: string) => {
    const start = parseApiDate(dateFrom);
    const end = parseApiDate(dateTo);

    if (!start || !end || start > end) return [];

    const dates: Date[] = [];
    const cursor = new Date(start);

    while (cursor <= end && dates.length < MAX_PREVIEW_DAYS) {
        dates.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    return dates;
};

const buildPreviewDays = ({
    form,
    employees,
    attendanceRecords,
}: {
    form: AssignOtFormState;
    employees: AssignOvertimeEmployeeOption[];
    attendanceRecords: AssignOvertimeAttendanceOption[];
}): PreviewDay[] => {
    const selectedEmployee = employees.find((employee) => employee.id === form.employeeId);
    const selectedEmployeeNumber = selectedEmployee?.employeeNumber?.trim();
    const range = getDateRange(form.dateFrom, form.dateTo);

    if (!form.dateFrom || !form.dateTo) return [];

    if (range.length === 0) {
        return [
            {
                key: 'invalid-range',
                apiDate: '',
                displayDate: '--',
                dayName: '--',
                timeOut: '--',
                maxMinutes: 0,
                status: 'invalid-range',
                message: 'Invalid date range',
            },
        ];
    }

    if (!selectedEmployeeNumber) {
        return range.map((date) => ({
            key: toApiDate(date),
            apiDate: toApiDate(date),
            displayDate: toDisplayDate(date),
            dayName: getDayName(date),
            timeOut: '--',
            maxMinutes: 0,
            status: 'invalid-range',
            message: 'Select an employee first',
        }));
    }

    return range.map((date) => {
        const apiDate = toApiDate(date);
        const day = date.getDay();
        const isWorkingDay = day >= 1 && day <= 5;

        if (!isWorkingDay) {
            return {
                key: apiDate,
                apiDate,
                displayDate: toDisplayDate(date),
                dayName: getDayName(date),
                timeOut: '--',
                maxMinutes: 0,
                status: 'non-working',
                message: 'Non-working day',
            };
        }

        const attendance = attendanceRecords.find(
            (record) => record.employeeNumber === selectedEmployeeNumber && record.date === apiDate
        );

        if (!attendance) {
            return {
                key: apiDate,
                apiDate,
                displayDate: toDisplayDate(date),
                dayName: getDayName(date),
                timeOut: '--',
                maxMinutes: MAX_ADMIN_OT_MINUTES_PER_DAY,
                status: 'no-attendance',
                message: 'Approved (awaiting attendance)',
            };
        }

        if (!attendance.timeOut) {
            return {
                key: apiDate,
                apiDate,
                displayDate: toDisplayDate(date),
                dayName: getDayName(date),
                timeOut: '--',
                maxMinutes: MAX_ADMIN_OT_MINUTES_PER_DAY,
                status: 'in-progress',
                message: 'In progress, time out pending',
            };
        }

        const timeOutMinutes = parseTimeToMinutes(attendance.timeOut);

        if (timeOutMinutes === null) {
            return {
                key: apiDate,
                apiDate,
                displayDate: toDisplayDate(date),
                dayName: getDayName(date),
                timeOut: attendance.timeOut || '--',
                maxMinutes: MAX_ADMIN_OT_MINUTES_PER_DAY,
                status: 'in-progress',
                message: 'In progress, time out pending',
            };
        }

        const availableMinutes = Math.max(
            0,
            Math.min(MAX_ADMIN_OT_MINUTES_PER_DAY, OT_CUTOFF_MINUTES - timeOutMinutes)
        );

        if (availableMinutes <= 0) {
            return {
                key: apiDate,
                apiDate,
                displayDate: toDisplayDate(date),
                dayName: getDayName(date),
                timeOut: attendance.timeOut || '--',
                maxMinutes: 0,
                status: 'no-capacity',
                message: 'No remaining OT capacity',
            };
        }

        return {
            key: apiDate,
            apiDate,
            displayDate: toDisplayDate(date),
            dayName: getDayName(date),
            timeOut: attendance.timeOut || '--',
            maxMinutes: availableMinutes,
            status: 'valid',
            message: `Eligible (${formatMinutes(availableMinutes)} max)`,
        };
    });
};

const getPreviewBadgeClass = (status: PreviewDayStatus) => {
    if (status === 'valid') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'in-progress') return 'border-blue-200 bg-blue-50 text-blue-700';
    if (status === 'no-attendance') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (status === 'non-working') return 'border-slate-200 bg-slate-50 text-slate-500';
    if (status === 'no-capacity') return 'border-orange-200 bg-orange-50 text-orange-700';
    return 'border-red-200 bg-red-50 text-red-700';
};

const getPreviewIcon = (status: PreviewDayStatus) => {
    if (status === 'valid') return <CheckCircle2 className="h-3.5 w-3.5" />;
    if (status === 'in-progress') return <Clock className="h-3.5 w-3.5" />;
    if (status === 'no-attendance') return <AlertCircle className="h-3.5 w-3.5" />;
    if (status === 'non-working') return <CalendarDays className="h-3.5 w-3.5" />;
    if (status === 'no-capacity') return <Clock className="h-3.5 w-3.5" />;
    return <XCircle className="h-3.5 w-3.5" />;
};

const formatErrorMessage = (message?: string | null) => {
    if (!message) return null;

    const normalizedMessage = message.trim();

    if (/overtime already (assigned|requested|exists)/i.test(normalizedMessage)) {
        return 'Overtime already exists for the selected date.';
    }

    return normalizedMessage;
};

const AssignOvertimeModal = ({
    isOpen,
    form,
    employees,
    loadingEmployees,
    attendanceRecords,
    submitting,
    errorMessage,
    onChange,
    onClose,
    onSubmit,
}: Props) => {
    if (!isOpen) return null;

    const requestedMinutes = Number(form.requestedMinutes || 0);
    const previewDays = buildPreviewDays({ form, employees, attendanceRecords });
    const formattedErrorMessage = formatErrorMessage(errorMessage);

    const previewPlaceholderRows = Array.from({
        length: Math.max(0, MIN_PREVIEW_ROWS - previewDays.length),
    });

    const validDays = previewDays.filter((day) => day.status === 'valid');
    const inProgressDays = previewDays.filter((day) => day.status === 'in-progress');
    const noAttendanceDays = previewDays.filter((day) => day.status === 'no-attendance');
    const hardBlockedDays = previewDays.filter(
        (day) =>
            day.status === 'non-working' ||
            day.status === 'no-capacity' ||
            day.status === 'invalid-range'
    );

    const assignableDays = [...validDays, ...inProgressDays, ...noAttendanceDays];

    const requestedMinutesExceedsDay = validDays.some(
        (day) => Number.isFinite(requestedMinutes) && requestedMinutes > day.maxMinutes
    );

    const hasCompleteRange = !!form.employeeId && !!form.dateFrom && !!form.dateTo;

    const hasRequestedMinutesError =
        !Number.isFinite(requestedMinutes) ||
        requestedMinutes < 1 ||
        requestedMinutes > MAX_ADMIN_OT_MINUTES_PER_DAY;

    const totalRequestedMinutes =
        Number.isFinite(requestedMinutes) && requestedMinutes > 0
            ? requestedMinutes * assignableDays.length
            : 0;

    const helperMessage = (() => {
        if (!hasCompleteRange) return 'Select an employee and date range to preview overtime days.';
        if (previewDays.some((day) => day.status === 'invalid-range')) return 'Fix the selected date range first.';
        if (hardBlockedDays.length > 0) return 'This range contains non-working days or invalid overtime conditions.';
        if (requestedMinutesExceedsDay) return 'Selected overtime hours exceed the available OT capacity for one or more days.';
        if (validDays.length > 0 && (inProgressDays.length > 0 || noAttendanceDays.length > 0)) {
            return 'Some days are complete while others will be linked once attendance is completed.';
        }
        if (inProgressDays.length > 0) return 'Overtime will be finalized after employee time out.';
        if (noAttendanceDays.length > 0) {
            return 'Admin-assigned overtime is approved immediately. Final overtime is based on attendance.';
        }
        if (validDays.length > 0) return 'All selected days are eligible based on current attendance records.';
        return 'No assignable overtime days found.';
    })();

    const isSubmitDisabled =
        submitting ||
        loadingEmployees ||
        !form.employeeId.trim() ||
        !form.dateFrom ||
        !form.dateTo ||
        !form.requestedMinutes ||
        hasRequestedMinutesError ||
        requestedMinutesExceedsDay ||
        hardBlockedDays.length > 0 ||
        assignableDays.length === 0 ||
        !form.reason.trim();

    return createPortal(
        <div
            className="fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-[rgba(15,23,42,0.5)] p-4 backdrop-blur-[4px]"
            onClick={submitting ? undefined : onClose}
        >
            <div
                className="flex max-h-[92vh] w-full max-w-4xl animate-fade-in-up flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Assign Overtime</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            Admin-assigned overtime is approved immediately. Attendance determines final overtime rendering.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid flex-1 overflow-y-auto lg:grid-cols-[380px_1fr]">
                    <div className="space-y-4 border-b border-slate-200 px-6 py-5 lg:border-b-0 lg:border-r">
                        <div>
                            <label className="pro-label">Employee</label>
                            <select
                                value={form.employeeId}
                                onChange={(event) => onChange({ ...form, employeeId: event.target.value })}
                                className="pro-input"
                                disabled={submitting || loadingEmployees}
                            >
                                <option value="">
                                    {loadingEmployees ? 'Loading employees...' : 'Select employee'}
                                </option>
                                {employees.map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                        {formatEmployeeName(employee)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="pro-label">Date From</label>
                                <input
                                    type="date"
                                    value={form.dateFrom}
                                    onChange={(event) => onChange({ ...form, dateFrom: event.target.value })}
                                    className="pro-input"
                                    disabled={submitting}
                                />
                            </div>

                            <div>
                                <label className="pro-label">Date To</label>
                                <input
                                    type="date"
                                    value={form.dateTo}
                                    onChange={(event) => onChange({ ...form, dateTo: event.target.value })}
                                    className="pro-input"
                                    disabled={submitting}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="pro-label">Overtime Hours Per Day</label>
                            <select
                                value={form.requestedMinutes}
                                onChange={(event) => onChange({ ...form, requestedMinutes: event.target.value })}
                                className="pro-input"
                                disabled={submitting}
                            >
                                <option value="">Select hours</option>
                                {OVERTIME_HOUR_OPTIONS.map((option) => (
                                    <option key={option.minutes} value={String(option.minutes)}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-2 text-xs font-medium text-slate-500">
                                Max 3 hours per day. Final overtime depends on attendance.
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-center">
                                <p className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                                    Valid
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-800">{validDays.length}</p>
                            </div>

                            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-center">
                                <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                                    Pending
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-800">{inProgressDays.length}</p>
                            </div>

                            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-center">
                                <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                                    No DTR
                                </p>
                                <p className="mt-1 text-xl font-black text-slate-800">{noAttendanceDays.length}</p>
                            </div>

                            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-center">
                                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600">
                                    Total
                                </p>
                                <p className="mt-1 text-xl font-black text-blue-600">
                                    {formatMinutes(totalRequestedMinutes)}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="pro-label">Reason</label>
                            <textarea
                                value={form.reason}
                                onChange={(event) => onChange({ ...form, reason: event.target.value })}
                                className="pro-input min-h-[120px] resize-none"
                                placeholder="Enter overtime reason"
                                disabled={submitting}
                            />
                        </div>

                        <div
                            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                                hardBlockedDays.length > 0 || requestedMinutesExceedsDay || hasRequestedMinutesError
                                    ? 'border-amber-200 bg-amber-50 text-amber-700'
                                    : 'border-blue-200 bg-blue-50 text-blue-700'
                            }`}
                        >
                            <div className="flex gap-2">
                                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{helperMessage}</p>
                            </div>
                        </div>

                        {formattedErrorMessage && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                                {formattedErrorMessage}
                            </div>
                        )}
                    </div>

                    <div className="px-6 py-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h4 className="text-sm font-black uppercase tracking-wider text-slate-700">
                                    Overtime Day Preview
                                </h4>
                                <p className="mt-1 text-xs font-medium text-slate-500">
                                    Review attendance state, timeout status, and available OT capacity before assigning.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.3fr] bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                <div>Date</div>
                                <div>Time Out</div>
                                <div>Max OT</div>
                                <div>Status</div>
                            </div>

                            <div className="max-h-[390px] overflow-y-auto">
                                {previewDays.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-sm font-medium text-slate-500">
                                        Select an employee and date range to show preview.
                                    </div>
                                ) : (
                                    <>
                                        {previewDays.map((day) => (
                                            <div
                                                key={day.key}
                                                className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.3fr] items-center border-t border-slate-100 px-4 py-3 text-sm"
                                            >
                                                <div>
                                                    <p className="font-bold text-slate-700">{day.displayDate}</p>
                                                    <p className="text-xs font-medium text-slate-400">{day.dayName}</p>
                                                </div>

                                                <div className="font-mono text-xs font-bold text-slate-600">
                                                    {day.timeOut}
                                                </div>

                                                <div className="font-bold text-slate-700">
                                                    {formatMinutes(day.maxMinutes)}
                                                </div>

                                                <div>
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${getPreviewBadgeClass(
                                                            day.status
                                                        )}`}
                                                    >
                                                        {getPreviewIcon(day.status)}
                                                        {day.message}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {previewPlaceholderRows.map((_, index) => (
                                            <div
                                                key={`preview-placeholder-${index}`}
                                                className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1.3fr] items-center border-t border-slate-100 px-4 py-3 text-sm text-slate-300"
                                            >
                                                <div>
                                                    <p className="font-bold">--</p>
                                                    <p className="text-xs font-medium">--</p>
                                                </div>
                                                <div className="font-mono text-xs font-bold">--</div>
                                                <div className="font-bold">--</div>
                                                <div className="font-bold">--</div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary"
                        disabled={submitting}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onSubmit}
                        className="btn btn-primary"
                        disabled={isSubmitDisabled}
                    >
                        {submitting ? 'Assigning...' : 'Assign Overtime'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default AssignOvertimeModal;
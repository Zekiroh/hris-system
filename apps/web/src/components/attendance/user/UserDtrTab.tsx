import { Clock, Info, Play, Square } from 'lucide-react';
import type { StatusBadgeMap } from '../../../types/attendance';
import UserDtrTable from '../../../components/attendance/user/UserDtrTable';

interface AttendanceRow {
    id: number;
    date: string;
    timeIn: string;
    timeOut: string;
    status: string;
    isOT: boolean;
    isUndertime: boolean;
    hours: string;
    renderedMinutes: number;
    lateMinutes: number;
    undertimeMinutes: number;
    overtimeMinutes: number;
    task: string;
    accomplished: string;
}

interface UserDtrTabProps {
    frozenTimeOut: Date | null;
    displayTime: Date;
    punchedIn: boolean;
    punchedOut: boolean;
    submittingDtr: boolean;
    loadingDtr: boolean;
    setIsTimeInModalOpen: (value: boolean) => void;
    setIsTimeOutModalOpen: (value: boolean) => void;
    attendanceForm: {
        timeIn: string;
        timeOut: string;
        overtime: string;
    };
    myAttendance: AttendanceRow[];
    statusBadge: StatusBadgeMap;
    page: number;
    totalPages: number;
    onPrev: () => void;
    onNext: () => void;
    onView: (row: AttendanceRow) => void;
    onEdit: (row: AttendanceRow) => void;
    recentlyEditedRowId: number | null;
    trackerTone: 'green' | 'blue';
    isBeforeStart: boolean;
    isBreakTime: boolean;
    isAfterRegularHours: boolean;
    isWorkingDay: boolean;
    canTimeInToday: boolean;
    todayBlockReason: string | null;
    isHoliday: boolean;
    holidayName: string | null;
}

const UserDtrTab = ({
    frozenTimeOut,
    displayTime,
    punchedIn,
    punchedOut,
    submittingDtr,
    loadingDtr,
    setIsTimeInModalOpen,
    setIsTimeOutModalOpen,
    attendanceForm,
    myAttendance,
    statusBadge,
    page,
    totalPages,
    onPrev,
    onNext,
    onView,
    onEdit,
    recentlyEditedRowId,
    trackerTone,
    isBeforeStart,
    isBreakTime,
    canTimeInToday,
    todayBlockReason,
    isHoliday,
    holidayName,
}: UserDtrTabProps) => {
    const isCompleted = punchedIn && punchedOut;
    const isTracking = punchedIn && !punchedOut;
    const isIdle = !punchedIn && !punchedOut;

    const isPreStartBlocked = isIdle && isBeforeStart;
    const isBreakBlocked = isIdle && !isHoliday && !isBeforeStart && isBreakTime;

    const isRuleBlocked =
        isHoliday ||
        (isIdle &&
            !isBeforeStart &&
            !isBreakTime &&
            !canTimeInToday);

    const isBlocked = isPreStartBlocked || isBreakBlocked || isRuleBlocked;

    const showOvertimeNotice = isTracking && trackerTone === 'blue';
    const showBlockedNotice = isRuleBlocked && !!(isHoliday || todayBlockReason);
    const showPreStartNotice = isPreStartBlocked;
    const showBreakNotice = isBreakBlocked;
    const showCompletedNotice = isCompleted;

    const currentTimeLabelClass = isPreStartBlocked || isBreakBlocked
        ? 'text-blue-500'
        : isHoliday
          ? 'text-violet-500'
          : isRuleBlocked
            ? 'text-gray-400'
            : trackerTone === 'blue'
              ? 'text-blue-500'
              : isCompleted || frozenTimeOut
                ? 'text-gray-400'
                : 'text-emerald-500';

    const currentTimeValueClass = isPreStartBlocked || isBreakBlocked
        ? 'text-blue-600'
        : isHoliday
          ? 'text-violet-500'
          : isRuleBlocked
            ? 'text-gray-300'
            : isCompleted || frozenTimeOut
              ? 'text-gray-500'
              : trackerTone === 'blue'
                ? 'text-blue-600'
                : 'text-emerald-600';

    const trackerLabel = isPreStartBlocked
        ? 'Tracker Opens At'
        : isBreakBlocked
          ? 'Break Ends At'
          : isRuleBlocked
            ? 'Tracker Unavailable'
            : isCompleted || frozenTimeOut
              ? 'Tracker Stopped'
              : 'Current Time';

    const trackerTimeDisplay = isRuleBlocked
        ? '--:--:--'
        : isPreStartBlocked
          ? '08:20:00 AM'
          : isBreakBlocked
            ? '01:00:00 PM'
            : displayTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
              });

    const blockedPrimaryText = isHoliday
        ? `Holiday: ${holidayName ?? 'Holiday'}`
        : (todayBlockReason ?? 'Time in is unavailable today.');

    const blockedSecondaryText = isHoliday
        ? 'Work is not required today.'
        : todayBlockReason === 'You cannot time in after shift end.'
          ? 'Please time in during your scheduled shift hours.'
          : todayBlockReason === 'Today is not part of your scheduled working days. Time in is unavailable.'
            ? 'Time in is unavailable for your current schedule today.'
            : '';

    const preStartTimeDisplay = '08:20 AM';
    const breakEndTimeDisplay = '01:00 PM';

    const noticeToneClasses = {
        blue: {
            container: 'border border-blue-100 bg-blue-50',
            icon: 'text-blue-500',
            text: 'text-blue-700',
            emphasis: 'text-blue-700',
        },
        gray: {
            container: 'border border-gray-200 bg-gray-50',
            icon: 'text-gray-400',
            text: 'text-gray-600',
            emphasis: 'text-gray-700',
        },
        purple: {
            container: 'border border-violet-100 bg-violet-50',
            icon: 'text-violet-500',
            text: 'text-violet-700',
            emphasis: 'text-violet-700',
        },
    } as const;

    const blockedNoticeTone = isHoliday ? noticeToneClasses.purple : noticeToneClasses.gray;

    return (
        <div className="space-y-6">
            <div className="pro-card p-4 sm:p-6">
                <div className="space-y-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="text-sm font-bold text-gray-900">Live Recording</h3>
                                <p className="text-[11px] font-medium text-gray-400">Capture actual time logs</p>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-4 xl:flex-row xl:items-center xl:justify-end">
                            {showPreStartNotice && (
                                <div
                                    className={`flex max-w-[460px] min-w-0 items-center gap-2 rounded-lg px-3 py-2 ${noticeToneClasses.blue.container}`}
                                >
                                    <Info className={`h-4 w-4 shrink-0 ${noticeToneClasses.blue.icon}`} />
                                    <span className={`min-w-0 text-xs leading-tight ${noticeToneClasses.blue.text}`}>
                                        <span className={`font-semibold ${noticeToneClasses.blue.emphasis}`}>
                                            Time in is not available yet.
                                        </span>{' '}
                                        It will open at {preStartTimeDisplay}.
                                    </span>
                                </div>
                            )}

                            {showBreakNotice && (
                                <div
                                    className={`flex max-w-[460px] min-w-0 items-center gap-2 rounded-lg px-3 py-2 ${noticeToneClasses.blue.container}`}
                                >
                                    <Info className={`h-4 w-4 shrink-0 ${noticeToneClasses.blue.icon}`} />
                                    <span className={`min-w-0 text-xs leading-tight ${noticeToneClasses.blue.text}`}>
                                        <span className={`font-semibold ${noticeToneClasses.blue.emphasis}`}>
                                            You are currently on break time.
                                        </span>{' '}
                                        Time in will resume at {breakEndTimeDisplay}.
                                    </span>
                                </div>
                            )}

                            {showBlockedNotice && (
                                <div
                                    className={`flex max-w-[460px] min-w-0 items-center gap-2 rounded-lg px-3 py-2 ${blockedNoticeTone.container}`}
                                >
                                    <Info className={`h-4 w-4 shrink-0 ${blockedNoticeTone.icon}`} />
                                    <span className={`min-w-0 text-xs leading-tight ${blockedNoticeTone.text}`}>
                                        <span className={`font-semibold ${blockedNoticeTone.emphasis}`}>
                                            {blockedPrimaryText}
                                        </span>
                                        {blockedSecondaryText ? ` ${blockedSecondaryText}` : ''}
                                    </span>
                                </div>
                            )}

                            {showOvertimeNotice && (
                                <div
                                    className={`flex max-w-[460px] min-w-0 items-center gap-2 rounded-lg px-3 py-2 ${noticeToneClasses.blue.container}`}
                                >
                                    <Info className={`h-4 w-4 shrink-0 ${noticeToneClasses.blue.icon}`} />
                                    <span className={`min-w-0 text-xs leading-tight ${noticeToneClasses.blue.text}`}>
                                        <span className={`font-semibold ${noticeToneClasses.blue.emphasis}`}>
                                            Beyond regular working hours.
                                        </span>{' '}
                                        You may file an overtime request if applicable.
                                    </span>
                                </div>
                            )}

                            {showCompletedNotice && (
                                <div
                                    className={`flex max-w-[460px] min-w-0 items-center gap-2 rounded-lg px-3 py-2 ${noticeToneClasses.gray.container}`}
                                >
                                    <Info className={`h-4 w-4 shrink-0 ${noticeToneClasses.gray.icon}`} />
                                    <span className={`min-w-0 text-xs leading-tight ${noticeToneClasses.gray.text}`}>
                                        <span className={`font-semibold ${noticeToneClasses.gray.emphasis}`}>
                                            Day logged successfully.
                                        </span>{' '}
                                        Your attendance for today has already been completed.
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-4 xl:w-auto">
                                <div className="text-left xl:text-right">
                                    <p className={`text-[10px] font-bold uppercase tracking-widest ${currentTimeLabelClass}`}>
                                        {trackerLabel}
                                    </p>
                                    <p className={`font-mono text-2xl font-black tracking-tighter ${currentTimeValueClass}`}>
                                        {trackerTimeDisplay}
                                    </p>
                                </div>

                                {isBlocked ? (
                                    <button
                                        type="button"
                                        disabled
                                        className="btn flex shrink-0 cursor-not-allowed items-center justify-center gap-2 border-none bg-gray-200 px-6 text-gray-500 hover:bg-gray-200"
                                    >
                                        <Play className="h-4 w-4 fill-current" />
                                        Time In
                                    </button>
                                ) : isIdle ? (
                                    <button
                                        onClick={() => setIsTimeInModalOpen(true)}
                                        className="btn flex shrink-0 items-center justify-center gap-2 border-none bg-emerald-500 px-6 text-white hover:bg-emerald-600"
                                        disabled={submittingDtr || loadingDtr}
                                    >
                                        <Play className="h-4 w-4 fill-current" />
                                        {submittingDtr ? 'Saving...' : 'Time In'}
                                    </button>
                                ) : isTracking ? (
                                    <button
                                        onClick={() => setIsTimeOutModalOpen(true)}
                                        className="btn flex shrink-0 items-center justify-center gap-2 border-none bg-rose-500 px-6 text-white hover:bg-rose-600"
                                        disabled={submittingDtr || loadingDtr}
                                    >
                                        <Square className="h-4 w-4 fill-current" />
                                        {submittingDtr ? 'Saving...' : 'Time Out'}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        disabled
                                        className="btn flex shrink-0 cursor-not-allowed items-center justify-center gap-2 border-none bg-gray-200 px-6 text-gray-500 hover:bg-gray-200"
                                    >
                                        <Play className="h-4 w-4 fill-current" />
                                        Time In
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all">
                            <label className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                Time In
                            </label>
                            <span
                                className={`text-xl font-black ${
                                    attendanceForm.timeIn ? 'text-emerald-700' : 'text-gray-300'
                                }`}
                            >
                                {attendanceForm.timeIn || '--:-- --'}
                            </span>
                        </div>

                        <div className="flex flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all">
                            <label className="mb-1 text-[10px] font-bold uppercase tracking-wider text-rose-500">
                                Time Out
                            </label>
                            <span
                                className={`text-xl font-black ${
                                    attendanceForm.timeOut ? 'text-rose-600' : 'text-gray-300'
                                }`}
                            >
                                {attendanceForm.timeOut || '--:-- --'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <UserDtrTable
                loadingDtr={loadingDtr}
                myAttendance={myAttendance}
                statusBadge={statusBadge}
                page={page}
                totalPages={totalPages}
                onPrev={onPrev}
                onNext={onNext}
                onView={onView}
                onEdit={onEdit}
                recentlyEditedRowId={recentlyEditedRowId}
            />
        </div>
    );
};

export default UserDtrTab;
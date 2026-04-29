import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
    type AttendanceLogDto,
    type OvertimeRequestDto,
    formatAttendanceTime,
    formatMinutesToHours,
    getMyAttendanceLogs,
    getMyOvertimeRequests,
    getTodayMyAttendanceLog,
    submitOvertimeRequest as submitOTApi,
    timeIn as timeInApi,
    timeOut as timeOutApi,
    toApiDateString,
    toApiTimeString,
    updateAttendanceRemarks,
} from '../../../lib/attendance';

import AttendanceTabs from '../../../components/attendance/AttendanceTabs';
import useLiveTracker from '../../../hooks/useLiveTracker';
import type { AttendanceTab, StatusBadgeMap } from '../../../types/attendance';

import EditAttendanceModal from '../../../components/attendance/user/EditAttendanceModal';
import ViewAttendanceModal from '../../../components/attendance/user/ViewAttendanceModal';
import UserDtrTab from '../../../components/attendance/user/UserDtrTab';
import UserOtTab from '../../../components/attendance/user/UserOtTab';
import OvertimeRequestModal from '../../../components/attendance/user/OvertimeRequestModal';
import UserAttendanceSummaryCards from '../../../components/attendance/user/UserAttendanceSummaryCards';
import TimeRecordModal from '../../../components/attendance/user/TimeRecordModal';

const DEBUG_SIMULATED_NOW: string | null = null;
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T07:50:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T08:25:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T08:35:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T08:40:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T12:15:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T17:30:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T17:31:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T18:00:00';
// const DEBUG_SIMULATED_NOW: string | null = '2026-04-29T21:05:00';

type AttendanceRow = {
    id: number;
    date: string;
    timeIn: string;
    timeOut: string;
    status: string;
    isOT: boolean;
    isUndertime: boolean;
    overtimeStatus?: 'None' | 'Pending' | 'Approved';
    hours: string;
    renderedMinutes: number;
    lateMinutes: number;
    undertimeMinutes: number;
    overtimeMinutes: number;
    task: string;
    accomplished: string;
};

type MyOvertimeRow = {
    id: number;
    date: string;
    duration: string;
    reason: string;
    status: string;
};

type SubmitOvertimePayload = {
    dateFrom: string;
    dateTo: string;
    requestedMinutes: number;
    reason: string;
};

type AttendanceFormState = {
    timeIn: string;
    timeOut: string;
    overtime: string;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    const rawMessage =
        error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : typeof error === 'object' &&
                  error !== null &&
                  'message' in error &&
                  typeof (error as { message?: unknown }).message === 'string'
                ? (error as { message: string }).message
                : '';

    if (!rawMessage) return fallback;

    try {
        const parsed = JSON.parse(rawMessage) as
            | {
                  message?: string;
                  title?: string;
                  detail?: string;
                  errors?: Record<string, string[]>;
              }
            | Array<{
                  message?: string;
                  title?: string;
                  detail?: string;
              }>;

        if (Array.isArray(parsed)) {
            return parsed[0]?.message || parsed[0]?.detail || parsed[0]?.title || fallback;
        }

        if (parsed.message) return parsed.message;
        if (parsed.detail) return parsed.detail;
        if (parsed.title) return parsed.title;

        const firstError = parsed.errors ? Object.values(parsed.errors)[0]?.[0] : null;
        if (firstError) return firstError;
    } catch {
        // continue below
    }

    if (rawMessage.length > 180 || rawMessage.includes('"passwordHash"')) {
        return fallback;
    }

    return rawMessage;
};

const normalizeDateKey = (value?: string | null) => {
    if (!value || value === '-' || value === '--' || value === '—') return '';

    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        return value.slice(0, 10);
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value?: string | null) => {
    const normalized = normalizeDateKey(value);
    if (!normalized) return '--';

    const parsed = new Date(`${normalized}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value || '--';

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(parsed);
};

const formatOvertimeDateRange = (request: OvertimeRequestDto) => {
    const dateFrom = request.dateFrom || request.attendanceDate || '';
    const dateTo = request.dateTo || request.dateFrom || request.attendanceDate || '';

    const formattedFrom = formatDisplayDate(dateFrom);
    const formattedTo = formatDisplayDate(dateTo);

    if (formattedFrom === formattedTo) return formattedFrom;
    if (formattedFrom === '--') return formattedTo;
    if (formattedTo === '--') return formattedFrom;

    return `${formattedFrom} - ${formattedTo}`;
};

const formatOvertimeDuration = (request: OvertimeRequestDto) => {
    const perDayMinutes = Number(request.requestedMinutesPerDay ?? request.requestedMinutes ?? 0);
    const totalMinutes = Number(
        request.totalRequestedMinutes ?? request.requestedMinutes ?? perDayMinutes
    );

    if (!Number.isFinite(perDayMinutes) || perDayMinutes <= 0) return '--';

    const formatHours = (minutes: number) => {
        const hours = minutes / 60;
        return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
    };

    if (!Number.isFinite(totalMinutes) || totalMinutes <= 0 || totalMinutes === perDayMinutes) {
        return formatHours(perDayMinutes);
    }

    return `${formatHours(perDayMinutes)}/day (${formatHours(totalMinutes)} total)`;
};

const getSimulatedNow = () => {
    if (!DEBUG_SIMULATED_NOW) return null;

    const parsed = new Date(DEBUG_SIMULATED_NOW);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMinutesFromDate = (date: Date) => date.getHours() * 60 + date.getMinutes();

const UserAttendance = () => {
    const [activeTab, setActiveTab] = useState<AttendanceTab>('dtr');

    const {
        currentTime,
        frozenTimeOut,
        displayTime,
        isBeforeStart,
        isBreakTime,
        isAfterRegularHours,
    } = useLiveTracker({
        startAtHour: 8,
        startAtMinute: 20,
        stopAtHour: 21,
        stopAtMinute: 0,
        overtimeStartHour: 17,
        overtimeStartMinute: 30,
    });

    const simulatedNow = useMemo(() => getSimulatedNow(), []);

    const simulatedFlags = useMemo(() => {
        if (!simulatedNow) return null;

        const minutes = getMinutesFromDate(simulatedNow);

        return {
            isBeforeStart: minutes < 8 * 60 + 20,
            isBreakTime: minutes >= 12 * 60 && minutes < 13 * 60,
            isAfterRegularHours: minutes >= 17 * 60 + 30,
            isAfterShiftCutoff: minutes >= 21 * 60,
        };
    }, [simulatedNow]);

    const effectiveCurrentTime = simulatedNow ?? currentTime;
    const effectiveIsBeforeStart = simulatedFlags?.isBeforeStart ?? isBeforeStart;
    const effectiveIsBreakTime = simulatedFlags?.isBreakTime ?? isBreakTime;
    const effectiveIsAfterRegularHours =
        simulatedFlags?.isAfterRegularHours ?? isAfterRegularHours;

    const [punchedIn, setPunchedIn] = useState(false);
    const [punchedOut, setPunchedOut] = useState(false);
    const [isWorkingDay, setIsWorkingDay] = useState(true);
    const [canTimeInToday, setCanTimeInToday] = useState(true);
    const [todayBlockReason, setTodayBlockReason] = useState<string | null>(null);
    const [isHoliday, setIsHoliday] = useState(false);
    const [holidayName, setHolidayName] = useState<string | null>(null);

    const [isTimeInModalOpen, setIsTimeInModalOpen] = useState(false);
    const [isTimeOutModalOpen, setIsTimeOutModalOpen] = useState(false);
    const [isOvertimeModalOpen, setIsOvertimeModalOpen] = useState(false);

    const [taskPlan, setTaskPlan] = useState('');
    const [taskAccomplished, setTaskAccomplished] = useState('');
    const [submittingOt, setSubmittingOt] = useState(false);
    const [otError, setOtError] = useState<string | null>(null);

    const [attendanceForm, setAttendanceForm] = useState<AttendanceFormState>({
        timeIn: '',
        timeOut: '',
        overtime: '0',
    });

    const [myOvertime, setMyOvertime] = useState<MyOvertimeRow[]>([]);
    const [loadingOt, setLoadingOt] = useState(false);

    const [myAttendance, setMyAttendance] = useState<AttendanceRow[]>([]);
    const [loadingDtr, setLoadingDtr] = useState(false);
    const [submittingDtr, setSubmittingDtr] = useState(false);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const PAGE_SIZE = 10;

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedViewRecord, setSelectedViewRecord] = useState<AttendanceRow | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedEditRecord, setSelectedEditRecord] = useState<AttendanceRow | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [recentlyEditedRowId, setRecentlyEditedRowId] = useState<number | null>(null);

    const statusBadge: StatusBadgeMap = {
        Present: 'badge-success',
        Late: 'badge-warning',
        Absent: 'badge-danger',
        Incomplete: 'badge-warning',
        OnLeave: 'badge-primary',
    };

    const simulatedBlockReason = useMemo(() => {
        if (!simulatedNow) return null;

        if (isHoliday) {
            return holidayName
                ? `${holidayName}. Work is not required today.`
                : 'Holiday. Work is not required today.';
        }

        if (!isWorkingDay) {
            return 'Today is not part of your scheduled working days. Time in is unavailable.';
        }

        if (simulatedFlags?.isBeforeStart) {
            return 'Time in is not available yet. It will open at 08:20 AM.';
        }

        if (simulatedFlags?.isBreakTime) {
            return 'You cannot time in during break time.';
        }

        if (simulatedFlags?.isAfterShiftCutoff) {
            return 'You cannot time in after shift cutoff.';
        }

        return null;
    }, [holidayName, isHoliday, isWorkingDay, simulatedFlags, simulatedNow]);

    const effectiveCanTimeInToday = simulatedNow ? !simulatedBlockReason : canTimeInToday;
    const effectiveTodayBlockReason = simulatedNow ? simulatedBlockReason : todayBlockReason;

    const trackerTone = useMemo<'blue' | 'green'>(() => {
        if (punchedIn && !punchedOut && effectiveIsAfterRegularHours) {
            return 'blue';
        }

        return 'green';
    }, [punchedIn, punchedOut, effectiveIsAfterRegularHours]);

    const mapAttendanceRows = useCallback(
        (items: AttendanceLogDto[]): AttendanceRow[] =>
            items.map((log) => {
                const hasTimeIn = !!log.timeIn;
                const hasTimeOut = !!log.timeOut;
                const lateMinutes = Number(log.lateMinutes ?? 0);
                const overtimeMinutes = Number(log.overtimeMinutes ?? 0);
                const undertimeMinutes = Number(log.undertimeMinutes ?? 0);
                const renderedMinutes = Number(log.renderedMinutes ?? 0);
                const overtimeStatus = log.overtimeStatus ?? 'None';

                let status = 'Present';

                if (!hasTimeIn && !hasTimeOut) {
                    status = 'Absent';
                } else if (lateMinutes > 0) {
                    status = 'Late';
                }

                return {
                    id: log.id,
                    date: log.date || '—',
                    timeIn: formatAttendanceTime(log.timeIn),
                    timeOut: formatAttendanceTime(log.timeOut),
                    status,
                    isOT: overtimeStatus === 'Approved',
                    isUndertime: undertimeMinutes > 0,
                    overtimeStatus,
                    hours: formatMinutesToHours(renderedMinutes),
                    renderedMinutes,
                    lateMinutes,
                    undertimeMinutes,
                    overtimeMinutes,
                    task: (log.task ?? '').trim(),
                    accomplished: (log.accomplished ?? '').trim(),
                };
            }),
        []
    );

    const loadTodayLog = useCallback(async () => {
        try {
            const today = await getTodayMyAttendanceLog();

            if (!today) {
                setAttendanceForm({
                    timeIn: '',
                    timeOut: '',
                    overtime: '0',
                });

                setPunchedIn(false);
                setPunchedOut(false);
                setIsWorkingDay(true);
                setCanTimeInToday(true);
                setTodayBlockReason(null);
                setIsHoliday(false);
                setHolidayName(null);
                return;
            }

            const mappedTimeIn = formatAttendanceTime(today.timeIn);
            const mappedTimeOut = formatAttendanceTime(today.timeOut);

            setAttendanceForm({
                timeIn: today.timeIn ? mappedTimeIn : '',
                timeOut: today.timeOut ? mappedTimeOut : '',
                overtime: today.overtimeMinutes ? formatMinutesToHours(today.overtimeMinutes) : '0',
            });

            setPunchedIn(!!today.timeIn);
            setPunchedOut(!!today.timeOut);
            setIsWorkingDay(today.isWorkingDay ?? true);
            setCanTimeInToday(today.canTimeIn ?? true);
            setTodayBlockReason(today.blockReason ?? null);
            setIsHoliday(today.isHoliday ?? false);
            setHolidayName(today.holidayName ?? null);
        } catch (err) {
            console.error(err);
            toast.error(getErrorMessage(err, 'Failed to load today attendance state.'));
        }
    }, []);

    const loadAttendanceLogs = useCallback(async () => {
        const response = await getMyAttendanceLogs({
            page,
            pageSize: PAGE_SIZE,
        });

        setMyAttendance(mapAttendanceRows(response.items || []));
        setTotalPages(Math.max(1, Math.ceil((response.totalCount || 0) / PAGE_SIZE)));
    }, [mapAttendanceRows, page]);

    const refreshDtrState = useCallback(async () => {
        await Promise.all([loadTodayLog(), loadAttendanceLogs()]);
    }, [loadTodayLog, loadAttendanceLogs]);

    const loadDtrData = useCallback(async () => {
        try {
            setLoadingDtr(true);
            await refreshDtrState();
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to load attendance logs.'));
        } finally {
            setLoadingDtr(false);
        }
    }, [refreshDtrState]);

    const fetchMyOt = useCallback(async () => {
        try {
            setLoadingOt(true);

            const res = await getMyOvertimeRequests();

            const mapped: MyOvertimeRow[] = (res.items || []).map((o: OvertimeRequestDto) => ({
                id: o.id,
                date: formatOvertimeDateRange(o),
                duration: formatOvertimeDuration(o),
                reason: o.reason || '—',
                status: o.status || 'Pending',
            }));

            setMyOvertime(mapped);
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to load overtime requests.'));
        } finally {
            setLoadingOt(false);
        }
    }, []);

    useEffect(() => {
        void loadDtrData();
    }, [loadDtrData]);

    useEffect(() => {
        void fetchMyOt();
    }, [fetchMyOt]);

    const handleOpenTimeInModal = useCallback(
        (value: boolean) => {
            if (!value) {
                setIsTimeInModalOpen(false);
                return;
            }

            if (punchedIn && !punchedOut) {
                toast.warning('You are already timed in.');
                void refreshDtrState();
                return;
            }

            if (!effectiveCanTimeInToday) {
                if (effectiveTodayBlockReason) {
                    toast.warning(effectiveTodayBlockReason);
                }
                return;
            }

            setIsTimeInModalOpen(true);
        },
        [punchedIn, punchedOut, effectiveCanTimeInToday, effectiveTodayBlockReason, refreshDtrState]
    );

    const handleOpenTimeOutModal = useCallback(
        (value: boolean) => {
            if (!value) {
                setIsTimeOutModalOpen(false);
                return;
            }

            if (!punchedIn) {
                toast.warning('You need to time in first.');
                void refreshDtrState();
                return;
            }

            if (punchedOut) {
                toast.warning('You are already timed out.');
                void refreshDtrState();
                return;
            }

            setIsTimeOutModalOpen(true);
        },
        [punchedIn, punchedOut, refreshDtrState]
    );

    const confirmTimeIn = async () => {
        if (simulatedNow) {
            toast.info(
                'Simulation mode is active. Set DEBUG_SIMULATED_NOW back to null before saving real time-in.'
            );
            return;
        }

        try {
            setSubmittingDtr(true);

            const res = await timeInApi({
                task: taskPlan.trim() || undefined,
            });

            setAttendanceForm((prev) => ({
                ...prev,
                timeIn: formatAttendanceTime(res.timeIn),
            }));

            setPunchedIn(true);
            setPunchedOut(false);
            setTaskPlan('');
            setIsTimeInModalOpen(false);

            await refreshDtrState();

            toast.success('Time in recorded successfully.');
        } catch (error: unknown) {
            console.error(error);

            const message = getErrorMessage(error, 'Failed to record time in.');

            if (message.toLowerCase().includes('already timed in')) {
                setIsTimeInModalOpen(false);
                setTaskPlan('');

                await refreshDtrState();

                toast.warning('Already timed in. Attendance state refreshed.');
                return;
            }

            toast.error(message);
        } finally {
            setSubmittingDtr(false);
        }
    };

    const confirmTimeOut = async () => {
        if (simulatedNow) {
            toast.info(
                'Simulation mode is active. Set DEBUG_SIMULATED_NOW back to null before saving real time-out.'
            );
            return;
        }

        try {
            setSubmittingDtr(true);

            const res = await timeOutApi({
                accomplished: taskAccomplished.trim() || undefined,
            });

            setAttendanceForm((prev) => ({
                ...prev,
                timeOut: formatAttendanceTime(res.timeOut),
                overtime: res.overtimeMinutes ? formatMinutesToHours(res.overtimeMinutes) : '0',
            }));

            setPunchedIn(!!res.timeIn);
            setPunchedOut(!!res.timeOut);
            setTaskPlan('');
            setTaskAccomplished('');
            setIsTimeOutModalOpen(false);

            await refreshDtrState();

            toast.success('Time out recorded successfully.');
        } catch (error: unknown) {
            console.error(error);

            const message = getErrorMessage(error, 'Failed to record time out.');

            if (message.toLowerCase().includes('already timed out')) {
                setIsTimeOutModalOpen(false);
                setTaskAccomplished('');

                await refreshDtrState();

                toast.warning('Already timed out. Attendance state refreshed.');
                return;
            }

            toast.error(message);
        } finally {
            setSubmittingDtr(false);
        }
    };

    const handleSubmitOvertime = async (payload: SubmitOvertimePayload) => {
        setOtError(null);

        if (
            !payload.dateFrom ||
            !payload.dateTo ||
            !payload.requestedMinutes ||
            !payload.reason.trim()
        ) {
            setOtError('Please complete all overtime request details.');
            return;
        }

        try {
            setSubmittingOt(true);

            await submitOTApi({
                dateFrom: payload.dateFrom,
                dateTo: payload.dateTo,
                requestedMinutes: Math.round(payload.requestedMinutes),
                reason: payload.reason.trim(),
            });

            setIsOvertimeModalOpen(false);
            setOtError(null);

            await fetchMyOt();
            toast.success('Overtime request submitted successfully.');
        } catch (error: unknown) {
            console.error(error);
            setOtError(getErrorMessage(error, 'Failed to submit overtime request.'));
        } finally {
            setSubmittingOt(false);
        }
    };

    const handlePrevPage = useCallback(() => {
        setPage((prev) => Math.max(1, prev - 1));
    }, []);

    const handleNextPage = useCallback(() => {
        setPage((prev) => Math.min(totalPages, prev + 1));
    }, [totalPages]);

    const handleUserRowView = useCallback((row: AttendanceRow) => {
        setSelectedViewRecord(row);
        setIsViewModalOpen(true);
    }, []);

    const handleUserRowEdit = useCallback((row: AttendanceRow) => {
        setSelectedEditRecord(row);
        setIsEditModalOpen(true);
    }, []);

    const handleEditChange = useCallback((updated: AttendanceRow) => {
        setSelectedEditRecord(updated);
    }, []);

    const handleEditSave = useCallback(async () => {
        if (!selectedEditRecord) return;

        try {
            setSavingEdit(true);

            await updateAttendanceRemarks({
                id: selectedEditRecord.id,
                date: toApiDateString(selectedEditRecord.date),
                timeIn:
                    selectedEditRecord.timeIn === '-'
                        ? null
                        : toApiTimeString(selectedEditRecord.timeIn),
                timeOut:
                    selectedEditRecord.timeOut === '-'
                        ? null
                        : toApiTimeString(selectedEditRecord.timeOut),
                status: selectedEditRecord.status,
                task: selectedEditRecord.task || '',
                accomplished: selectedEditRecord.accomplished || '',
                isOT: selectedEditRecord.isOT ?? false,
            });

            const editedRowId = selectedEditRecord.id;

            setIsEditModalOpen(false);
            setSelectedEditRecord(null);

            await loadAttendanceLogs();

            setRecentlyEditedRowId(editedRowId);
            toast.success('Attendance record updated successfully.');

            window.setTimeout(() => {
                setRecentlyEditedRowId((current) =>
                    current === editedRowId ? null : current
                );
            }, 3000);
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update attendance details.'));
        } finally {
            setSavingEdit(false);
        }
    }, [selectedEditRecord, loadAttendanceLogs]);

    const effectiveTrackerTime = useMemo(() => {
        if (simulatedNow) {
            return simulatedNow;
        }

        if (attendanceForm.timeOut) {
            const actualTimeOut = toApiTimeString(attendanceForm.timeOut);

            if (actualTimeOut) {
                const parsed = new Date(`2000-01-01T${actualTimeOut}`);
                if (!Number.isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
        }

        if (frozenTimeOut) {
            return frozenTimeOut;
        }

        return displayTime;
    }, [attendanceForm.timeOut, frozenTimeOut, displayTime, simulatedNow]);

    const stats = useMemo(() => {
        const present = myAttendance.filter((log) => log.status === 'Present').length;
        const late = myAttendance.filter((log) => log.status === 'Late').length;
        const absent = myAttendance.filter((log) => log.status === 'Absent').length;
        const totalMinutes = myAttendance.reduce(
            (sum, log) => sum + Number(log.renderedMinutes || 0),
            0
        );

        return {
            present,
            late,
            absent,
            totalMinutes,
        };
    }, [myAttendance]);

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Time & Attendance</h1>
                <p>Record your daily time in and time out with real-time tracking</p>
            </div>

            <UserAttendanceSummaryCards stats={stats} />

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <AttendanceTabs
                        activeTab={activeTab}
                        onChange={setActiveTab as (tab: 'dtr' | 'ot' | 'setup') => void}
                    />
                </div>

                <div className="p-6">
                    {activeTab === 'dtr' && (
                        <UserDtrTab
                            frozenTimeOut={frozenTimeOut}
                            displayTime={effectiveTrackerTime}
                            punchedIn={punchedIn}
                            punchedOut={punchedOut}
                            submittingDtr={submittingDtr}
                            loadingDtr={loadingDtr}
                            setIsTimeInModalOpen={handleOpenTimeInModal}
                            setIsTimeOutModalOpen={handleOpenTimeOutModal}
                            attendanceForm={attendanceForm}
                            myAttendance={myAttendance}
                            statusBadge={statusBadge}
                            page={page}
                            totalPages={totalPages}
                            onPrev={handlePrevPage}
                            onNext={handleNextPage}
                            onView={handleUserRowView}
                            onEdit={handleUserRowEdit}
                            recentlyEditedRowId={recentlyEditedRowId}
                            trackerTone={trackerTone}
                            isBeforeStart={effectiveIsBeforeStart}
                            isBreakTime={effectiveIsBreakTime}
                            isAfterRegularHours={effectiveIsAfterRegularHours}
                            isWorkingDay={isWorkingDay}
                            canTimeInToday={effectiveCanTimeInToday}
                            todayBlockReason={effectiveTodayBlockReason}
                            isHoliday={isHoliday}
                            holidayName={holidayName}
                        />
                    )}

                    {activeTab === 'ot' && (
                        <UserOtTab
                            loadingOt={loadingOt}
                            myOvertime={myOvertime}
                            setIsOvertimeModalOpen={setIsOvertimeModalOpen}
                        />
                    )}
                </div>
            </div>

            {isViewModalOpen && selectedViewRecord && (
                <ViewAttendanceModal
                    isOpen={isViewModalOpen}
                    record={selectedViewRecord}
                    statusBadge={statusBadge}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedViewRecord(null);
                    }}
                />
            )}

            {isEditModalOpen && selectedEditRecord && (
                <EditAttendanceModal
                    isOpen={isEditModalOpen}
                    record={selectedEditRecord}
                    onClose={() => {
                        if (savingEdit) return;
                        setIsEditModalOpen(false);
                        setSelectedEditRecord(null);
                    }}
                    onChange={handleEditChange}
                    onSave={handleEditSave}
                    saving={savingEdit}
                />
            )}

            <TimeRecordModal
                isOpen={isTimeInModalOpen}
                mode="time-in"
                currentTime={effectiveCurrentTime}
                value={taskPlan}
                onChange={setTaskPlan}
                onClose={() => setIsTimeInModalOpen(false)}
                onConfirm={confirmTimeIn}
                submitting={submittingDtr}
            />

            <TimeRecordModal
                isOpen={isTimeOutModalOpen}
                mode="time-out"
                currentTime={effectiveCurrentTime}
                value={taskAccomplished}
                onChange={setTaskAccomplished}
                onClose={() => setIsTimeOutModalOpen(false)}
                onConfirm={confirmTimeOut}
                submitting={submittingDtr}
            />

            <OvertimeRequestModal
                isOpen={isOvertimeModalOpen}
                submittingOt={submittingOt}
                errorMessage={otError}
                onClose={() => {
                    if (submittingOt) return;
                    setIsOvertimeModalOpen(false);
                    setOtError(null);
                }}
                onSubmit={handleSubmitOvertime}
            />
        </div>
    );
};

export default UserAttendance;
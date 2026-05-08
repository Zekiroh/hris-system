import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

type SubmitOvertimePayload = {
    dateFrom: string;
    dateTo: string;
    requestedMinutes: number;
    reason: string;
};

type OvertimeRequestModalProps = {
    isOpen: boolean;
    submittingOt: boolean;
    errorMessage?: string | null;
    onClose: () => void;
    onSubmit: (payload: SubmitOvertimePayload) => void | Promise<void>;

    isWorkingDay?: boolean;
    breakEndTime?: string | null;
    shiftEndTime?: string | null;
};

type FormState = {
    dateFrom: string;
    dateTo: string;
    hoursPerDay: string;
    reason: string;
};

const MAX_DAYS = 5;
const REQUEST_OPEN_BEFORE_SHIFT_END_MINUTES = 180;

const HOUR_OPTIONS = [
    { label: '0.5 hour', value: '0.5' },
    { label: '1 hour', value: '1' },
    { label: '1.5 hours', value: '1.5' },
    { label: '2 hours', value: '2' },
    { label: '2.5 hours', value: '2.5' },
    { label: '3 hours', value: '3' },
];

const formatDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getTodayDateString = () => formatDateInput(new Date());

const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    return formatDateInput(tomorrow);
};

const getCurrentMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

const parseTimeToMinutes = (value?: string | null) => {
    if (!value) return null;

    const raw = value.trim();
    if (!raw) return null;

    const timeOnlyMatch = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/);
    if (!timeOnlyMatch) return null;

    const hour = Number(timeOnlyMatch[1]);
    const minute = Number(timeOnlyMatch[2]);

    if (
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
    ) {
        return null;
    }

    return hour * 60 + minute;
};

const formatMinutesToDisplayTime = (minutes: number) => {
    const normalizedMinutes = ((minutes % 1440) + 1440) % 1440;
    let hour = Math.floor(normalizedMinutes / 60);
    const minute = normalizedMinutes % 60;
    const modifier = hour >= 12 ? 'PM' : 'AM';

    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;

    return `${hour}:${String(minute).padStart(2, '0')} ${modifier}`;
};

const isWithinTimeRange = (
    currentMinutes: number,
    openMinutes: number,
    closeMinutes: number
) => {
    if (openMinutes === closeMinutes) return false;

    if (openMinutes < closeMinutes) {
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    }

    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
};

const getDefaultFormState = (): FormState => {
    const today = getTodayDateString();

    return {
        dateFrom: today,
        dateTo: today,
        hoursPerDay: '3',
        reason: '',
    };
};

const getDateRangeDays = (dateFrom: string, dateTo: string) => {
    if (!dateFrom || !dateTo) return 0;

    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 0;
    }

    return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
};

const formatTotalHours = (hours: number) => {
    if (!Number.isFinite(hours) || hours <= 0) return '0 hrs';

    return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
};

const OvertimeRequestModal = ({
    isOpen,
    submittingOt,
    errorMessage,
    onClose,
    onSubmit,
    isWorkingDay = true,
    breakEndTime,
    shiftEndTime,
}: OvertimeRequestModalProps) => {
    const [form, setForm] = useState<FormState>(() => getDefaultFormState());
    const [wasOpen, setWasOpen] = useState(isOpen);

    if (isOpen && !wasOpen) {
        setWasOpen(true);
        setForm(getDefaultFormState());
    }

    if (!isOpen && wasOpen) {
        setWasOpen(false);
    }

    const { dateFrom, dateTo, hoursPerDay, reason } = form;

    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();
    const currentMinutes = getCurrentMinutes();

    const dynamicOpenMinutes = parseTimeToMinutes(breakEndTime);
    const dynamicShiftEndMinutes = parseTimeToMinutes(shiftEndTime);

    const requestOpenMinutes =
        dynamicOpenMinutes ??
        (dynamicShiftEndMinutes !== null
            ? dynamicShiftEndMinutes - REQUEST_OPEN_BEFORE_SHIFT_END_MINUTES
            : null);

    const requestCloseMinutes = dynamicShiftEndMinutes ?? null;

    const hasRequestWindow =
        requestOpenMinutes !== null && requestCloseMinutes !== null;

    const requestOpenTime = hasRequestWindow
        ? formatMinutesToDisplayTime(requestOpenMinutes)
        : null;
    const requestCloseTime = hasRequestWindow
        ? formatMinutesToDisplayTime(requestCloseMinutes)
        : null;

    const isWithinCurrentDayWindow =
        isWorkingDay &&
        hasRequestWindow &&
        isWithinTimeRange(currentMinutes, requestOpenMinutes, requestCloseMinutes);

    const effectiveDateFrom = useMemo(() => {
        if (!dateFrom || !dateTo) return dateFrom;

        const includesToday = dateFrom <= today && dateTo >= today;

        if (includesToday && !isWithinCurrentDayWindow) {
            return tomorrow;
        }

        return dateFrom;
    }, [dateFrom, dateTo, today, tomorrow, isWithinCurrentDayWindow]);

    const totalDays = useMemo(
        () => getDateRangeDays(effectiveDateFrom, dateTo),
        [effectiveDateFrom, dateTo]
    );

    const totalHours = useMemo(() => {
        const hours = Number(hoursPerDay || 0);

        return totalDays > 0 ? totalDays * hours : 0;
    }, [totalDays, hoursPerDay]);

    const skipTodayMessage = useMemo(() => {
        if (!dateFrom || !dateTo) return null;

        const includesToday = dateFrom <= today && dateTo >= today;

        if (includesToday && !isWorkingDay) {
            return 'Today is not part of your assigned working schedule, so the request will start from the next valid date.';
        }

        if (includesToday && !hasRequestWindow) {
            return 'Today has no complete shift window for overtime requests, so the request will start from the next valid date.';
        }

        if (includesToday && !isWithinCurrentDayWindow && effectiveDateFrom !== dateFrom) {
            return 'Today is outside your shift-based overtime request window, so the request will start from the next valid date.';
        }

        return null;
    }, [
        dateFrom,
        dateTo,
        today,
        isWorkingDay,
        hasRequestWindow,
        isWithinCurrentDayWindow,
        effectiveDateFrom,
    ]);

    const validationMessage = useMemo(() => {
        if (!dateFrom || !dateTo) return null;

        if (new Date(`${dateTo}T00:00:00`) < new Date(`${dateFrom}T00:00:00`)) {
            return 'Date To cannot be earlier than Date From.';
        }

        if (dateFrom < today) {
            return 'Overtime request cannot be submitted for past dates.';
        }

        const originalRangeDays = getDateRangeDays(dateFrom, dateTo);

        if (originalRangeDays > MAX_DAYS) {
            return `Maximum overtime request range is ${MAX_DAYS} days.`;
        }

        if (effectiveDateFrom > dateTo) {
            return 'No valid requestable dates within the selected range.';
        }

        if (totalDays <= 0) {
            return 'No valid requestable dates within the selected range.';
        }

        return null;
    }, [dateFrom, dateTo, today, effectiveDateFrom, totalDays]);

    const reasonMessage =
        dateFrom && dateTo && hoursPerDay && !reason.trim()
            ? 'Reason is required.'
            : null;

    const displayErrorMessage = validationMessage || reasonMessage || errorMessage;

    const isSubmitDisabled =
        submittingOt ||
        !!validationMessage ||
        !dateFrom ||
        !dateTo ||
        !hoursPerDay ||
        !reason.trim();

    const handleClose = () => {
        if (submittingOt) return;
        onClose();
    };

    const handleSubmit = () => {
        if (isSubmitDisabled) return;

        onSubmit({
            dateFrom: effectiveDateFrom,
            dateTo,
            requestedMinutes: Math.round(Number(hoursPerDay) * 60),
            reason: reason.trim(),
        });
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[2147483647] flex min-h-dvh items-center justify-center bg-[rgba(15,23,42,0.5)] p-4 backdrop-blur-[4px]"
            onClick={handleClose}
        >
            <div
                className="w-full max-w-md animate-fade-in-up overflow-hidden rounded-2xl bg-white shadow-xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h3 className="text-xl font-bold text-gray-900">
                        Submit Overtime Request
                    </h3>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submittingOt}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                min={today}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    setForm((prev) => ({
                                        ...prev,
                                        dateFrom: value,
                                        dateTo:
                                            !prev.dateTo || prev.dateTo < value
                                                ? value
                                                : prev.dateTo,
                                    }));
                                }}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                disabled={submittingOt}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                min={dateFrom || today}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        dateTo: event.target.value,
                                    }))
                                }
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                disabled={submittingOt}
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Overtime Hours Per Day
                        </label>
                        <select
                            value={hoursPerDay}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    hoursPerDay: event.target.value,
                                }))
                            }
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            disabled={submittingOt}
                        >
                            <option value="">Select hours</option>
                            {HOUR_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <p className="mt-2 text-xs font-medium text-slate-500">
                        Current-day requests for your assigned shift are accepted
                        {hasRequestWindow
                            ? ` from ${requestOpenTime} to ${requestCloseTime}`
                            : ' when your shift schedule has a complete time window'}
                        . Future dates may be requested anytime. Maximum range is {MAX_DAYS} days.
                    </p>

                    {skipTodayMessage && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                            {skipTodayMessage}
                        </div>
                    )}

                    <div className="my-5 flex w-full flex-col items-center justify-center rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-1 text-sm font-black uppercase tracking-wider text-blue-600">
                            Total Overtime Calculated
                        </p>
                        <p className="font-mono text-3xl font-black text-blue-600">
                            {formatTotalHours(totalHours)}
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Reason for Overtime
                        </label>
                        <textarea
                            value={reason}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    reason: event.target.value,
                                }))
                            }
                            className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            placeholder="Why do you need to work overtime?"
                            disabled={submittingOt}
                        />
                    </div>

                    {displayErrorMessage && (
                        <div className="mb-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            {displayErrorMessage}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={submittingOt}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isSubmitDisabled}
                    >
                        {submittingOt ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OvertimeRequestModal;
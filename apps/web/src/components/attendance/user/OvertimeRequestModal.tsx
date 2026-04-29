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
};

const MAX_DAYS = 5;
const REQUEST_OPEN_MINUTES = 13 * 60;
const REQUEST_CLOSE_MINUTES = 16 * 60 + 30;

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

const getDateRangeDays = (dateFrom: string, dateTo: string) => {
    if (!dateFrom || !dateTo) return 0;

    const start = new Date(`${dateFrom}T00:00:00`);
    const end = new Date(`${dateTo}T00:00:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return 0;
    }

    return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
};

const OvertimeRequestModal = ({
    isOpen,
    submittingOt,
    errorMessage,
    onClose,
    onSubmit,
}: OvertimeRequestModalProps) => {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [hoursPerDay, setHoursPerDay] = useState('');
    const [reason, setReason] = useState('');

    const today = getTodayDateString();
    const tomorrow = getTomorrowDateString();
    const currentMinutes = getCurrentMinutes();

    const isWithinCurrentDayWindow =
        currentMinutes >= REQUEST_OPEN_MINUTES &&
        currentMinutes <= REQUEST_CLOSE_MINUTES;

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

        if (includesToday && !isWithinCurrentDayWindow && effectiveDateFrom !== dateFrom) {
            return 'Today is outside the request window, so the request will start from the next valid date.';
        }

        return null;
    }, [dateFrom, dateTo, today, isWithinCurrentDayWindow, effectiveDateFrom]);

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
            return 'Maximum overtime request range is 5 days.';
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
            onClick={submittingOt ? undefined : onClose}
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
                        onClick={onClose}
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
                                onChange={(event) => setDateFrom(event.target.value)}
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
                                onChange={(event) => setDateTo(event.target.value)}
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
                            onChange={(event) => setHoursPerDay(event.target.value)}
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
                        Current-day requests are accepted from 1:00 PM to 4:30 PM.
                        Future dates may be requested anytime. Maximum range is 5 days.
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
                            {totalHours.toFixed(1)} hrs
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-bold text-gray-700">
                            Reason for Overtime
                        </label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
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
                        onClick={onClose}
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
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

type TimeRecordModalMode = 'time-in' | 'time-out';

type TimeRecordModalProps = {
    isOpen: boolean;
    mode: TimeRecordModalMode;
    currentTime: Date;
    value: string;
    onChange: (value: string) => void;
    onClose: () => void;
    onConfirm: () => void;
    submitting: boolean;
};

const SHIFT_START_HOUR = 8;
const SHIFT_START_MINUTE = 30;
const LATE_GRACE_MINUTES = 5;

const OVERTIME_START_HOUR = 17;
const OVERTIME_START_MINUTE = 30;

const getMinutes = (time: Date) => time.getHours() * 60 + time.getMinutes();

const determineTimeInStatus = (time: Date) => {
    const currentMinutes = getMinutes(time);
    const lateThresholdMinutes =
        SHIFT_START_HOUR * 60 + SHIFT_START_MINUTE + LATE_GRACE_MINUTES;

    return currentMinutes > lateThresholdMinutes ? 'Late' : 'Present';
};

const determineTimeOutStatus = (time: Date) => {
    const currentMinutes = getMinutes(time);
    const overtimeThresholdMinutes = OVERTIME_START_HOUR * 60 + OVERTIME_START_MINUTE;

    return currentMinutes > overtimeThresholdMinutes ? 'Overtime' : 'Regular';
};

const TimeRecordModal = ({
    isOpen,
    mode,
    currentTime,
    value,
    onChange,
    onClose,
    onConfirm,
    submitting,
}: TimeRecordModalProps) => {
    if (!isOpen) return null;

    const isTimeIn = mode === 'time-in';
    const status = isTimeIn ? determineTimeInStatus(currentTime) : determineTimeOutStatus(currentTime);

    const title = isTimeIn ? 'Record Time In' : 'Record Time Out';
    const label = isTimeIn ? 'Task' : 'Accomplished';
    const placeholder = isTimeIn
        ? 'List down the tasks you plan to accomplish today...'
        : 'Describe the tasks you successfully completed...';
    const confirmLabel = isTimeIn ? 'Confirm Time In' : 'Confirm Time Out';
    const savingLabel = 'Saving...';

    const isLate = status === 'Late';
    const isOvertime = status === 'Overtime';

    const panelClass = isTimeIn
        ? isLate
            ? 'border-amber-100 bg-amber-50'
            : 'border-emerald-100 bg-emerald-50'
        : isOvertime
            ? 'border-blue-100 bg-blue-50'
            : 'border-rose-100 bg-rose-50';

    const headingClass = isTimeIn
        ? isLate
            ? 'text-amber-500'
            : 'text-emerald-600'
        : isOvertime
            ? 'text-blue-600'
            : 'text-rose-500';

    const timeClass = isTimeIn
        ? isLate
            ? 'text-amber-600'
            : 'text-emerald-600'
        : isOvertime
            ? 'text-blue-600'
            : 'text-rose-600';

    const badgeClass = isTimeIn
        ? isLate
            ? 'border-amber-200 bg-amber-100 text-amber-700'
            : 'border-emerald-200 bg-emerald-100 text-emerald-700'
        : isOvertime
            ? 'border-blue-200 bg-blue-100 text-blue-700'
            : 'border-rose-200 bg-rose-100 text-rose-700';

    const focusClass = isTimeIn
        ? isLate
            ? 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500'
            : 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500'
        : isOvertime
            ? 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500'
            : 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500';

    const confirmButtonClass = isTimeIn
        ? isLate
            ? 'bg-amber-500 hover:bg-amber-600'
            : 'bg-emerald-500 hover:bg-emerald-600'
        : isOvertime
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-rose-500 hover:bg-rose-600';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md animate-fade-in-up rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 transition-colors hover:text-gray-600"
                        disabled={submitting}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-6 flex flex-col items-center justify-center">
                    <div
                        className={`flex w-full flex-col items-center justify-center rounded-xl border p-4 ${panelClass}`}
                    >
                        <div className="mb-2 flex items-center gap-2">
                            <p className={`text-sm font-black uppercase tracking-wider ${headingClass}`}>
                                Time to Record
                            </p>

                            <span
                                className={`rounded-full border px-2 py-1 text-[10px] font-bold ${badgeClass}`}
                            >
                                {status}
                            </span>
                        </div>

                        <p className={`font-mono text-5xl font-black tracking-tight ${timeClass}`}>
                            {currentTime.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="mb-2 block text-sm font-bold text-gray-700">{label}</label>
                    <textarea
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className={`h-28 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none placeholder:text-gray-400 ${focusClass}`}
                        placeholder={placeholder}
                        disabled={submitting}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-xl bg-gray-100 px-5 py-2.5 font-bold text-gray-600 transition-colors hover:bg-gray-200"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`rounded-xl px-5 py-2.5 font-bold text-white transition-colors ${confirmButtonClass}`}
                        disabled={submitting}
                    >
                        {submitting ? savingLabel : confirmLabel}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TimeRecordModal;
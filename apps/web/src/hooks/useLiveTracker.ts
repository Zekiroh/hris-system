import { useEffect, useMemo, useRef, useState } from 'react';

type UseLiveTrackerOptions = {
    startAtHour: number;
    startAtMinute: number;
    stopAtHour: number;
    stopAtMinute: number;
    overtimeStartHour: number;
    overtimeStartMinute: number;
};

type UseLiveTrackerReturn = {
    currentTime: Date;
    displayTime: Date;
    frozenTimeOut: Date | null;
    isBeforeStart: boolean;
    isBreakTime: boolean;
    isAfterRegularHours: boolean;
};

const createTime = (hour: number, minute: number) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    return d;
};

const useLiveTracker = ({
    startAtHour,
    startAtMinute,
    stopAtHour,
    stopAtMinute,
    overtimeStartHour,
    overtimeStartMinute,
}: UseLiveTrackerOptions): UseLiveTrackerReturn => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [displayTime, setDisplayTime] = useState(new Date());

    // kept for compatibility with existing props/UI usage
    const frozenTimeOut = null;

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startTime = useMemo(
        () => createTime(startAtHour, startAtMinute),
        [startAtHour, startAtMinute]
    );

    const breakStart = useMemo(() => createTime(12, 0), []);
    const breakEnd = useMemo(() => createTime(13, 0), []);

    const overtimeStart = useMemo(
        () => createTime(overtimeStartHour, overtimeStartMinute),
        [overtimeStartHour, overtimeStartMinute]
    );

    // kept intentionally because the hook signature still accepts it
    // and we may use it later for a safety cap rule
    void stopAtHour;
    void stopAtMinute;

    const isBeforeStart = currentTime < startTime;
    const isBreakTime = currentTime >= breakStart && currentTime < breakEnd;
    const isAfterRegularHours = currentTime >= overtimeStart;

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setDisplayTime(now);
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    return {
        currentTime,
        displayTime,
        frozenTimeOut,
        isBeforeStart,
        isBreakTime,
        isAfterRegularHours,
    };
};

export default useLiveTracker;
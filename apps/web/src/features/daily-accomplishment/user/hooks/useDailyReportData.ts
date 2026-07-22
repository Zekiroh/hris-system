import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    getMyDailyReports,
    type DailyReportDto,
    type GetDailyReportsQuery,
} from "../../../lib/dailyReports";

type DailyReportQuery = Omit<GetDailyReportsQuery, "employeeId">;

export const useDailyReportData = (query?: DailyReportQuery) => {
    const [reports, setReports] = useState<DailyReportDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(false);
    const requestIdRef = useRef(0);
    const queryDate = query?.date;
    const queryPage = query?.page;
    const queryPageSize = query?.pageSize;

    const stableQuery = useMemo<DailyReportQuery | undefined>(() => {
        if (
            queryDate === undefined &&
            queryPage === undefined &&
            queryPageSize === undefined
        ) {
            return undefined;
        }

        const nextQuery: DailyReportQuery = {};

        if (queryDate !== undefined) nextQuery.date = queryDate;
        if (queryPage !== undefined) nextQuery.page = queryPage;
        if (queryPageSize !== undefined) nextQuery.pageSize = queryPageSize;

        return nextQuery;
    }, [queryDate, queryPage, queryPageSize]);

    const refresh = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getMyDailyReports(stableQuery);

            if (!isMountedRef.current || requestId !== requestIdRef.current) return;

            setReports(data);
        } catch (err) {
            if (!isMountedRef.current || requestId !== requestIdRef.current) return;

            setError(
                err instanceof Error ? err.message : "Unable to load daily reports."
            );
        } finally {
            if (isMountedRef.current && requestId === requestIdRef.current) {
                setIsLoading(false);
            }
        }
    }, [stableQuery]);

    useEffect(() => {
        isMountedRef.current = true;
        void refresh();

        return () => {
            isMountedRef.current = false;
            requestIdRef.current += 1;
        };
    }, [refresh]);

    return {
        reports,
        isLoading,
        error,
        refresh,
    };
};

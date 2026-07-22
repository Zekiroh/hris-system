import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    getDailyReports,
    type DailyReportDto,
    type GetDailyReportsQuery,
} from "../../../lib/dailyReports";

export const useAdminDailyReportData = (query?: GetDailyReportsQuery) => {
    const [reports, setReports] = useState<DailyReportDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(false);
    const requestIdRef = useRef(0);
    const queryEmployeeId = query?.employeeId;
    const queryDate = query?.date;
    const queryPage = query?.page;
    const queryPageSize = query?.pageSize;

    const stableQuery = useMemo<GetDailyReportsQuery | undefined>(() => {
        if (
            queryEmployeeId === undefined &&
            queryDate === undefined &&
            queryPage === undefined &&
            queryPageSize === undefined
        ) {
            return undefined;
        }

        const nextQuery: GetDailyReportsQuery = {};

        if (queryEmployeeId !== undefined) nextQuery.employeeId = queryEmployeeId;
        if (queryDate !== undefined) nextQuery.date = queryDate;
        if (queryPage !== undefined) nextQuery.page = queryPage;
        if (queryPageSize !== undefined) nextQuery.pageSize = queryPageSize;

        return nextQuery;
    }, [queryEmployeeId, queryDate, queryPage, queryPageSize]);

    const refresh = useCallback(async () => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;

        setIsLoading(true);
        setError(null);

        try {
            const data = await getDailyReports(stableQuery);

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

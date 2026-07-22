import { useCallback, useEffect, useRef, useState } from "react";
import {
    createDailyReport,
    updateDailyReport,
    type DailyReportDto,
    type CreateDailyReportRequest,
    type UpdateDailyReportRequest,
} from "../../../../lib/dailyReports";

export const useDailyReportWorkflow = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const submitReport = useCallback(
        async (request: CreateDailyReportRequest): Promise<DailyReportDto> => {
            if (isMountedRef.current) {
                setError(null);
                setIsSubmitting(true);
            }

            try {
                return await createDailyReport(request);
            } catch (err) {
                if (isMountedRef.current) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to submit daily report."
                    );
                }

                throw err;
            } finally {
                if (isMountedRef.current) {
                    setIsSubmitting(false);
                }
            }
        },
        []
    );

    const updateReport = useCallback(
        async (
            id: number,
            request: UpdateDailyReportRequest
        ): Promise<DailyReportDto> => {
            if (isMountedRef.current) {
                setError(null);
                setIsUpdating(true);
            }

            try {
                return await updateDailyReport(id, request);
            } catch (err) {
                if (isMountedRef.current) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to update daily report."
                    );
                }

                throw err;
            } finally {
                if (isMountedRef.current) {
                    setIsUpdating(false);
                }
            }
        },
        []
    );

    return {
        isSubmitting,
        isUpdating,
        error,
        submitReport,
        updateReport,
    };
};

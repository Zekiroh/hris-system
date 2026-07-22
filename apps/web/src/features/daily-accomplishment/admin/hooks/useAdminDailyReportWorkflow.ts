import { useCallback, useEffect, useRef, useState } from "react";
import {
    updateDailyReportSupervisorRemarks,
    type DailyReportDto,
    type SupervisorRemarksRequest,
} from "../../../../lib/dailyReports";

export const useAdminDailyReportWorkflow = () => {
    const [isSavingReview, setIsSavingReview] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(false);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const saveSupervisorRemarks = useCallback(
        async (
            id: number,
            request: SupervisorRemarksRequest
        ): Promise<DailyReportDto> => {
            if (isMountedRef.current) {
                setError(null);
                setIsSavingReview(true);
            }

            try {
                return await updateDailyReportSupervisorRemarks(id, request);
            } catch (err) {
                if (isMountedRef.current) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to save supervisor remarks."
                    );
                }

                throw err;
            } finally {
                if (isMountedRef.current) {
                    setIsSavingReview(false);
                }
            }
        },
        []
    );

    return {
        isSavingReview,
        error,
        saveSupervisorRemarks,
    };
};

import { useCallback, useEffect, useState } from 'react';
import { getMyClearance } from '../../../../lib/clearance';
import type { ClearanceDto } from '../../../../lib/clearance';

export const useUserClearanceData = () => {
    const [clearance, setClearance] = useState<ClearanceDto | null>(null);
    const [isLoadingClearance, setIsLoadingClearance] = useState(false);
    const [clearanceError, setClearanceError] = useState('');

    const loadClearance = useCallback(async () => {
        setIsLoadingClearance(true);
        setClearanceError('');

        try {
            const data = await getMyClearance();
            setClearance(data);
        } catch (error) {
            setClearanceError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load your clearance record.'
            );
        } finally {
            setIsLoadingClearance(false);
        }
    }, []);

    useEffect(() => {
        void loadClearance();
    }, [loadClearance]);

    return {
        clearance,
        isLoadingClearance,
        clearanceError,
        loadClearance,
    };
};

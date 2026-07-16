import { useCallback, useEffect, useState } from 'react';
import { getClearances } from '../../../lib/clearance';
import type { ClearanceDto } from '../../../lib/clearance';

export const useAdminClearanceData = () => {
    const [clearances, setClearances] = useState<ClearanceDto[]>([]);
    const [isLoadingClearances, setIsLoadingClearances] = useState(false);
    const [clearanceError, setClearanceError] = useState('');

    const loadClearances = useCallback(async () => {
        setIsLoadingClearances(true);
        setClearanceError('');

        try {
            const data = await getClearances();
            setClearances(data);
        } catch (error) {
            setClearanceError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load clearance records.'
            );
        } finally {
            setIsLoadingClearances(false);
        }
    }, []);

    useEffect(() => {
        void loadClearances();
    }, [loadClearances]);

    return {
        clearances,
        isLoadingClearances,
        clearanceError,
        loadClearances,
    };
};

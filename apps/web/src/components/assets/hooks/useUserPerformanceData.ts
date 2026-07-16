import { useCallback, useEffect, useState } from 'react';
import { getMyPerformanceEvaluations } from '../../../lib/performance';
import type { PerformanceEvaluationDto } from '../../../lib/performance';

export const useUserPerformanceData = () => {
    const [evaluations, setEvaluations] = useState<PerformanceEvaluationDto[]>([]);
    const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
    const [evaluationError, setEvaluationError] = useState('');

    const loadEvaluations = useCallback(async () => {
        setIsLoadingEvaluations(true);
        setEvaluationError('');

        try {
            const data = await getMyPerformanceEvaluations();
            setEvaluations(data);
        } catch (error) {
            setEvaluationError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load your performance evaluations.'
            );
        } finally {
            setIsLoadingEvaluations(false);
        }
    }, []);

    useEffect(() => {
        void loadEvaluations();
    }, [loadEvaluations]);

    return {
        evaluations,
        isLoadingEvaluations,
        evaluationError,
        loadEvaluations,
    };
};

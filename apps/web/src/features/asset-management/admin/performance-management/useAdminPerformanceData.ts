import { useCallback, useEffect, useState } from 'react';
import { getPerformanceEvaluations } from '../../../../lib/performance';
import type { PerformanceEvaluationDto } from '../../../../lib/performance';

export const useAdminPerformanceData = () => {
    const [evaluations, setEvaluations] = useState<PerformanceEvaluationDto[]>([]);
    const [isLoadingEvaluations, setIsLoadingEvaluations] = useState(false);
    const [evaluationError, setEvaluationError] = useState('');

    const loadEvaluations = useCallback(async () => {
        setIsLoadingEvaluations(true);
        setEvaluationError('');

        try {
            const data = await getPerformanceEvaluations();
            setEvaluations(data);
        } catch (error) {
            setEvaluationError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load performance evaluations.'
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

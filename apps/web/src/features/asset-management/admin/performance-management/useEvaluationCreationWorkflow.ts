import { useState } from 'react';
import { createPerformanceEvaluation } from '../../../../services/api/performance/performance';
import { getRatingFromScore, initialEvaluationForm, kpiCriteria } from '../../assetManagementConfig';
import type { EvaluationForm } from '../../assetManagementTypes';

type UseEvaluationCreationWorkflowParams = {
    loadEvaluations: () => Promise<void>;
    closeAddEvaluationModal: () => void;
};

export const useEvaluationCreationWorkflow = ({
    loadEvaluations,
    closeAddEvaluationModal,
}: UseEvaluationCreationWorkflowParams) => {
    const [evaluationForm, setEvaluationForm] = useState<EvaluationForm>(initialEvaluationForm);
    const [isSavingEvaluation, setIsSavingEvaluation] = useState(false);
    const [evaluationFormError, setEvaluationFormError] = useState('');

    const computeWeightedScore = (kpiScores: Record<string, number>) => {
        const totalWeight = kpiCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
        const weightedSum = kpiCriteria.reduce(
            (sum, criterion) => sum + (kpiScores[criterion.key] ?? 0) * criterion.weight,
            0
        );
        return Number((weightedSum / totalWeight).toFixed(2));
    };

    const handleKpiScoreChange = (key: string, value: number) => {
        setEvaluationForm(current => ({
            ...current,
            kpiScores: { ...current.kpiScores, [key]: value },
        }));
    };

    const handleAddEvaluation = async () => {
        if (!evaluationForm.employeeId || !evaluationForm.reviewPeriod.trim()) {
            setEvaluationFormError('Please select an employee and enter a review period.');
            return;
        }

        setIsSavingEvaluation(true);
        setEvaluationFormError('');

        try {
            const score = computeWeightedScore(evaluationForm.kpiScores);
            const rating = getRatingFromScore(score);

            // Note: reviewerName and the KPI breakdown are not part of
            // CreatePerformanceEvaluationRequest. Reviewer is set server-side
            // from the authenticated user; only the computed score/rating persist.
            await createPerformanceEvaluation({
                employeeId: evaluationForm.employeeId,
                reviewPeriod: evaluationForm.reviewPeriod.trim(),
                score,
                rating,
                remarks: evaluationForm.remarks.trim() || null,
            });

            await loadEvaluations();
            setEvaluationForm(initialEvaluationForm);
            closeAddEvaluationModal();
        } catch (error) {
            setEvaluationFormError(
                error instanceof Error ? error.message : 'Unable to save performance evaluation.'
            );
        } finally {
            setIsSavingEvaluation(false);
        }
    };

    return {
        evaluationForm,
        setEvaluationForm,
        isSavingEvaluation,
        evaluationFormError,
        computeWeightedScore,
        handleKpiScoreChange,
        handleAddEvaluation,
    };
};
import { Plus } from 'lucide-react';
import AdminEvaluationTable from './AdminEvaluationTable';
import type { PerformanceEvaluationDto } from '../../../../services/api/performance/performance';

type AdminEvaluationTabProps = {
    evaluations: PerformanceEvaluationDto[];
    isLoadingEvaluations: boolean;
    evaluationError: string;
    onNewEvaluation: () => void;
};

const AdminEvaluationTab = ({
    evaluations,
    isLoadingEvaluations,
    evaluationError,
    onNewEvaluation,
}: AdminEvaluationTabProps) => {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Performance Evaluation Results</h3>
                <button onClick={onNewEvaluation} className="btn btn-primary flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    New Evaluation
                </button>
            </div>

            {isLoadingEvaluations && (
                <div className="rounded-xl border border-gray-100 p-6 text-sm text-gray-600">
                    Loading performance evaluations...
                </div>
            )}

            {!isLoadingEvaluations && evaluationError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                    {evaluationError}
                </div>
            )}

            {!isLoadingEvaluations && !evaluationError && evaluations.length === 0 && (
                <div className="rounded-xl border border-gray-100 p-6 text-sm text-gray-600">
                    No performance evaluations are available yet.
                </div>
            )}

            {!isLoadingEvaluations && !evaluationError && evaluations.length > 0 && (
                <AdminEvaluationTable evaluations={evaluations} />
            )}
        </div>
    );
};

export default AdminEvaluationTab;
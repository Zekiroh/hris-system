import AdminEvaluationTable from '../AdminEvaluationTable';
import type { PerformanceEvaluationDto } from '../../../lib/performance';

type AdminEvaluationTabProps = {
    evaluations: PerformanceEvaluationDto[];
    isLoadingEvaluations: boolean;
    evaluationError: string;
};

const AdminEvaluationTab = ({
    evaluations,
    isLoadingEvaluations,
    evaluationError,
}: AdminEvaluationTabProps) => {
    return (
        <div className="space-y-5">
            <h3 className="text-base font-bold text-gray-800">Performance Evaluation Results</h3>
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

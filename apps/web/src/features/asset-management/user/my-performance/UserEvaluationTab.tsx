import UserEvaluationHistoryCard from "./UserEvaluationHistoryCard";
import UserEvaluationSummaryCard from "./UserEvaluationSummaryCard";
import type { EvaluationRecord } from "../../assetManagementTypes";

type UserEvaluationTabProps = {
  evaluations: EvaluationRecord[];
  loading: boolean;
  error: string;
  expandedEval: number | null;
  onToggleEvaluation: (index: number) => void;
};

const UserEvaluationTab = ({
  evaluations,
  loading,
  error,
  expandedEval,
  onToggleEvaluation,
}: UserEvaluationTabProps) => {
  const latestEvaluation = evaluations[0];

  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-gray-800">
        Performance Evaluation
      </h3>

      {loading && (
        <div className="pro-card !shadow-none border border-gray-100 !p-5">
          <p className="text-sm font-semibold text-gray-500">
            Loading your performance evaluations...
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="pro-card !shadow-none border border-red-100 !p-5 bg-red-50">
          <p className="text-sm font-semibold text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && latestEvaluation && (
        <UserEvaluationSummaryCard evaluation={latestEvaluation} />
      )}

      {!loading && !error && !latestEvaluation && (
        <div className="pro-card !shadow-none border border-gray-100 !p-5">
          <p className="text-sm font-semibold text-gray-500">
            No performance evaluations are available yet.
          </p>
        </div>
      )}

      {/* History */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Evaluation History
        </p>
        <div className="space-y-2">
          {!loading && !error && evaluations.length === 0 && (
            <div className="pro-card !shadow-none border border-gray-100 !p-4">
              <p className="text-sm text-gray-500">
                Your evaluation history is empty.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            evaluations.map((ev, i) => (
              <UserEvaluationHistoryCard
                key={`${ev.period}-${ev.date}-${i}`}
                evaluation={ev}
                index={i}
                isExpanded={expandedEval === i}
                onToggle={onToggleEvaluation}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserEvaluationTab;

import UserEvaluationHistoryCard from "../UserEvaluationHistoryCard";
import UserEvaluationSummaryCard from "../UserEvaluationSummaryCard";
import type { EvaluationRecord } from "../assetManagementTypes";

type UserEvaluationTabProps = {
  evaluations: EvaluationRecord[];
  expandedEval: number | null;
  onToggleEvaluation: (index: number) => void;
};

const UserEvaluationTab = ({
  evaluations,
  expandedEval,
  onToggleEvaluation,
}: UserEvaluationTabProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-gray-800">
        Performance Evaluation
      </h3>

      {/* Latest evaluation */}
      <UserEvaluationSummaryCard evaluation={evaluations[0]} />

      {/* History */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Evaluation History
        </p>
        <div className="space-y-2">
          {evaluations.map((ev, i) => (
            <UserEvaluationHistoryCard
              key={i}
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

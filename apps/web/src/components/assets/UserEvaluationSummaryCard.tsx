import { ratingBadge } from "./assetManagementConfig";
import type { EvaluationRecord } from "./assetManagementTypes";

type UserEvaluationSummaryCardProps = {
  evaluation: EvaluationRecord;
};

const UserEvaluationSummaryCard = ({
  evaluation,
}: UserEvaluationSummaryCardProps) => {
  return (
    <div
      className="pro-card !shadow-none border border-blue-100 !p-5"
      style={{
        background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
      }}
    >
      <p className="text-xs font-bold text-blue-400 uppercase tracking-wide mb-1">
        Latest Evaluation
      </p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-black text-gray-800">
            {evaluation.score}
            <span className="text-sm font-medium text-gray-400">
              /{evaluation.maxScore}
            </span>
          </p>
          <span className={`badge ${ratingBadge[evaluation.rating]} mt-1`}>
            <span className="badge-dot" />
            {evaluation.rating}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{evaluation.period}</p>
          <p className="text-xs text-gray-400">{evaluation.reviewer}</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-purple-100">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
          Supervisor Remarks
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          {evaluation.remarks}
        </p>
      </div>
    </div>
  );
};

export default UserEvaluationSummaryCard;

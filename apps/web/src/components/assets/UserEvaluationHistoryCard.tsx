import { ChevronRight } from "lucide-react";
import { ratingBadge } from "./assetManagementConfig";
import { scoreColor } from "./assetManagementHelpers";
import type { EvaluationRecord } from "./assetManagementTypes";

type UserEvaluationHistoryCardProps = {
  evaluation: EvaluationRecord;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
};

const UserEvaluationHistoryCard = ({
  evaluation,
  index,
  isExpanded,
  onToggle,
}: UserEvaluationHistoryCardProps) => {
  return (
    <div className="pro-card !shadow-none border border-gray-100 !p-4">
      <button
        className="w-full flex items-center justify-between"
        onClick={() => onToggle(index)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black"
            style={{
              background: scoreColor(evaluation.score, evaluation.maxScore),
            }}
          >
            {evaluation.score}
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-gray-800">
              {evaluation.period}
            </p>
            <p className="text-xs text-gray-400">
              {evaluation.date} • {evaluation.reviewer}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${ratingBadge[evaluation.rating]}`}>
            <span className="badge-dot" />
            {evaluation.rating}
          </span>
          <ChevronRight
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Remarks
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {evaluation.remarks}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserEvaluationHistoryCard;

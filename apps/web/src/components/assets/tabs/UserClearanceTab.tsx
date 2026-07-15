import UserClearanceChecklistItem from "../UserClearanceChecklistItem";
import UserClearanceProgressCard from "../UserClearanceProgressCard";
import type { ChecklistItem } from "../assetManagementTypes";

type UserClearanceTabProps = {
  checklist: ChecklistItem[];
  completedCount: number;
  progressPct: number;
  clearanceStatus: string;
};

const UserClearanceTab = ({
  checklist,
  completedCount,
  progressPct,
  clearanceStatus,
}: UserClearanceTabProps) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">
          My Clearance Status
        </h3>
        <span
          className={`badge ${clearanceStatus === "Completed" ? "badge-success" : "badge-warning"}`}
        >
          <span className="badge-dot" />
          {clearanceStatus}
        </span>
      </div>

      {/* Progress Bar */}
      <UserClearanceProgressCard
        completedCount={completedCount}
        totalCount={checklist.length}
        progressPct={progressPct}
      />

      {/* Checklist */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
          Clearance Checklist
        </p>
        {checklist.map((item) => (
          <UserClearanceChecklistItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
};

export default UserClearanceTab;

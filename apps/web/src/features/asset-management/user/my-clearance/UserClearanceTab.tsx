import UserClearanceChecklistItem from "./UserClearanceChecklistItem";
import UserClearanceProgressCard from "./UserClearanceProgressCard";
import type { ChecklistItem } from "../../assetManagementTypes";

type UserClearanceTabProps = {
  checklist: ChecklistItem[];
  completedCount: number;
  progressPct: number;
  clearanceStatus: string;
  loading: boolean;
  error: string;
  hasRecord: boolean;
};

const UserClearanceTab = ({
  checklist,
  completedCount,
  progressPct,
  clearanceStatus,
  loading,
  error,
  hasRecord,
}: UserClearanceTabProps) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-800">
          My Clearance Status
        </h3>
        {hasRecord && (
          <span
            className={`badge ${clearanceStatus === "Completed" ? "badge-success" : "badge-warning"}`}
          >
            <span className="badge-dot" />
            {clearanceStatus}
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          Loading clearance record...
        </div>
      )}

      {!loading && !error && !hasRecord && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          No clearance record is available.
        </div>
      )}

      {!loading && !error && hasRecord && (
        <>
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
        </>
      )}
    </div>
  );
};

export default UserClearanceTab;

import { CheckCircle } from "lucide-react";
import type { LeaveRequestRow, StatusBadgeMap } from "./LeaveTableTypes";

interface LeaveHistoryTableProps {
  requests: LeaveRequestRow[];
  statusBadge: StatusBadgeMap;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}

const DEFAULT_PAGE_SIZE = 10;

const createPlaceholderRow = (id: number): LeaveRequestRow => ({
  id,
  employee: "",
  department: "",
  leaveType: "",
  startDate: "--",
  endDate: "--",
  days: 0,
  reason: "",
  status: "Approved",
});

const LeaveHistoryTable = ({
  requests,
  statusBadge,
  page,
  totalPages,
  onPrev,
  onNext,
}: LeaveHistoryTableProps) => {
  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = safePage > 1;
  const canNext = safePage < safeTotalPages;
  const hasRecords = requests.length > 0;

  const dataRows = hasRecords
    ? [
        ...requests,
        ...Array.from(
          { length: Math.max(0, DEFAULT_PAGE_SIZE - requests.length) },
          (_, i) => createPlaceholderRow(-(i + 1))
        ),
      ]
    : Array.from({ length: DEFAULT_PAGE_SIZE }, (_, i) =>
        createPlaceholderRow(-(i + 1))
      );

  return (
    <div>
      <div className="flex items-start gap-2.5 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-emerald-600">
          Your leave history showing only finalized (approved or rejected)
          requests.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table w-full">
          <thead>
            <tr>
              {["Leave Type", "Start Date", "End Date", "Days", "Status"].map(
                (h) => (
                  <th key={h}>{h}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {!hasRecords && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400 italic">
                  No leave history yet.
                </td>
              </tr>
            )}

            {hasRecords &&
              dataRows.map((r) => {
                const isPlaceholder = r.id < 0;

                return (
                  <tr key={isPlaceholder ? `placeholder-${r.id}` : r.id}>
                    <td className={isPlaceholder ? "text-gray-300" : "!font-medium"}>
                      {isPlaceholder ? "--" : r.leaveType}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.startDate}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.endDate}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : "font-semibold"}>
                      {isPlaceholder ? "--" : r.days}
                    </td>
                    <td>
                      {isPlaceholder ? (
                        <span className="text-gray-300">--</span>
                      ) : (
                        <span className={`badge ${statusBadge[r.status]}`}>
                          <span className="badge-dot" />
                          {r.status}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {hasRecords && (
        <div className="flex items-center justify-between border-t border-gray-100 px-2 py-4">
          <button className="btn btn-secondary" onClick={onPrev} disabled={!canPrev}>
            Prev
          </button>

          <div className="text-sm text-gray-500">
            Page {safePage} of {safeTotalPages}
          </div>

          <button className="btn btn-secondary" onClick={onNext} disabled={!canNext}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryTable;

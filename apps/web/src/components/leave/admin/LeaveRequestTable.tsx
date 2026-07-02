import { Edit, Trash2 } from "lucide-react";
import type { LeaveRequest } from "../../../context/LeaveContext";
import type { StatusBadgeMap } from "./LeaveTableTypes";

interface LeaveRequestTableProps {
  requests: LeaveRequest[];
  statusBadge: StatusBadgeMap;
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onReview: (request: LeaveRequest) => void;
  onDelete: (id: number) => void;
}

const DEFAULT_PAGE_SIZE = 10;

const createPlaceholderRow = (id: number): LeaveRequest => ({
  id,
  employee: "",
  department: "",
  leaveType: "",
  startDate: "--",
  endDate: "--",
  days: 0,
  reason: "",
  status: "Pending",
});

const LeaveRequestTable = ({
  requests,
  statusBadge,
  page,
  totalPages,
  onPrev,
  onNext,
  onReview,
  onDelete,
}: LeaveRequestTableProps) => {
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
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Employee",
                "Leave Type",
                "Start Date",
                "End Date",
                "Days",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hasRecords && (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-500 italic">
                  No leave requests found.
                </td>
              </tr>
            )}

            {hasRecords &&
              dataRows.map((r) => {
                const isPlaceholder = r.id < 0;

                return (
                  <tr key={isPlaceholder ? `placeholder-${r.id}` : r.id}>
                    <td className={isPlaceholder ? "text-gray-300" : "!font-medium !text-gray-800"}>
                      {isPlaceholder ? "--" : r.employee}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {isPlaceholder ? "--" : r.leaveType}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.startDate}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      {r.endDate}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : "!font-semibold"}>
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
                    <td>
                      {isPlaceholder ? (
                        <span className="text-gray-300">--</span>
                      ) : (
                        <div className="flex gap-1">
                          {r.status === "Pending" ? (
                            <button
                              onClick={() => onReview(r)}
                              className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                              title="Review Request"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              className="btn-ghost btn-icon text-gray-300 cursor-not-allowed"
                              title="Already reviewed"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onDelete(r.id)}
                            className="btn-ghost btn-icon text-rose-500 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

export default LeaveRequestTable;

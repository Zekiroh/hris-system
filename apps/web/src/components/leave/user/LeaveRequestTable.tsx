import { CalendarDays, Info } from "lucide-react";
import type { LeaveRequestRow, StatusBadgeMap } from "./LeaveTableTypes";
import { formatLeaveDate, getLeaveTypeColor, getLeaveTypeIcon } from "./LeaveTableUtils";

interface LeaveRequestTableProps {
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
  status: "Pending",
});

const LeaveRequestTable = ({
  requests,
  statusBadge,
  page,
  totalPages,
  onPrev,
  onNext,
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
      <div className="flex items-start gap-2.5 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-600">
          Only your own leave requests are shown here. Other
          employees&apos; leave information is not visible for privacy
          reasons.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table w-full">
          <thead>
            <tr>
              {[
                "Leave Type",
                "Start Date",
                "End Date",
                "Days",
                "Reason",
                "Status",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!hasRecords && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-400 italic">
                  No leave requests yet.
                </td>
              </tr>
            )}

            {hasRecords &&
              dataRows.map((r) => {
                const isPlaceholder = r.id < 0;

                return (
                  <tr key={isPlaceholder ? `placeholder-${r.id}` : r.id}>
                    <td className={isPlaceholder ? "text-gray-300" : "!font-medium"}>
                      {isPlaceholder ? (
                        "--"
                      ) : (
                        (() => {
                          const LeaveTypeIcon = getLeaveTypeIcon(r.leaveType);
                          return (
                            <div className="flex items-center gap-2">
                              <LeaveTypeIcon
                                className={`h-4 w-4 shrink-0 ${getLeaveTypeColor(r.leaveType)}`}
                              />
                              <span>{r.leaveType}</span>
                            </div>
                          );
                        })()
                      )}
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className={`h-4 w-4 shrink-0 ${
                            isPlaceholder ? "text-gray-300" : "text-slate-400"
                          }`}
                        />
                        <span>{formatLeaveDate(r.startDate)}</span>
                      </div>
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : undefined}>
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          className={`h-4 w-4 shrink-0 ${
                            isPlaceholder ? "text-gray-300" : "text-slate-400"
                          }`}
                        />
                        <span>{formatLeaveDate(r.endDate)}</span>
                      </div>
                    </td>
                    <td className={isPlaceholder ? "text-gray-300" : "font-semibold"}>
                      {isPlaceholder ? "--" : r.days}
                    </td>
                    <td
                      className={
                        isPlaceholder
                          ? "text-gray-300"
                          : "text-gray-500 text-xs max-w-[150px] truncate"
                      }
                      title={isPlaceholder ? undefined : r.reason}
                    >
                      {isPlaceholder ? "--" : r.reason || "-"}
                    </td>
                    <td>
                      {isPlaceholder ? (
                        <span className="text-gray-300">--</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`badge ${statusBadge[r.status]}`}>
                            <span className="badge-dot" />
                            {r.status}
                          </span>
                          {r.status === "Pending" && (
                            <span className="text-[10px] text-amber-600 font-medium whitespace-nowrap">
                              Awaiting Approval
                            </span>
                          )}
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

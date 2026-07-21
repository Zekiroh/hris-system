import { useMemo, useState } from "react";
import { CalendarDays, X } from "lucide-react";
import type { BalanceHistoryRow } from "../LeaveTableTypes";
import { formatLeaveDate } from "../LeaveTableUtils";

interface BalanceHistoryModalProps {
  show: boolean;
  employeeName: string | null;
  rows: BalanceHistoryRow[];
  onClose: () => void;
}

const PAGE_SIZE = 10;

const BalanceHistoryModal = ({
  show,
  employeeName,
  rows,
  onClose,
}: BalanceHistoryModalProps) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, safePage]);

  if (!show || !employeeName) return null;
  const canPrev = safePage > 1;
  const canNext = safePage < totalPages;

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Leave Balance History</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body">
          <p className="text-sm text-gray-500 mb-4 font-medium">{employeeName}</p>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="pro-table w-full">
              <thead>
                <tr>
                  {["Date", "Leave Type", "Action", "Days"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                      No balance history yet.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>{formatLeaveDate(r.date)}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{r.leaveType}</td>
                      <td className="whitespace-nowrap">
                        <span
                          className={`badge ${
                            r.action === "Used" ? "badge-danger" : "badge-success"
                          }`}
                        >
                          <span className="badge-dot" />
                          {r.action}
                        </span>
                      </td>
                      <td className="!font-semibold whitespace-nowrap">{r.days}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {rows.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))
                }
                disabled={!canPrev}
              >
                Prev
              </button>

              <div className="text-sm text-gray-500">
                Page {safePage} of {totalPages}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))
                }
                disabled={!canNext}
              >
                Next
              </button>
            </div>
          )}
        </div>

        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalanceHistoryModal;

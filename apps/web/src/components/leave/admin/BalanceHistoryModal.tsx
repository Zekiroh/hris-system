import { X } from "lucide-react";
import type { BalanceHistoryRow } from "./LeaveTableTypes";

interface BalanceHistoryModalProps {
  show: boolean;
  employeeName: string | null;
  rows: BalanceHistoryRow[];
  onClose: () => void;
}

const BalanceHistoryModal = ({
  show,
  employeeName,
  rows,
  onClose,
}: BalanceHistoryModalProps) => {
  if (!show || !employeeName) return null;

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Leave Balance History</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body">
          <p className="text-sm text-gray-500 mb-4 font-medium">{employeeName}</p>

          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <table className="pro-table">
              <thead>
                <tr>
                  {["Date", "Leave Type", "Action", "Days"].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.leaveType}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.action === "Used" ? "badge-danger" : "badge-success"
                        }`}
                      >
                        <span className="badge-dot" />
                        {r.action}
                      </span>
                    </td>
                    <td className="!font-semibold">{r.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

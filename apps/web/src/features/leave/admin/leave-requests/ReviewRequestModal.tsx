import { createElement } from "react";
import { Ban, CalendarDays, CheckSquare, User, X } from "lucide-react";
import type { LeaveRequest } from "../../context/LeaveContext.shared";
import {
  formatLeaveDate,
  getLeaveTypeColor,
  getLeaveTypeIcon,
} from "../LeaveTableUtils";

interface ReviewRequestModalProps {
  show: boolean;
  request: LeaveRequest | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

const ReviewRequestModal = ({
  show,
  request,
  onClose,
  onApprove,
  onReject,
}: ReviewRequestModalProps) => {
  if (!show || !request) return null;

  const leaveTypeIcon = getLeaveTypeIcon(request.leaveType);

  return (
    <div className="pro-modal-overlay" onClick={onClose}>
      <div
        className="pro-modal w-[calc(100vw-2rem)] max-w-md sm:w-full max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Review Leave Request</h3>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost btn-icon"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 shrink-0 text-slate-400" />

              <h4 className="text-sm font-bold text-gray-800 break-words">
                {request.employee}
              </h4>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex shrink-0 items-center gap-2 text-gray-500 font-medium">
                  {createElement(leaveTypeIcon, {
                    className: `w-4 h-4 shrink-0 ${getLeaveTypeColor(
                      request.leaveType
                    )}`,
                  })}
                  Leave Type:
                </span>

                <span className="font-semibold text-gray-800 break-words sm:text-right">
                  {request.leaveType}
                </span>
              </div>

              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <span className="flex shrink-0 items-center gap-2 text-gray-500 font-medium">
                  <CalendarDays className="w-4 h-4 shrink-0 text-slate-400" />
                  Duration:
                </span>

                <span className="font-semibold text-gray-800 break-words sm:text-right">
                  {formatLeaveDate(request.startDate)} to{" "}
                  {formatLeaveDate(request.endDate)} ({request.days} days)
                </span>
              </div>

              <div className="flex flex-col mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-medium mb-1">
                  Reason:
                </span>

                <span className="text-gray-700 italic text-xs bg-white p-2 rounded border border-gray-100 break-words">
                  {request.reason || "No reason provided."}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Choose an action below to finalize this leave request. The employee
            will be notified.
          </p>
        </div>

        <div className="pro-modal-footer flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary flex-1 sm:flex-none"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onReject}
            className="btn flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, #dc2626, #ef4444)",
            }}
          >
            <Ban className="w-4 h-4" />
            Deny
          </button>

          <button
            type="button"
            onClick={onApprove}
            className="btn flex flex-1 sm:flex-none items-center justify-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, #059669, #10b981)",
            }}
          >
            <CheckSquare className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestModal;

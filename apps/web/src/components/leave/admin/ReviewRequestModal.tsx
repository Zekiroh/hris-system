import { Ban, CheckSquare, X } from "lucide-react";
import type { LeaveRequest } from "../../../context/LeaveContext";

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

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Review Leave Request</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body space-y-4 pt-4">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h4 className="text-sm font-bold text-gray-800 mb-1">
              {request.employee}
            </h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Leave Type:</span>
                <span className="font-semibold text-gray-800">
                  {request.leaveType}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Duration:</span>
                <span className="font-semibold text-gray-800">
                  {request.startDate} to {request.endDate} ({request.days} days)
                </span>
              </div>

              <div className="flex justify-between flex-col mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-500 font-medium mb-1">Reason:</span>
                <span className="text-gray-700 italic text-xs bg-white p-2 rounded border border-gray-100">
                  {request.reason || "No reason provided."}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Choose an action below to finalize this leave request. The employee will be notified.
          </p>
        </div>

        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>

          <button
            onClick={onReject}
            className="btn flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
          >
            <Ban className="w-4 h-4" /> Deny
          </button>

          <button
            onClick={onApprove}
            className="btn flex items-center gap-1.5 text-white font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            <CheckSquare className="w-4 h-4" /> Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRequestModal;
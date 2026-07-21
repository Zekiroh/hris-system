import { Info, User, X } from "lucide-react";

export interface ApplyLeaveFormState {
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
}

interface ApplyLeaveModalProps {
  show: boolean;
  currentUserName: string;
  form: ApplyLeaveFormState;
  onChange: (form: ApplyLeaveFormState) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const ApplyLeaveModal = ({
  show,
  currentUserName,
  form,
  onChange,
  onClose,
  onSubmit,
}: ApplyLeaveModalProps) => {
  if (!show) return null;

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Apply for Leave</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body space-y-4">
          <div className="bg-emerald-50 text-emerald-800 text-sm px-4 py-3 rounded-lg flex items-center gap-2 border border-emerald-100">
            <User className="w-4 h-4" />
            Applying as: <strong>{currentUserName}</strong>
          </div>

          <div>
            <label className="pro-label">Leave Type</label>
            <select
              className="pro-select"
              value={form.leaveType}
              onChange={(e) => onChange({ ...form, leaveType: e.target.value })}
            >
              <option>Vacation Leave</option>
              <option>Sick Leave</option>
              <option>Emergency Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="pro-label">Start Date</label>
              <input
                type="date"
                className="pro-input"
                value={form.startDate}
                onChange={(e) => onChange({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="pro-label">End Date</label>
              <input
                type="date"
                className="pro-input"
                value={form.endDate}
                onChange={(e) => onChange({ ...form, endDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="pro-label">Reason</label>
            <textarea
              rows={3}
              className="pro-input resize-none"
              placeholder="Brief reason for leave..."
              value={form.reason}
              onChange={(e) => onChange({ ...form, reason: e.target.value })}
            />
          </div>

          <div className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-gray-400">
              Your leave request will be sent to HR admin for review. It will
              not be visible to other employees.
            </p>
          </div>
        </div>

        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onSubmit} className="btn btn-primary">
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;

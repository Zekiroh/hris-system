import { X } from "lucide-react";

type ReportModalProps = {
  title: string;
  show: boolean;
  onClose: () => void;
};

export const ReportModal = ({ title, show, onClose }: ReportModalProps) => {
  if (!show) return null;
  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="pro-modal-body space-y-4">
          <div>
            <label className="pro-label">Report Period</label>
            <select className="pro-select">
              <option>January 2026</option>
              <option>February 2026</option>
              <option>Q1 2026</option>
              <option>Annual 2025</option>
            </select>
          </div>
          <div>
            <label className="pro-label">Format</label>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="reportFmt"
                  defaultChecked
                  className="accent-emerald-600"
                />{" "}
                Excel
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="reportFmt"
                  className="accent-emerald-600"
                />{" "}
                PDF
              </label>
            </div>
          </div>
        </div>
        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onClose} className="btn btn-primary">
            Generate & Download
          </button>
        </div>
      </div>
    </div>
  );
};

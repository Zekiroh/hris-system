import { XCircle } from "lucide-react";
import type { AssetAssignmentDto } from "../../../../lib/assets";

type ReportAssetIssueModalProps = {
  myAssets: AssetAssignmentDto[];
  reportIssue: string;
  onClose: () => void;
  onSubmit: () => void;
  onIssueChange: (value: string) => void;
};

const ReportAssetIssueModal = ({
  myAssets,
  reportIssue,
  onClose,
  onSubmit,
  onIssueChange,
}: ReportAssetIssueModalProps) => {
  return (
    <div className="pro-modal-overlay">
      <div
        className="pro-modal max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pro-modal-header">
          <h3>Report Asset Issue</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="pro-modal-body space-y-4">
          <div>
            <label className="pro-label">Asset</label>
            <select className="pro-select">
              {myAssets.map((a) => (
                <option key={a.id}>
                  {a.assetName} ({a.assetCode})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="pro-label">Issue Type</label>
            <select className="pro-select">
              <option>Hardware Damage</option>
              <option>Software Problem</option>
              <option>Connectivity Issue</option>
              <option>Performance Issue</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="pro-label">Description</label>
            <textarea
              rows={4}
              className="pro-input resize-none"
              placeholder="Describe the issue in detail..."
              value={reportIssue}
              onChange={(e) => onIssueChange(e.target.value)}
            />
          </div>
        </div>
        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={onSubmit} className="btn btn-primary">
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportAssetIssueModal;

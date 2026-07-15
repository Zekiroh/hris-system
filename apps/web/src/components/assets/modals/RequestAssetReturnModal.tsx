import { XCircle } from "lucide-react";
import type { AssetAssignmentDto } from "../../../lib/assets";

type RequestAssetReturnModalProps = {
  selectedReturnAsset: AssetAssignmentDto;
  returnReason: string;
  returnSubmitting: boolean;
  returnError: string;
  onClose: () => void;
  onSubmit: () => void;
  onReasonChange: (value: string) => void;
};

const RequestAssetReturnModal = ({
  selectedReturnAsset,
  returnReason,
  returnSubmitting,
  returnError,
  onClose,
  onSubmit,
  onReasonChange,
}: RequestAssetReturnModalProps) => {
  return (
    <div className="pro-modal-overlay">
      <div
        className="pro-modal max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pro-modal-header">
          <h3>Request Asset Return</h3>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            disabled={returnSubmitting}
          >
            <XCircle className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="pro-modal-body space-y-4">
          {returnError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {returnError}
            </div>
          )}

          <div>
            <label className="pro-label">Asset</label>
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-sm font-bold text-gray-800">
                {selectedReturnAsset.assetName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedReturnAsset.category} •{" "}
                {selectedReturnAsset.assetCode}
              </p>
            </div>
          </div>

          <div>
            <label className="pro-label">Reason</label>
            <textarea
              rows={4}
              className="pro-input resize-none"
              placeholder="Explain why this asset is ready for return..."
              value={returnReason}
              onChange={(e) => onReasonChange(e.target.value)}
              disabled={returnSubmitting}
            />
          </div>
        </div>
        <div className="pro-modal-footer">
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={returnSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-primary"
            disabled={returnSubmitting}
          >
            {returnSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestAssetReturnModal;

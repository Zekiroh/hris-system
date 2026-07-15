import { AlertTriangle, ClipboardCheck, Laptop } from "lucide-react";
import type {
  AssetAssignmentDto,
  AssetReturnRequestDto,
} from "../../lib/assets";
import {
  assetStatusBadge,
  returnRequestStatusBadge,
} from "./assetManagementConfig";
import { getAssetSpecs } from "./assetManagementHelpers";

type UserAssignedAssetCardProps = {
  asset: AssetAssignmentDto;
  returnRequest: AssetReturnRequestDto | null;
  isReturnLocked: boolean;
  onReportIssue: () => void;
  onRequestReturn: (asset: AssetAssignmentDto) => void;
};

const UserAssignedAssetCard = ({
  asset,
  returnRequest,
  isReturnLocked,
  onReportIssue,
  onRequestReturn,
}: UserAssignedAssetCardProps) => {
  return (
    <div className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Laptop className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-800">
              {asset.assetName}
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              {asset.category} • {asset.assetCode}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`badge ${assetStatusBadge["In Use"]}`}>
            <span className="badge-dot" />
            In Use
          </span>
          {returnRequest && (
            <span
              className={`badge ${
                returnRequestStatusBadge[returnRequest.status] ??
                "badge-neutral"
              }`}
            >
              <span className="badge-dot" />
              Return {returnRequest.status}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Serial No.
          </p>
          <p className="text-xs font-mono font-medium text-gray-700 mt-0.5">
            {asset.serialNumber || "-"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Date Assigned
          </p>
          <p className="text-xs font-medium text-gray-700 mt-0.5">
            {asset.assignedDate || "-"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2 col-span-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Device Info
          </p>
          <p className="text-xs font-medium text-gray-700 mt-0.5">
            {getAssetSpecs(asset)}
          </p>
        </div>
      </div>

      {returnRequest && (
        <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Return Request
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            {returnRequest.reason}
          </p>
          {returnRequest.reviewRemarks && (
            <p className="text-xs text-gray-500 mt-1">
              Review: {returnRequest.reviewRemarks}
            </p>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={onReportIssue}
          className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          Report Issue
        </button>
        <button
          onClick={() => onRequestReturn(asset)}
          disabled={isReturnLocked}
          className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />
          {returnRequest?.status === "Pending"
            ? "Return Requested"
            : returnRequest?.status === "Approved"
              ? "Return Approved"
              : "Request Return"}
        </button>
      </div>
    </div>
  );
};

export default UserAssignedAssetCard;

import type {
  AssetAssignmentDto,
  AssetReturnRequestDto,
} from "../../../../lib/assets";
import UserAssignedAssetCard from "./UserAssignedAssetCard";
import { getReturnRequestForAsset } from "../../assetManagementHelpers";

type UserAssetsTabProps = {
  myAssets: AssetAssignmentDto[];
  myReturnRequests: AssetReturnRequestDto[];
  loadingAssets: boolean;
  assetError: string;
  onReportIssue: () => void;
  onRequestReturn: (asset: AssetAssignmentDto) => void;
};

const UserAssetsTab = ({
  myAssets,
  myReturnRequests,
  loadingAssets,
  assetError,
  onReportIssue,
  onRequestReturn,
}: UserAssetsTabProps) => {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-gray-800">
        Assigned Equipment
      </h3>

      {assetError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {assetError}
        </div>
      )}

      {loadingAssets && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          Loading assigned assets...
        </div>
      )}

      {!loadingAssets && myAssets.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm italic">
          No assigned assets found.
        </div>
      )}

      {!loadingAssets && myAssets.length > 0 && (
        <div className="space-y-4">
          {myAssets.map((asset) => {
            const returnRequest = getReturnRequestForAsset(
              myReturnRequests,
              asset.id
            );
            const isReturnLocked =
              returnRequest?.status === "Pending" ||
              returnRequest?.status === "Approved";

            return (
              <UserAssignedAssetCard
                key={asset.id}
                asset={asset}
                returnRequest={returnRequest}
                isReturnLocked={isReturnLocked}
                onReportIssue={onReportIssue}
                onRequestReturn={onRequestReturn}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserAssetsTab;

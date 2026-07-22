import { Plus } from 'lucide-react';
import type { AssetDto, AssetReturnRequestDto } from '../../../../lib/assets';
import AdminAssetInventoryTable from './AdminAssetInventoryTable';
import AdminReturnRequestTable from './AdminReturnRequestTable';
import type { ReturnReviewAction } from '../../assetManagementTypes';

type AdminInventoryTabProps = {
    assets: AssetDto[];
    returnRequests: AssetReturnRequestDto[];
    isLoadingAssets: boolean;
    isLoadingReturnRequests: boolean;
    assetError: string;
    employeeError: string;
    returnRequestError: string;
    onAddAsset: () => void;
    onAssignAsset: (asset: AssetDto) => void;
    onRefreshReturnRequests: () => void;
    onReviewReturnRequest: (request: AssetReturnRequestDto, action: ReturnReviewAction) => void;
};

const AdminInventoryTab = ({
    assets,
    returnRequests,
    isLoadingAssets,
    isLoadingReturnRequests,
    assetError,
    employeeError,
    returnRequestError,
    onAddAsset,
    onAssignAsset,
    onRefreshReturnRequests,
    onReviewReturnRequest,
}: AdminInventoryTabProps) => {
    return (
        <div className="space-y-6">
            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-gray-800">Assets</h3>
                    <button onClick={onAddAsset} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Asset</button>
                </div>
                {assetError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {assetError}
                    </div>
                )}
                {employeeError && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {employeeError}
                    </div>
                )}
                <AdminAssetInventoryTable
                    assets={assets}
                    isLoading={isLoadingAssets}
                    onAssignAsset={onAssignAsset}
                />
            </div>

            <div className="space-y-5">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-base font-bold text-gray-800">Return Requests</h3>
                        <p className="text-xs text-gray-400 mt-1">Review employee asset return requests before physical receiving.</p>
                    </div>
                    <button onClick={onRefreshReturnRequests} className="btn btn-secondary text-xs !py-1.5">
                        Refresh
                    </button>
                </div>

                {returnRequestError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {returnRequestError}
                    </div>
                )}

                <AdminReturnRequestTable
                    returnRequests={returnRequests}
                    isLoading={isLoadingReturnRequests}
                    onReviewReturnRequest={onReviewReturnRequest}
                />
            </div>
        </div>
    );
};

export default AdminInventoryTab;

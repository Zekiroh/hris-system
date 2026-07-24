import { UserPlus } from 'lucide-react';
import type { AssetDto } from '../../../../services/api/asset-management/assets';
import { assetStatusBadge } from '../../assetManagementConfig';

type AdminAssetInventoryTableProps = {
    assets: AssetDto[];
    isLoading: boolean;
    onAssignAsset: (asset: AssetDto) => void;
};

const AdminAssetInventoryTable = ({ assets, isLoading, onAssignAsset }: AdminAssetInventoryTableProps) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead>
                    <tr>
                        {['Asset ID', 'Name', 'Category', 'Assigned To', 'Purchase Date', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-400 text-sm italic">Loading assets...</td>
                        </tr>
                    )}
                    {!isLoading && assets.map(a => (
                        <tr key={a.id}>
                            <td className="font-mono text-xs">{a.assetCode}</td>
                            <td className="!font-medium !text-gray-800">{a.assetName}</td>
                            <td>{a.category}</td>
                            <td>{a.assignedEmployeeName || '-'}</td>
                            <td>{a.purchaseDate || '-'}</td>
                            <td><span className={`badge ${assetStatusBadge[a.status] ?? 'badge-neutral'}`}><span className="badge-dot" />{a.status}</span></td>
                            <td>
                                <button
                                    type="button"
                                    onClick={() => onAssignAsset(a)}
                                    disabled={a.status !== 'Available' || Boolean(a.activeAssignmentId)}
                                    className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <UserPlus className="w-3.5 h-3.5" />
                                    Assign
                                </button>
                            </td>
                        </tr>
                    ))}
                    {!isLoading && assets.length === 0 && (
                        <tr>
                            <td colSpan={7} className="text-center py-8 text-gray-400 text-sm italic">No assets found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminAssetInventoryTable;
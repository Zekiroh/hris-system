import { CheckCircle, XCircle } from 'lucide-react';
import type { AssetReturnRequestDto } from '../../lib/assets';
import { returnRequestStatusBadge } from './assetManagementConfig';
import type { ReturnReviewAction } from './assetManagementTypes';

type AdminReturnRequestTableProps = {
    returnRequests: AssetReturnRequestDto[];
    isLoading: boolean;
    onReviewReturnRequest: (request: AssetReturnRequestDto, action: ReturnReviewAction) => void;
};

const AdminReturnRequestTable = ({ returnRequests, isLoading, onReviewReturnRequest }: AdminReturnRequestTableProps) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="pro-table">
                <thead>
                    <tr>
                        {['Request ID', 'Asset', 'Employee', 'Requested Date', 'Reason', 'Status', 'Reviewed By', 'Actions'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {isLoading && (
                        <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-400 text-sm italic">Loading return requests...</td>
                        </tr>
                    )}
                    {!isLoading && returnRequests.map(request => (
                        <tr key={request.id}>
                            <td className="font-mono text-xs">RR-{String(request.id).padStart(3, '0')}</td>
                            <td>
                                <div className="!font-medium !text-gray-800">{request.assetName}</div>
                                <div className="text-xs text-gray-400">{request.assetCode}</div>
                            </td>
                            <td>
                                <div className="!font-medium !text-gray-800">{request.requestedByEmployeeName}</div>
                                <div className="text-xs text-gray-400">{request.requestedByEmployeeNumber}</div>
                            </td>
                            <td>{request.requestedDate}</td>
                            <td className="max-w-[220px]">
                                <p className="truncate" title={request.reason}>{request.reason}</p>
                                {request.reviewRemarks && (
                                    <p className="text-xs text-gray-400 truncate mt-1" title={request.reviewRemarks}>
                                        Review: {request.reviewRemarks}
                                    </p>
                                )}
                            </td>
                            <td><span className={`badge ${returnRequestStatusBadge[request.status] ?? 'badge-neutral'}`}><span className="badge-dot" />{request.status}</span></td>
                            <td>{request.reviewedByUserName || '-'}</td>
                            <td>
                                {request.status === 'Pending' ? (
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onReviewReturnRequest(request, 'approve')}
                                            className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                            Approve
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onReviewReturnRequest(request, 'reject')}
                                            className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                                        >
                                            <XCircle className="w-3.5 h-3.5 text-red-400" />
                                            Reject
                                        </button>
                                    </div>
                                ) : (
                                    <span className="badge badge-neutral">
                                        <span className="badge-dot" />
                                        Reviewed
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {!isLoading && returnRequests.length === 0 && (
                        <tr>
                            <td colSpan={8} className="text-center py-8 text-gray-400 text-sm italic">No return requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminReturnRequestTable;

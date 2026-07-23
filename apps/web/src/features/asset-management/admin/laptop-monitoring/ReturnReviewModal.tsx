import { X } from 'lucide-react';
import type { AssetReturnRequestDto } from '../../../../services/api/asset-management/assets';
import type { ReturnReviewAction } from '../../assetManagementTypes';

type ReturnReviewModalProps = {
    selectedReturnRequest: AssetReturnRequestDto;
    returnReviewAction: ReturnReviewAction;
    returnReviewRemarks: string;
    isReviewingReturnRequest: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onRemarksChange: (value: string) => void;
};

const ReturnReviewModal = ({
    selectedReturnRequest,
    returnReviewAction,
    returnReviewRemarks,
    isReviewingReturnRequest,
    onClose,
    onConfirm,
    onRemarksChange,
}: ReturnReviewModalProps) => {
    return (
        <div className="pro-modal-overlay" onClick={onClose}>
            <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header border-b border-gray-100">
                    <div>
                        <h3>{returnReviewAction === 'approve' ? 'Approve Return Request' : 'Reject Return Request'}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                            Review request RR-{String(selectedReturnRequest.id).padStart(3, '0')}.
                        </p>
                    </div>
                    <button type="button" onClick={onClose} className="btn-ghost btn-icon" disabled={isReviewingReturnRequest}>
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-4">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <p className="text-sm font-bold text-gray-800">{selectedReturnRequest.assetName}</p>
                        <p className="text-xs text-gray-500 mt-1">{selectedReturnRequest.assetCode} • {selectedReturnRequest.requestedByEmployeeName}</p>
                        <p className="text-xs text-gray-400 mt-2">{selectedReturnRequest.reason}</p>
                    </div>

                    <div>
                        <label className="pro-label">Review Remarks</label>
                        <textarea
                            rows={3}
                            className="pro-input resize-none"
                            placeholder={returnReviewAction === 'approve' ? 'e.g. Approved for physical return.' : 'e.g. Request rejected due to incomplete details.'}
                            value={returnReviewRemarks}
                            onChange={e => onRemarksChange(e.target.value)}
                            disabled={isReviewingReturnRequest}
                        />
                    </div>
                </div>
                <div className="pro-modal-footer border-t border-gray-100">
                    <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isReviewingReturnRequest}>Cancel</button>
                    <button type="button" onClick={onConfirm} disabled={isReviewingReturnRequest} className="btn btn-primary">
                        {isReviewingReturnRequest
                            ? 'Saving...'
                            : returnReviewAction === 'approve'
                                ? 'Approve Request'
                                : 'Reject Request'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReturnReviewModal;
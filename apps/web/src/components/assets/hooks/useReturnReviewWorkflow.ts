import { useState } from 'react';
import { approveReturnRequest, rejectReturnRequest } from '../../../lib/assets';
import type { AssetReturnRequestDto } from '../../../lib/assets';
import type { ReturnReviewAction } from '../assetManagementTypes';

type UseReturnReviewWorkflowInput = {
    loadReturnRequests: () => Promise<void>;
};

export const useReturnReviewWorkflow = ({ loadReturnRequests }: UseReturnReviewWorkflowInput) => {
    const [isReviewingReturnRequest, setIsReviewingReturnRequest] = useState(false);
    const [selectedReturnRequest, setSelectedReturnRequest] = useState<AssetReturnRequestDto | null>(null);
    const [returnReviewAction, setReturnReviewAction] = useState<ReturnReviewAction>('approve');
    const [returnReviewRemarks, setReturnReviewRemarks] = useState('');

    const openReturnReviewModal = (request: AssetReturnRequestDto, action: ReturnReviewAction) => {
        setSelectedReturnRequest(request);
        setReturnReviewAction(action);
        setReturnReviewRemarks('');
    };

    const closeReturnReviewModal = () => {
        if (isReviewingReturnRequest) return;

        setSelectedReturnRequest(null);
        setReturnReviewAction('approve');
        setReturnReviewRemarks('');
    };

    const handleReviewReturnRequest = async () => {
        if (!selectedReturnRequest) return;

        setIsReviewingReturnRequest(true);

        try {
            if (returnReviewAction === 'approve') {
                await approveReturnRequest(selectedReturnRequest.id, {
                    remarks: returnReviewRemarks.trim() || null,
                });
            } else {
                await rejectReturnRequest(selectedReturnRequest.id, {
                    remarks: returnReviewRemarks.trim() || null,
                });
            }

            setSelectedReturnRequest(null);
            setReturnReviewRemarks('');
            await loadReturnRequests();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to review return request.');
        } finally {
            setIsReviewingReturnRequest(false);
        }
    };

    return {
        selectedReturnRequest,
        returnReviewAction,
        returnReviewRemarks,
        setReturnReviewRemarks,
        isReviewingReturnRequest,
        openReturnReviewModal,
        closeReturnReviewModal,
        handleReviewReturnRequest,
    };
};

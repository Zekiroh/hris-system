import { useState } from 'react';
import {
    createReturnRequest,
    getMyReturnRequests,
} from '../../../../services/api/asset-management/assets';
import type {
    AssetAssignmentDto,
    AssetReturnRequestDto,
} from '../../../../services/api/asset-management/assets';

type UseAssetReturnRequestWorkflowInput = {
    insertReturnRequest: (request: AssetReturnRequestDto) => void;
    replaceReturnRequests: (requests: AssetReturnRequestDto[]) => void;
};

export const useAssetReturnRequestWorkflow = ({
    insertReturnRequest,
    replaceReturnRequests,
}: UseAssetReturnRequestWorkflowInput) => {
    const [returnOpen, setReturnOpen] = useState(false);
    const [selectedReturnAsset, setSelectedReturnAsset] =
        useState<AssetAssignmentDto | null>(null);
    const [returnReason, setReturnReason] = useState('');
    const [returnSubmitting, setReturnSubmitting] = useState(false);
    const [returnError, setReturnError] = useState('');

    const openReturnModal = (asset: AssetAssignmentDto) => {
        setSelectedReturnAsset(asset);
        setReturnReason('');
        setReturnError('');
        setReturnOpen(true);
    };

    const closeReturnModal = () => {
        if (returnSubmitting) return;

        setReturnOpen(false);
        setSelectedReturnAsset(null);
        setReturnReason('');
        setReturnError('');
    };

    const handleSubmitReturnRequest = async () => {
        if (!selectedReturnAsset) return;

        const reason = returnReason.trim();

        if (!reason) {
            setReturnError('Return reason is required.');
            return;
        }

        setReturnSubmitting(true);
        setReturnError('');

        try {
            const createdRequest = await createReturnRequest(
                selectedReturnAsset.id,
                {
                    reason,
                }
            );

            insertReturnRequest(createdRequest);
            setReturnOpen(false);
            setSelectedReturnAsset(null);
            setReturnReason('');

            try {
                const requests = await getMyReturnRequests();
                replaceReturnRequests(requests);
            } catch {
                // Best-effort refresh only. The request was already created successfully.
            }
        } catch (error) {
            setReturnError(
                error instanceof Error
                    ? error.message
                    : 'Unable to submit return request.'
            );
        } finally {
            setReturnSubmitting(false);
        }
    };

    return {
        returnOpen,
        selectedReturnAsset,
        returnReason,
        setReturnReason,
        returnSubmitting,
        returnError,
        openReturnModal,
        closeReturnModal,
        handleSubmitReturnRequest,
    };
};
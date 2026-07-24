import { useState } from 'react';
import type { FormEvent } from 'react';
import { createInitialAssignForm } from '../../assetManagementConfig';
import { assignAsset } from '../../../../services/api/asset-management/assets';
import type { AssetDto } from '../../../../services/api/asset-management/assets';

type UseAssetAssignmentWorkflowOptions = {
    loadAssets: () => Promise<void>;
};

export const useAssetAssignmentWorkflow = ({
    loadAssets,
}: UseAssetAssignmentWorkflowOptions) => {
    const [showAssignAsset, setShowAssignAsset] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
    const [assignForm, setAssignForm] = useState(createInitialAssignForm);
    const [isAssigningAsset, setIsAssigningAsset] = useState(false);

    const openAssignAssetModal = (asset: AssetDto) => {
        setSelectedAsset(asset);
        setAssignForm(createInitialAssignForm());
        setShowAssignAsset(true);
    };

    const closeAssignAssetModal = () => {
        setShowAssignAsset(false);
    };

    const handleAssignAsset = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedAsset) return;

        if (!assignForm.employeeId) {
            alert('Please select an employee.');
            return;
        }

        setIsAssigningAsset(true);

        try {
            await assignAsset(selectedAsset.id, {
                employeeId: assignForm.employeeId,
                assignedDate: assignForm.assignedDate || null,
                remarks: assignForm.remarks.trim() || null,
            });

            setAssignForm(createInitialAssignForm());
            setSelectedAsset(null);
            setShowAssignAsset(false);
            await loadAssets();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to assign asset.');
        } finally {
            setIsAssigningAsset(false);
        }
    };

    return {
        showAssignAsset,
        selectedAsset,
        assignForm,
        setAssignForm,
        isAssigningAsset,
        openAssignAssetModal,
        closeAssignAssetModal,
        handleAssignAsset,
    };
};
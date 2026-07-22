import { useState } from 'react';
import type { FormEvent } from 'react';
import { initialAssetForm } from '../../assetManagementConfig';
import { createAsset } from '../../../../lib/assets';

type UseAssetCreationWorkflowOptions = {
    loadAssets: () => Promise<void>;
    closeAddAssetModal: () => void;
};

export const useAssetCreationWorkflow = ({
    loadAssets,
    closeAddAssetModal,
}: UseAssetCreationWorkflowOptions) => {
    const [assetForm, setAssetForm] = useState(initialAssetForm);
    const [isSavingAsset, setIsSavingAsset] = useState(false);

    const handleAddAsset = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!assetForm.assetCode.trim() || !assetForm.assetName.trim() || !assetForm.category.trim()) {
            alert('Please fill in all required asset fields.');
            return;
        }

        setIsSavingAsset(true);

        try {
            await createAsset({
                assetCode: assetForm.assetCode.trim(),
                assetName: assetForm.assetName.trim(),
                category: assetForm.category.trim(),
                brand: assetForm.brand.trim() || null,
                model: assetForm.model.trim() || null,
                serialNumber: assetForm.serialNumber.trim() || null,
                purchaseDate: assetForm.purchaseDate || null,
                status: assetForm.status || null,
                notes: assetForm.notes.trim() || null,
            });

            setAssetForm(initialAssetForm);
            closeAddAssetModal();
            await loadAssets();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to add asset.');
        } finally {
            setIsSavingAsset(false);
        }
    };

    return {
        assetForm,
        setAssetForm,
        isSavingAsset,
        handleAddAsset,
    };
};

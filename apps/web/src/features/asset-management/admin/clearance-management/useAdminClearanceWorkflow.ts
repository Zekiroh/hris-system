import { useState } from 'react';
import {
    completeClearance,
    createClearance,
    updateDepartmentApproval,
    updateHrApproval,
} from '../../../../services/api/clearance/clearance';
import type {
    CompleteClearanceRequest,
    CreateClearanceRequest,
    UpdateDepartmentApprovalRequest,
    UpdateHrApprovalRequest,
} from '../../../../services/api/clearance/clearance';

type UseAdminClearanceWorkflowInput = {
    loadClearances: () => Promise<void>;
};

const getErrorMessage = (error: unknown, fallbackMessage: string) =>
    error instanceof Error ? error.message : fallbackMessage;

export const useAdminClearanceWorkflow = ({
    loadClearances,
}: UseAdminClearanceWorkflowInput) => {
    const [isCreatingClearance, setIsCreatingClearance] = useState(false);
    const [updatingDepartmentApprovalId, setUpdatingDepartmentApprovalId] = useState<number | null>(null);
    const [updatingHrApprovalId, setUpdatingHrApprovalId] = useState<number | null>(null);
    const [completingClearanceId, setCompletingClearanceId] = useState<number | null>(null);
    const [clearanceWorkflowError, setClearanceWorkflowError] = useState('');

    const handleCreateClearance = async (request: CreateClearanceRequest) => {
        if (isCreatingClearance) return;

        setClearanceWorkflowError('');
        setIsCreatingClearance(true);

        try {
            const clearance = await createClearance(request);
            await loadClearances();

            return clearance;
        } catch (error) {
            setClearanceWorkflowError(
                getErrorMessage(error, 'Unable to create clearance record.')
            );
            throw error;
        } finally {
            setIsCreatingClearance(false);
        }
    };

    const handleUpdateDepartmentApproval = async (
        id: number,
        request: UpdateDepartmentApprovalRequest
    ) => {
        if (updatingDepartmentApprovalId !== null) return;

        setClearanceWorkflowError('');
        setUpdatingDepartmentApprovalId(id);

        try {
            const clearance = await updateDepartmentApproval(id, request);
            await loadClearances();

            return clearance;
        } catch (error) {
            setClearanceWorkflowError(
                getErrorMessage(error, 'Unable to update department approval.')
            );
            throw error;
        } finally {
            setUpdatingDepartmentApprovalId(null);
        }
    };

    const handleUpdateHrApproval = async (
        id: number,
        request: UpdateHrApprovalRequest
    ) => {
        if (updatingHrApprovalId !== null) return;

        setClearanceWorkflowError('');
        setUpdatingHrApprovalId(id);

        try {
            const clearance = await updateHrApproval(id, request);
            await loadClearances();

            return clearance;
        } catch (error) {
            setClearanceWorkflowError(
                getErrorMessage(error, 'Unable to update HR approval.')
            );
            throw error;
        } finally {
            setUpdatingHrApprovalId(null);
        }
    };

    const handleCompleteClearance = async (
        id: number,
        request: CompleteClearanceRequest
    ) => {
        if (completingClearanceId !== null) return;

        setClearanceWorkflowError('');
        setCompletingClearanceId(id);

        try {
            const clearance = await completeClearance(id, request);
            await loadClearances();

            return clearance;
        } catch (error) {
            setClearanceWorkflowError(
                getErrorMessage(error, 'Unable to complete clearance record.')
            );
            throw error;
        } finally {
            setCompletingClearanceId(null);
        }
    };

    return {
        isCreatingClearance,
        updatingDepartmentApprovalId,
        updatingHrApprovalId,
        completingClearanceId,
        clearanceWorkflowError,
        handleCreateClearance,
        handleUpdateDepartmentApproval,
        handleUpdateHrApproval,
        handleCompleteClearance,
    };
};
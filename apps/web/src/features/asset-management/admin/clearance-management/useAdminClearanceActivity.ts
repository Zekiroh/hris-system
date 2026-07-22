import { useState } from 'react';
import { getClearanceActivities } from '../../../../lib/clearance';
import type { ClearanceActivityDto } from '../../../../lib/clearance';

export const useAdminClearanceActivity = () => {
    const [selectedClearanceId, setSelectedClearanceId] = useState<number | null>(null);
    const [selectedClearanceEmployeeName, setSelectedClearanceEmployeeName] = useState('');
    const [activities, setActivities] = useState<ClearanceActivityDto[]>([]);
    const [isLoadingActivities, setIsLoadingActivities] = useState(false);
    const [activityError, setActivityError] = useState('');

    const openActivityHistory = async (
        clearanceId: number,
        employeeName: string
    ) => {
        setSelectedClearanceId(clearanceId);
        setSelectedClearanceEmployeeName(employeeName);
        setActivities([]);
        setActivityError('');
        setIsLoadingActivities(true);

        try {
            const data = await getClearanceActivities(clearanceId);
            setActivities(data);
        } catch (error) {
            setActivityError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load clearance activity history.'
            );
        } finally {
            setIsLoadingActivities(false);
        }
    };

    const closeActivityHistory = () => {
        if (isLoadingActivities) return;

        setSelectedClearanceId(null);
        setSelectedClearanceEmployeeName('');
        setActivities([]);
        setActivityError('');
    };

    return {
        selectedClearanceId,
        selectedClearanceEmployeeName,
        activities,
        isLoadingActivities,
        activityError,
        openActivityHistory,
        closeActivityHistory,
    };
};

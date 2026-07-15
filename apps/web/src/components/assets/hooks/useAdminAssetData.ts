import { useCallback, useEffect, useState } from 'react';
import { getAnnouncements } from '../../../lib/announcement';
import type { AnnouncementDto } from '../../../lib/announcement';
import { getAssets, getReturnRequests } from '../../../lib/assets';
import type { AssetDto, AssetReturnRequestDto } from '../../../lib/assets';
import { getEmployees } from '../../../lib/employees';
import type { EmployeeDto } from '../../../lib/employees';
import { unwrapEmployeesResponse } from '../assetManagementHelpers';

export const useAdminAssetData = () => {
    const [assets, setAssets] = useState<AssetDto[]>([]);
    const [returnRequests, setReturnRequests] = useState<AssetReturnRequestDto[]>([]);
    const [activeEmployees, setActiveEmployees] = useState<EmployeeDto[]>([]);
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [isLoadingReturnRequests, setIsLoadingReturnRequests] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
    const [assetError, setAssetError] = useState('');
    const [returnRequestError, setReturnRequestError] = useState('');
    const [employeeError, setEmployeeError] = useState('');
    const [announcementError, setAnnouncementError] = useState('');

    const loadAssets = useCallback(async () => {
        setIsLoadingAssets(true);
        setAssetError('');

        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            setAssetError(error instanceof Error ? error.message : 'Unable to load assets.');
        } finally {
            setIsLoadingAssets(false);
        }
    }, []);

    const loadReturnRequests = useCallback(async () => {
        setIsLoadingReturnRequests(true);
        setReturnRequestError('');

        try {
            const data = await getReturnRequests();
            setReturnRequests(data);
        } catch (error) {
            setReturnRequestError(error instanceof Error ? error.message : 'Unable to load return requests.');
        } finally {
            setIsLoadingReturnRequests(false);
        }
    }, []);

    const loadEmployees = useCallback(async () => {
        setIsLoadingEmployees(true);
        setEmployeeError('');

        try {
            const response = await getEmployees({ page: 1, pageSize: 100 });
            const payload = unwrapEmployeesResponse(response);
            setActiveEmployees(payload.items.filter((employee: EmployeeDto) => employee.isActive));
        } catch (error) {
            setEmployeeError(error instanceof Error ? error.message : 'Unable to load employees.');
        } finally {
            setIsLoadingEmployees(false);
        }
    }, []);

    const loadAnnouncements = useCallback(async () => {
        setIsLoadingAnnouncements(true);
        setAnnouncementError('');

        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            setAnnouncementError(error instanceof Error ? error.message : 'Unable to load announcements.');
        } finally {
            setIsLoadingAnnouncements(false);
        }
    }, []);

    useEffect(() => {
        void loadAssets();
        void loadReturnRequests();
        void loadEmployees();
        void loadAnnouncements();
    }, [loadAssets, loadReturnRequests, loadEmployees, loadAnnouncements]);

    return {
        assets,
        returnRequests,
        activeEmployees,
        announcements,
        isLoadingAssets,
        isLoadingReturnRequests,
        isLoadingEmployees,
        isLoadingAnnouncements,
        assetError,
        returnRequestError,
        employeeError,
        announcementError,
        loadAssets,
        loadReturnRequests,
        loadEmployees,
        loadAnnouncements,
    };
};

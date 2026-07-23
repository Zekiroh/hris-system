import { useCallback, useEffect, useState } from 'react';
import { getMyAssets, getMyReturnRequests } from '../../../../services/api/asset-management/assets';
import type {
    AssetAssignmentDto,
    AssetReturnRequestDto,
} from '../../../../services/api/asset-management/assets';

export const useUserAssetData = () => {
    const [myAssets, setMyAssets] = useState<AssetAssignmentDto[]>([]);
    const [myReturnRequests, setMyReturnRequests] = useState<
        AssetReturnRequestDto[]
    >([]);
    const [loadingAssets, setLoadingAssets] = useState(true);
    const [assetError, setAssetError] = useState('');

    const loadAssetData = useCallback(async () => {
        setLoadingAssets(true);
        setAssetError('');

        try {
            const assets = await getMyAssets();
            setMyAssets(assets);

            try {
                const returnRequests = await getMyReturnRequests();
                setMyReturnRequests(returnRequests);
            } catch {
                setMyReturnRequests([]);
            }
        } catch (error) {
            setAssetError(
                error instanceof Error
                    ? error.message
                    : 'Unable to load assigned assets.'
            );
        } finally {
            setLoadingAssets(false);
        }
    }, []);

    useEffect(() => {
        void loadAssetData();
    }, [loadAssetData]);

    const insertReturnRequest = (request: AssetReturnRequestDto) => {
        setMyReturnRequests((prev) => [request, ...prev]);
    };

    const replaceReturnRequests = (requests: AssetReturnRequestDto[]) => {
        setMyReturnRequests(requests);
    };

    return {
        myAssets,
        myReturnRequests,
        loadingAssets,
        assetError,
        loadAssetData,
        insertReturnRequest,
        replaceReturnRequests,
    };
};
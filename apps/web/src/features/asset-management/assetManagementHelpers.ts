import type { AssetAssignmentDto, AssetReturnRequestDto } from '../../services/api/asset-management/assets';
import type { EmployeeDto, PagedEmployeesResponse } from '../../services/api/employees/employees';
import { getEmployees } from '../../services/api/employees/employees';

export const unwrapEmployeesResponse = (
    response: Awaited<ReturnType<typeof getEmployees>>
): PagedEmployeesResponse => {
    if ('data' in response && response.data) {
        return response.data;
    }

    return response as PagedEmployeesResponse;
};

export const getEmployeeName = (employee: EmployeeDto) => {
    return [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(' ');
};

export const formatAnnouncementDate = (value: string | null) => {
    if (!value) return 'Unpublished';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};

export const getAssetSpecs = (asset: AssetAssignmentDto) => {
    const details = [asset.brand, asset.model].filter(Boolean).join(' ');
    return details || 'No device details available';
};

export const getReturnRequestForAsset = (
    returnRequests: AssetReturnRequestDto[],
    assignmentId: number
) => {
    const requests = returnRequests
        .filter((request) => request.assetAssignmentId === assignmentId)
        .sort(
            (a, b) =>
                new Date(b.createdAtUtc).getTime() -
                new Date(a.createdAtUtc).getTime()
        );

    return (
        requests.find((request) => request.status === 'Pending') ??
        requests.find((request) => request.status === 'Approved') ??
        requests[0] ??
        null
    );
};

export const scoreColor = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.85) return '#10b981';
    if (pct >= 0.7) return '#3b82f6';
    return '#f59e0b';
};
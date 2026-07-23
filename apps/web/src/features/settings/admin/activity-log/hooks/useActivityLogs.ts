import { useEffect, useMemo, useState } from 'react';
import {
    buildUserNameByEmail,
    formatActionLabel,
    formatDateFilterPart,
    formatDatePart,
    formatTimePart,
    prettifyDetails,
    getUserLabel,
} from '../../../../../shared/utils/activityLog';
import {
    exportActivityLogs,
    getActivityLogs,
    type ActivityLogItemDto,
} from '../../../../../services/api/activity-logs/activityLogs';
import { getAdminUsers, type AdminUserDto } from '../../../../../services/api/iam/adminUsers';

const PAGE_SIZE = 10;
const TODAY_FILTER_BATCH_SIZE = 100;

const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const escapeCsvValue = (value: string) => {
    const normalized = value.replace(/"/g, '""');
    return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
};

const downloadBlob = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
};

export const useActivityLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [logs, setLogs] = useState<ActivityLogItemDto[]>([]);
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
    const [exportRows, setExportRows] = useState<ActivityLogItemDto[]>([]);

    const userNameByEmail = useMemo(() => buildUserNameByEmail(users), [users]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [isTodayFilterActive]);

    useEffect(() => {
        let isMounted = true;

        const loadUsersBestEffort = async () => {
            try {
                const usersResponse = await getAdminUsers({
                    page: 1,
                    pageSize: 100,
                });

                if (!isMounted) return;

                const resolvedUsers = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse.items ?? [];

                setUsers(resolvedUsers);
            } catch {
                if (!isMounted) return;
                setUsers([]);
            }
        };

        const loadLogs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const todayStr = getTodayString();

                if (isTodayFilterActive) {
                    const firstResponse = await getActivityLogs({
                        page: 1,
                        pageSize: TODAY_FILTER_BATCH_SIZE,
                        search: debouncedSearchTerm || undefined,
                    });

                    if (!isMounted) return;

                    const initialRows = Array.isArray(firstResponse.data) ? firstResponse.data : [];
                    const backendTotalCount =
                        typeof firstResponse.totalCount === 'number'
                            ? firstResponse.totalCount
                            : initialRows.length;

                    const totalBackendPages = Math.max(
                        1,
                        Math.ceil(backendTotalCount / TODAY_FILTER_BATCH_SIZE)
                    );

                    let allRows = initialRows;

                    if (totalBackendPages > 1) {
                        const remainingResponses = await Promise.all(
                            Array.from({ length: totalBackendPages - 1 }, (_, index) =>
                                getActivityLogs({
                                    page: index + 2,
                                    pageSize: TODAY_FILTER_BATCH_SIZE,
                                    search: debouncedSearchTerm || undefined,
                                })
                            )
                        );

                        if (!isMounted) return;

                        const remainingRows = remainingResponses.flatMap((response) =>
                            Array.isArray(response.data) ? response.data : []
                        );

                        allRows = [...initialRows, ...remainingRows];
                    }

                    const todayRows = allRows.filter(
                        (log) => formatDateFilterPart(log.createdAt) === todayStr
                    );

                    const startIndex = (page - 1) * PAGE_SIZE;
                    const pagedTodayRows = todayRows.slice(startIndex, startIndex + PAGE_SIZE);

                    setLogs(pagedTodayRows);
                    setExportRows(todayRows);
                    setTotalCount(todayRows.length);
                } else {
                    const logsResponse = await getActivityLogs({
                        page,
                        pageSize: PAGE_SIZE,
                        search: debouncedSearchTerm || undefined,
                    });

                    if (!isMounted) return;

                    const resolvedLogs = Array.isArray(logsResponse.data) ? logsResponse.data : [];

                    setLogs(resolvedLogs);
                    setExportRows(resolvedLogs);
                    setTotalCount(
                        typeof logsResponse.totalCount === 'number'
                            ? logsResponse.totalCount
                            : 0
                    );
                }
            } catch (err) {
                if (!isMounted) return;

                setError(
                    err instanceof Error ? err.message : 'Failed to load activity logs.'
                );
                setLogs([]);
                setExportRows([]);
                setTotalCount(0);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void loadUsersBestEffort();
        void loadLogs();

        return () => {
            isMounted = false;
        };
    }, [page, debouncedSearchTerm, isTodayFilterActive]);

    const handleExport = async () => {
        try {
            if (isTodayFilterActive) {
                const csvRows = exportRows.map((row) => ({
                    date: formatDatePart(row.createdAt),
                    time: formatTimePart(row.createdAt),
                    user: getUserLabel(row, userNameByEmail),
                    action: formatActionLabel(row.action),
                    details: prettifyDetails(row, userNameByEmail),
                }));

                const csvContent = [
                    ['Date', 'Time', 'User', 'Action', 'Details'],
                    ...csvRows.map((row) => [
                        row.date,
                        row.time,
                        row.user,
                        row.action,
                        row.details,
                    ]),
                ]
                    .map((row) => row.map((value) => escapeCsvValue(String(value))).join(','))
                    .join('\n');

                downloadBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }), 'activity-logs.csv');
                return;
            }

            const blob = await exportActivityLogs({
                search: debouncedSearchTerm || undefined,
            });

            downloadBlob(blob, 'activity-logs.csv');
        } catch (err) {
            console.error('Export failed:', err);
            alert('Failed to export activity logs.');
        }
    };

    return {
        PAGE_SIZE,
        searchTerm,
        setSearchTerm,
        logs,
        users,
        page,
        setPage,
        totalCount,
        isLoading,
        error,
        handleExport,
        isTodayFilterActive,
        setIsTodayFilterActive,
    };
};

import { useEffect, useState } from 'react';
import {
    exportActivityLogs,
    getActivityLogs,
    type ActivityLogItemDto,
} from '../../../lib/activityLogs';
import { getAdminUsers, type AdminUserDto } from '../../../lib/adminUsers';

const PAGE_SIZE = 10;

export const useActivityLogs = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [logs, setLogs] = useState<ActivityLogItemDto[]>([]);
    const [users, setUsers] = useState<AdminUserDto[]>([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
            setPage(1);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const [logsResponse, usersResponse] = await Promise.all([
                    getActivityLogs({
                        page,
                        pageSize: PAGE_SIZE,
                        search: debouncedSearchTerm || undefined,
                    }),
                    getAdminUsers({
                        page: 1,
                        pageSize: 100,
                    }),
                ]);

                if (!isMounted) return;

                setLogs(Array.isArray(logsResponse.data) ? logsResponse.data : []);
                setTotalCount(
                    typeof logsResponse.totalCount === 'number'
                        ? logsResponse.totalCount
                        : 0
                );

                const resolvedUsers = Array.isArray(usersResponse)
                    ? usersResponse
                    : usersResponse.items ?? [];

                setUsers(resolvedUsers);
            } catch (err) {
                if (!isMounted) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load activity logs.'
                );

                setLogs([]);
                setUsers([]);
                setTotalCount(0);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [page, debouncedSearchTerm]);

    const handleExport = async () => {
        try {
            const blob = await exportActivityLogs({
                search: debouncedSearchTerm || undefined,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');

            a.href = url;
            a.download = 'activity-logs.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();

            window.URL.revokeObjectURL(url);
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
    };
};
import { useState, useEffect } from 'react';
import { Calendar, Search } from 'lucide-react';
import { getBadgeClassName, formatActionLabel, formatDatePart, formatTimePart, formatDateFilterPart } from '../../../lib/activityLog.utils';
import { getUserActivityLogs, type ActivityLogItemDto } from '../../../services/api/activity-logs/activityLogs';

const ActivityLogTab = ({ refreshKey }: { refreshKey: number }) => {
    const [searchTerm,          setSearchTerm]          = useState('');
    const [debouncedSearch,     setDebouncedSearch]     = useState('');
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
    const [logs,                setLogs]                = useState<ActivityLogItemDto[]>([]);
    const [page,                setPage]                = useState(1);
    const [totalCount,          setTotalCount]          = useState(0);
    const [isLoading,           setIsLoading]           = useState(true);
    const [error,               setError]               = useState<string | null>(null);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [isTodayFilterActive]);

    useEffect(() => {
        let isMounted = true;

        const loadLogs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getUserActivityLogs({
                    page,
                    pageSize: PAGE_SIZE,
                    search: debouncedSearch || undefined,
                });

                if (!isMounted) return;

                let data = Array.isArray(response.data) ? response.data : [];

                if (isTodayFilterActive) {
                    const todayStr = new Date().toLocaleDateString('en-CA', {
                        timeZone: 'Asia/Manila',
                    });
                    data = data.filter(
                        log => formatDateFilterPart(log.createdAt) === todayStr
                    );
                }

                setLogs(data);
                setTotalCount(isTodayFilterActive ? data.length : response.totalCount);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load activity logs.');
                setLogs([]);
                setTotalCount(0);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadLogs();
        return () => { isMounted = false; };
    }, [page, debouncedSearch, isTodayFilterActive, refreshKey]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pro-input !pl-9 !py-1.5 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <button
                    onClick={() => setIsTodayFilterActive(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm transition-colors ${
                        isTodayFilterActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Calendar size={16} className={isTodayFilterActive ? 'text-emerald-500' : 'text-gray-400'} />
                    <span className="font-medium">{isTodayFilterActive ? 'Today Only' : 'All Time'}</span>
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100 min-h-[520px]">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                                    Loading activity logs...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-red-500 italic">
                                    {error}
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                                    No logs match your search.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatDatePart(log.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatTimePart(log.createdAt)}
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getBadgeClassName(log.action)}`}>
                                            {formatActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">
                                        {log.summary ?? '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!isLoading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => canGoPrev && setPage(prev => prev - 1)}
                            disabled={!canGoPrev}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-gray-500 font-medium">
                            Page {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => canGoNext && setPage(prev => prev + 1)}
                            disabled={!canGoNext}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogTab;
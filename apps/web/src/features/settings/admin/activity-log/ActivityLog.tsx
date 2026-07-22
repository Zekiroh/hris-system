import { Calendar, Download, Search } from 'lucide-react';
import { useMemo } from 'react';
import {
    buildUserNameByEmail,
    formatActionLabel,
    formatDatePart,
    formatTimePart,
    getBadgeClassName,
    getUserLabel,
    prettifyDetails,
} from '../../../../lib/activityLog.utils';
import { useActivityLogs } from './hooks/useActivityLogs';

const ActivityLog = () => {
    const {
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
    } = useActivityLogs();

    const userNameByEmail = useMemo(() => buildUserNameByEmail(users), [users]);

    const displayRows = useMemo(() => {
        if (logs.length >= PAGE_SIZE) return logs;

        const placeholdersNeeded = PAGE_SIZE - logs.length;
        const placeholders = Array.from({ length: placeholdersNeeded }, (_, index) => ({
            __placeholder: true as const,
            id: `placeholder-${index}`,
        }));

        return [...logs, ...placeholders];
    }, [logs, PAGE_SIZE]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-72">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pro-input !pl-9 !py-1.5 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsTodayFilterActive((prev) => !prev)}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm transition-colors ${
                            isTodayFilterActive
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar
                            size={16}
                            className={isTodayFilterActive ? 'text-emerald-500' : 'text-gray-400'}
                        />
                        <span className="font-medium">
                            {isTodayFilterActive ? 'Today Only' : 'All Time'}
                        </span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="btn btn-secondary py-1.5 flex items-center gap-2"
                    >
                        <Download size={16} /> Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                                    Loading activity logs...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-red-500 italic">
                                    {error}
                                </td>
                            </tr>
                        ) : (
                            <>
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-gray-700 italic">
                                            No activity logs match your search criteria.
                                        </td>
                                    </tr>
                                )}

                                {displayRows.map((row) => {
                                    if ('__placeholder' in row) {
                                        return (
                                            <tr key={row.id}>
                                                <td className="text-gray-300">--</td>
                                                <td className="text-gray-300">--</td>
                                                <td className="text-gray-300">--</td>
                                                <td className="text-gray-300">--</td>
                                                <td className="text-gray-300">--</td>
                                            </tr>
                                        );
                                    }

                                    const actionLabel = formatActionLabel(row.action);

                                    return (
                                        <tr key={row.id}>
                                            <td className="whitespace-nowrap !font-medium !text-gray-900">
                                                {formatDatePart(row.createdAt)}
                                            </td>
                                            <td className="whitespace-nowrap !font-medium !text-gray-900">
                                                {formatTimePart(row.createdAt)}
                                            </td>
                                            <td className="!font-medium !text-gray-900">
                                                {getUserLabel(row, userNameByEmail)}
                                            </td>
                                            <td>
                                                <span
                                                    className={`
                                                        inline-flex items-center justify-center
                                                        px-2.5 py-0.5 rounded-full text-xs font-medium
                                                        whitespace-nowrap
                                                        ${getBadgeClassName(row.action)}
                                                    `}
                                                >
                                                    {actionLabel}
                                                </span>
                                            </td>
                                            <td className="text-gray-500">
                                                {prettifyDetails(row, userNameByEmail)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </>
                        )}
                    </tbody>
                </table>

                {!isLoading && !error && totalPages > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => canGoPrev && setPage((prev) => prev - 1)}
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
                            onClick={() => canGoNext && setPage((prev) => prev + 1)}
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

export default ActivityLog;

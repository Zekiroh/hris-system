import { Check, Plus, X } from 'lucide-react';
import type { AdminOvertimeRequestRow, StatusBadgeMap } from '../../../types/attendance';

type Props = {
    loadingOt: boolean;
    overtimeRequests: AdminOvertimeRequestRow[];
    statusBadge: StatusBadgeMap;
    reviewingOtId: number | null;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onShowAssignModal: () => void;
};

const DEFAULT_PAGE_SIZE = 10;

const invalidDates = new Set(['0001-01-01', '0001-01-01T00:00:00', '0001-01-01T00:00:00Z']);

const formatDate = (value: string) => {
    if (!value || value === '-' || value === '--' || value === '—') return '--';

    const normalized = value.trim();

    if (invalidDates.has(normalized) || normalized.startsWith('0001-01-01')) {
        return '--';
    }

    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return normalized;

    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
};

const formatDuration = (value: string) => {
    if (!value || value === '-' || value === '--' || value === '—') return '--';

    if (value.toLowerCase().includes('h') || value.toLowerCase().includes('m')) {
        return value;
    }

    const numeric = Number(value.replace(/hours?/i, '').trim());

    if (!Number.isFinite(numeric) || numeric <= 0) return '--';

    const totalMinutes = Math.round(numeric * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) return `m`;
    if (minutes === 0) return `h`;

    return `h m`;
};

const createPlaceholderRow = (id: number): AdminOvertimeRequestRow => ({
    id,
    date: '--',
    employee: '--',
    duration: '--',
    reason: '--',
    status: 'Pending',
});

const AdminOtTab = ({
    loadingOt,
    overtimeRequests,
    statusBadge,
    reviewingOtId,
    onApprove,
    onReject,
    onShowAssignModal,
}: Props) => {
    const hasRecords = overtimeRequests.length > 0;

    const rows = hasRecords
        ? [
              ...overtimeRequests,
              ...Array.from(
                  { length: Math.max(0, DEFAULT_PAGE_SIZE - overtimeRequests.length) },
                  (_, index) => createPlaceholderRow(-(index + 1))
              ),
          ]
        : Array.from({ length: DEFAULT_PAGE_SIZE - 1 }, (_, index) =>
              createPlaceholderRow(-(index + 1))
          );

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Overtime Requests</h3>

                <button onClick={onShowAssignModal} className="btn btn-primary">
                    <Plus className="h-4 w-4" /> Assign Overtime
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="pro-table min-w-full">
                        <thead>
                            <tr>
                                <th>DATE</th>
                                <th>EMPLOYEE</th>
                                <th>DURATION</th>
                                <th>REASON</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loadingOt ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-gray-500">
                                        Loading overtime requests...
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {!hasRecords && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="h-[48px] px-6 text-center align-middle text-sm font-medium text-gray-600"
                                            >
                                                No overtime requests yet.
                                            </td>
                                        </tr>
                                    )}

                                    {rows.map((row) => {
                                        const isPlaceholder = row.id < 0;

                                        return (
                                            <tr key={row.id}>
                                                <td className={`px-6 py-4 ${isPlaceholder ? 'text-gray-300' : 'text-slate-700'}`}>
                                                    {formatDate(row.date)}
                                                </td>

                                                <td className={`px-6 py-4 font-medium ${isPlaceholder ? 'text-gray-300' : 'text-gray-800'}`}>
                                                    {row.employee || '--'}
                                                </td>

                                                <td className={`px-6 py-4 font-mono ${isPlaceholder ? 'text-gray-300' : 'text-slate-700'}`}>
                                                    {formatDuration(row.duration)}
                                                </td>

                                                <td className={`px-6 py-4 ${isPlaceholder ? 'text-gray-300' : 'text-slate-600'}`}>
                                                    <p className="max-w-xs truncate text-xs">{row.reason || '--'}</p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    {isPlaceholder ? (
                                                        <span className="text-gray-300">--</span>
                                                    ) : (
                                                        <span className={`badge ${statusBadge[row.status]}`}>
                                                            <span className="badge-dot" />
                                                            {row.status}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4">
                                                    {isPlaceholder ? (
                                                        <span className="text-gray-300">--</span>
                                                    ) : row.status === 'Pending' ? (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => onApprove(row.id)}
                                                                disabled={reviewingOtId === row.id}
                                                                className="btn-ghost btn-icon bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                                title="Approve"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => onReject(row.id)}
                                                                disabled={reviewingOtId === row.id}
                                                                className="btn-ghost btn-icon bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                                title="Reject"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs italic text-gray-400">Resolved</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
                    <button type="button" className="btn btn-secondary" disabled>
                        Prev
                    </button>

                    <div className="text-sm text-gray-500">Page 1 of 1</div>

                    <button type="button" className="btn btn-secondary" disabled>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminOtTab;
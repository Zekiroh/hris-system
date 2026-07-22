import { X } from 'lucide-react';
import type { ClearanceActivityDto } from '../../../../lib/clearance';
import { formatDatePart, formatTimePart } from '../../../../lib/activityLog.utils';

type ClearanceActivityModalProps = {
    employeeName: string;
    activities: ClearanceActivityDto[];
    isLoadingActivities: boolean;
    activityError: string;
    onClose: () => void;
};

const ClearanceActivityModal = ({
    employeeName,
    activities,
    isLoadingActivities,
    activityError,
    onClose,
}: ClearanceActivityModalProps) => {
    const handleClose = () => {
        if (isLoadingActivities) return;
        onClose();
    };

    return (
        <div className="pro-modal-overlay" onClick={handleClose}>
            <div className="pro-modal max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="pro-modal-header border-b border-gray-100">
                    <div>
                        <h3>Clearance Activity History</h3>
                        <p className="text-xs text-gray-400 mt-1">{employeeName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoadingActivities}
                        className="btn-ghost btn-icon"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="pro-modal-body space-y-4 max-h-[60vh] overflow-y-auto">
                    {isLoadingActivities && (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                            Loading clearance activity history...
                        </div>
                    )}

                    {!isLoadingActivities && activityError && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                            {activityError}
                        </div>
                    )}

                    {!isLoadingActivities && !activityError && activities.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm italic">
                            No activity history found.
                        </div>
                    )}

                    {!isLoadingActivities && !activityError && activities.map(activity => (
                        <div key={activity.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{activity.action}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {activity.actorUserName?.trim() || 'System'}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 text-right shrink-0">
                                    {formatDatePart(activity.createdAtUtc)}
                                    <br />
                                    {formatTimePart(activity.createdAtUtc)}
                                </p>
                            </div>
                            {activity.remarks && (
                                <p className="text-xs text-gray-500 mt-3">{activity.remarks}</p>
                            )}
                        </div>
                    ))}
                </div>
                <div className="pro-modal-footer border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoadingActivities}
                        className="btn btn-secondary"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClearanceActivityModal;

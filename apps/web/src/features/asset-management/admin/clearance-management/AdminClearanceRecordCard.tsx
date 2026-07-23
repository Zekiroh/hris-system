import { CheckCircle, XCircle } from 'lucide-react';
import { clearanceStatusBadge } from '../../assetManagementConfig';
import type { ClearanceDto } from '../../../../services/api/clearance/clearance';

type AdminClearanceRecordCardProps = {
    record: ClearanceDto;
    updatingDepartmentApprovalId: number | null;
    updatingHrApprovalId: number | null;
    completingClearanceId: number | null;
    onUpdateDepartmentApproval: (id: number, approved: boolean) => void;
    onUpdateHrApproval: (id: number, approved: boolean) => void;
    onCompleteClearance: (id: number) => void;
    onOpenActivityHistory: (id: number, employeeName: string) => void;
};

const formatStatusLabel = (status: string) =>
    status === 'InProgress' ? 'In Progress' : status;

const clearanceRequirements = (record: ClearanceDto) => [
    {
        label: 'Asset Requirement',
        done: record.assetRequirementCompleted,
        doneLabel: 'Completed',
        pendingLabel: 'Pending',
    },
    {
        label: 'Department Approval',
        done: record.departmentApproved,
        doneLabel: 'Approved',
        pendingLabel: 'Pending',
    },
    {
        label: 'HR Approval',
        done: record.hrApproved,
        doneLabel: 'Approved',
        pendingLabel: 'Pending',
    },
];

const AdminClearanceRecordCard = ({
    record,
    updatingDepartmentApprovalId,
    updatingHrApprovalId,
    completingClearanceId,
    onUpdateDepartmentApproval,
    onUpdateHrApproval,
    onCompleteClearance,
    onOpenActivityHistory,
}: AdminClearanceRecordCardProps) => {
    const isUpdatingDepartmentApproval = updatingDepartmentApprovalId === record.id;
    const isDepartmentApprovalDisabled =
        isUpdatingDepartmentApproval || record.status === 'Completed';
    const isUpdatingHrApproval = updatingHrApprovalId === record.id;
    const isHrApprovalDisabled =
        isUpdatingHrApproval || record.status === 'Completed';
    const isCompletingClearance = completingClearanceId === record.id;
    const canCompleteClearance =
        record.assetRequirementCompleted &&
        record.departmentApproved &&
        record.hrApproved &&
        record.status !== 'Completed';

    return (
        <div className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-sm font-bold text-gray-800">{record.employeeName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {record.employeeNumber} • {record.department} • Last Day: {record.lastWorkingDay}
                    </p>
                </div>
                <span className={`badge ${clearanceStatusBadge[record.status] ?? 'badge-neutral'}`}>
                    <span className="badge-dot" />{formatStatusLabel(record.status)}
                </span>
            </div>
            <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Clearance Requirements</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
                {clearanceRequirements(record).map(item => (
                    <div
                        key={item.label}
                        className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                    >
                        {item.done ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={item.done ? 'text-gray-700' : 'text-gray-400'}>
                            {item.label}: {item.done ? item.doneLabel : item.pendingLabel}
                        </span>
                        {item.label === 'Department Approval' && (
                            <button
                                type="button"
                                className="btn btn-secondary !py-1 !px-2 !text-xs"
                                disabled={isDepartmentApprovalDisabled}
                                onClick={() => onUpdateDepartmentApproval(record.id, !record.departmentApproved)}
                            >
                                {isUpdatingDepartmentApproval
                                    ? 'Updating...'
                                    : record.departmentApproved ? 'Revoke' : 'Approve'}
                            </button>
                        )}
                        {item.label === 'HR Approval' && (
                            <button
                                type="button"
                                className="btn btn-secondary !py-1 !px-2 !text-xs"
                                disabled={isHrApprovalDisabled}
                                onClick={() => onUpdateHrApproval(record.id, !record.hrApproved)}
                            >
                                {isUpdatingHrApproval
                                    ? 'Updating...'
                                    : record.hrApproved ? 'Revoke' : 'Approve'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    type="button"
                    className="btn btn-secondary !py-1 !px-3 !text-xs"
                    onClick={() => onOpenActivityHistory(record.id, record.employeeName)}
                >
                    View History
                </button>
                <button
                    type="button"
                    className="btn btn-primary !py-1 !px-3 !text-xs"
                    disabled={isCompletingClearance || !canCompleteClearance}
                    onClick={() => onCompleteClearance(record.id)}
                >
                    {isCompletingClearance
                        ? 'Completing...'
                        : record.status === 'Completed' ? 'Completed' : 'Complete Clearance'}
                </button>
            </div>
        </div>
    );
};

export default AdminClearanceRecordCard;
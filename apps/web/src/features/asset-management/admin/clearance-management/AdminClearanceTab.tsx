import { Plus } from 'lucide-react';
import AdminClearanceRecordCard from './AdminClearanceRecordCard';
import type { ClearanceDto } from '../../../../services/api/clearance/clearance';

type AdminClearanceTabProps = {
    clearances: ClearanceDto[];
    isLoadingClearances: boolean;
    clearanceError: string;
    updatingDepartmentApprovalId: number | null;
    updatingHrApprovalId: number | null;
    completingClearanceId: number | null;
    onOpenNewClearance: () => void;
    onUpdateDepartmentApproval: (id: number, approved: boolean) => void;
    onUpdateHrApproval: (id: number, approved: boolean) => void;
    onCompleteClearance: (id: number) => void;
    onOpenActivityHistory: (id: number, employeeName: string) => void;
};

const AdminClearanceTab = ({
    clearances,
    isLoadingClearances,
    clearanceError,
    updatingDepartmentApprovalId,
    updatingHrApprovalId,
    completingClearanceId,
    onOpenNewClearance,
    onUpdateDepartmentApproval,
    onUpdateHrApproval,
    onCompleteClearance,
    onOpenActivityHistory,
}: AdminClearanceTabProps) => {
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">Exit Clearance Records</h3>
                <button onClick={onOpenNewClearance} className="btn btn-primary"><Plus className="w-4 h-4" /> New Clearance</button>
            </div>

            {clearanceError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {clearanceError}
                </div>
            )}

            <div className="space-y-4">
                {isLoadingClearances && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">Loading clearance records...</div>
                )}
                {!isLoadingClearances && clearances.map(record => (
                    <AdminClearanceRecordCard
                        key={record.id}
                        record={record}
                        updatingDepartmentApprovalId={updatingDepartmentApprovalId}
                        updatingHrApprovalId={updatingHrApprovalId}
                        completingClearanceId={completingClearanceId}
                        onUpdateDepartmentApproval={onUpdateDepartmentApproval}
                        onUpdateHrApproval={onUpdateHrApproval}
                        onCompleteClearance={onCompleteClearance}
                        onOpenActivityHistory={onOpenActivityHistory}
                    />
                ))}
                {!isLoadingClearances && clearances.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">No clearance records yet.</div>
                )}
            </div>
        </div>
    );
};

export default AdminClearanceTab;
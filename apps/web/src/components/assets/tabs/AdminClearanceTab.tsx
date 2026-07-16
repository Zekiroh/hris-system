import { Plus } from 'lucide-react';
import AdminClearanceRecordCard from '../AdminClearanceRecordCard';
import type { ClearanceDto } from '../../../lib/clearance';

type AdminClearanceTabProps = {
    clearances: ClearanceDto[];
    isLoadingClearances: boolean;
    clearanceError: string;
    onOpenNewClearance: () => void;
};

const AdminClearanceTab = ({
    clearances,
    isLoadingClearances,
    clearanceError,
    onOpenNewClearance,
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

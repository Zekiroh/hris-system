import { Plus } from 'lucide-react';
import AdminClearanceRecordCard from '../AdminClearanceRecordCard';
import type { ClearanceChecklist, ClearanceRecord } from '../assetManagementTypes';

type AdminClearanceTabProps = {
    clearanceRecords: ClearanceRecord[];
    onOpenNewClearance: () => void;
    onToggleChecklistItem: (recordId: string, item: keyof ClearanceChecklist) => void;
};

const AdminClearanceTab = ({
    clearanceRecords,
    onOpenNewClearance,
    onToggleChecklistItem,
}: AdminClearanceTabProps) => {
    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-gray-800">Exit Clearance Records</h3>
                <button onClick={onOpenNewClearance} className="btn btn-primary"><Plus className="w-4 h-4" /> New Clearance</button>
            </div>

            <div className="space-y-4">
                {clearanceRecords.map(record => (
                    <AdminClearanceRecordCard
                        key={record.id}
                        record={record}
                        onToggleChecklistItem={onToggleChecklistItem}
                    />
                ))}
                {clearanceRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm italic">No clearance records yet.</div>
                )}
            </div>
        </div>
    );
};

export default AdminClearanceTab;

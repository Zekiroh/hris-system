import { CheckCircle, XCircle } from 'lucide-react';
import {
    clearanceChecklistLabels,
    clearanceStatusBadge,
} from './assetManagementConfig';
import type { ClearanceChecklist, ClearanceRecord } from './assetManagementTypes';

type AdminClearanceRecordCardProps = {
    record: ClearanceRecord;
    onToggleChecklistItem: (recordId: string, item: keyof ClearanceChecklist) => void;
};

const AdminClearanceRecordCard = ({ record, onToggleChecklistItem }: AdminClearanceRecordCardProps) => {
    return (
        <div className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h4 className="text-sm font-bold text-gray-800">{record.employee}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {record.empId} • {record.department} • Last Day: {record.lastDay}
                    </p>
                </div>
                <span className={`badge ${clearanceStatusBadge[record.status]}`}>
                    <span className="badge-dot" />{record.status}
                </span>
            </div>
            <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Clearance Checklist</p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
                {clearanceChecklistLabels.map(item => (
                    <button
                        key={item.key}
                        onClick={() => onToggleChecklistItem(record.id, item.key)}
                        className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-70"
                        title={`Click to toggle ${item.label}`}
                    >
                        {record.checklist[item.key] ? (
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={record.checklist[item.key] ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminClearanceRecordCard;

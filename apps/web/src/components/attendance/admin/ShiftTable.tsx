import { Edit, Plus } from 'lucide-react';
import type { Shift } from '../../../lib/attendance';
import type { AdminShiftRecord, StatusBadgeMap } from '../../../types/attendance';

type Props = {
    shifts: AdminShiftRecord[];
    apiShifts: Shift[];
    loading: boolean;
    statusBadge: StatusBadgeMap;
    onEditShift: (shift: AdminShiftRecord) => void;
    onAddShift: () => void;
    getWorkingDaysLabel: (days: Shift['days']) => string;
};

const ShiftTable = ({
    shifts,
    apiShifts,
    loading,
    statusBadge,
    onEditShift,
    onAddShift,
    getWorkingDaysLabel,
}: Props) => {
    return (
        <>
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-800">Shift Schedules</h3>
                <button onClick={onAddShift} className="btn btn-primary">
                    <Plus className="h-4 w-4" /> Add Shift
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table w-full">
                    <thead>
                        <tr>
                            {[
                                'Shift Name',
                                'Time In',
                                'Time Out',
                                'Grace Period',
                                'Assigned',
                                'Status',
                                'Actions',
                            ].map((header) => (
                                <th key={header}>{header}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-10 text-center text-sm italic text-gray-500"
                                >
                                    Loading shifts...
                                </td>
                            </tr>
                        ) : shifts.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-6 py-10 text-center text-sm font-medium text-gray-600"
                                >
                                    No shift schedules found.
                                </td>
                            </tr>
                        ) : (
                            shifts.map((shift) => (
                                <tr key={shift.id}>
                                    <td className="!font-medium !text-gray-800">
                                        <div className="flex flex-col">
                                            <span>{shift.name}</span>
                                            {apiShifts.length > 0 && (
                                                <span className="mt-1 text-xs font-normal text-slate-400">
                                                    {getWorkingDaysLabel(
                                                        apiShifts.find(
                                                            (apiShift) => apiShift.id === shift.id
                                                        )?.days ?? []
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td>{shift.timeIn}</td>
                                    <td>{shift.timeOut}</td>
                                    <td>{shift.grace}</td>
                                    <td>{shift.employees}</td>

                                    <td>
                                        <span className={`badge ${statusBadge[shift.status]}`}>
                                            <span className="badge-dot" />
                                            {shift.status}
                                        </span>
                                    </td>

                                    <td>
                                        <button
                                            onClick={() => onEditShift(shift)}
                                            className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                                            title="Edit Shift"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ShiftTable;

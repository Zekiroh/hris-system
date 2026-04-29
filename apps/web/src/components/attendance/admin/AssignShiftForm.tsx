import type { Shift } from '../../../lib/attendance';

export type EmployeeOption = {
    id: string;
    employeeNumber: string;
    fullName: string;
};

type Props = {
    employees: EmployeeOption[];
    apiShifts: Shift[];
    loadingEmployees: boolean;
    assigning: boolean;
    selectedEmployeeId: string;
    selectedAssignShiftId: number | null;
    effectiveFrom: string;
    assignMessage: string | null;
    assignError: string | null;
    onSelectedEmployeeChange: (value: string) => void;
    onSelectedAssignShiftChange: (value: number | null) => void;
    onEffectiveFromChange: (value: string) => void;
    onAssignShift: () => void;
};

const AssignShiftForm = ({
    employees,
    apiShifts,
    loadingEmployees,
    assigning,
    selectedEmployeeId,
    selectedAssignShiftId,
    effectiveFrom,
    assignMessage,
    assignError,
    onSelectedEmployeeChange,
    onSelectedAssignShiftChange,
    onEffectiveFromChange,
    onAssignShift,
}: Props) => {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-5">
            <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-800">Assign Shift to Employee</h4>
                <p className="mt-1 text-sm text-slate-500">
                    Assign an active shift schedule to an employee. This becomes the basis for time
                    in, late, undertime, and overtime rules.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.4fr_1.2fr_1fr_auto]">
                <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Employee
                    </label>
                    <select
                        className="pro-input w-full"
                        value={selectedEmployeeId}
                        onChange={(event) => onSelectedEmployeeChange(event.target.value)}
                        disabled={loadingEmployees || assigning}
                    >
                        <option value="">
                            {loadingEmployees ? 'Loading employees...' : 'Select employee'}
                        </option>
                        {employees.map((employee) => (
                            <option key={employee.id} value={employee.id}>
                                {employee.employeeNumber} — {employee.fullName || 'No name'}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Shift
                    </label>
                    <select
                        className="pro-input w-full"
                        value={selectedAssignShiftId ?? ''}
                        onChange={(event) =>
                            onSelectedAssignShiftChange(
                                event.target.value ? Number(event.target.value) : null
                            )
                        }
                        disabled={assigning}
                    >
                        <option value="">Select shift</option>
                        {apiShifts
                            .filter((shift) => shift.isActive)
                            .map((shift) => (
                                <option key={shift.id} value={shift.id}>
                                    {shift.name}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Effective From
                    </label>
                    <input
                        type="date"
                        className="pro-input w-full"
                        value={effectiveFrom}
                        onChange={(event) => onEffectiveFromChange(event.target.value)}
                        disabled={assigning}
                    />
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        className="btn btn-primary h-[44px] w-full lg:w-auto"
                        onClick={onAssignShift}
                        disabled={assigning}
                    >
                        {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                </div>
            </div>

            {assignMessage && (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {assignMessage}
                </div>
            )}

            {assignError && (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {assignError}
                </div>
            )}
        </div>
    );
};

export default AssignShiftForm;

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import {
    assignShift,
    getShifts,
    updateShift,
    toApiTimeString,
    type Shift,
    type ShiftDay,
} from '../../../lib/attendance';
import type { AdminShiftRecord, StatusBadgeMap } from '../../../types/attendance';
import AssignShiftForm, { type EmployeeOption } from './AssignShiftForm';
import EditShiftModal from './EditShiftModal';
import ShiftDaysTable from './ShiftDaysTable';
import ShiftTable from './ShiftTable';

type Props = {
    shifts: AdminShiftRecord[];
    statusBadge: StatusBadgeMap;
    onEditShift: (shift: AdminShiftRecord) => void;
    onAddShift: () => void;
};

type PagedEmployeesResponse = {
    items: EmployeeOption[];
    totalCount: number;
    page: number;
    pageSize: number;
};

type ShiftDayField = 'isWorkingDay' | 'startTime' | 'breakStartTime' | 'breakEndTime' | 'endTime';
type ShiftDayValue = boolean | string | null;

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const todayApiDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) return error.message;
    return fallback;
};

const formatTime = (value?: string | null) => {
    if (!value) return '--';

    const [hourRaw, minuteRaw] = value.split(':');
    const hour = Number(hourRaw);
    const minute = Number(minuteRaw);

    if (Number.isNaN(hour) || Number.isNaN(minute)) return value.slice(0, 5);

    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
};

const getWorkingDaysLabel = (days: ShiftDay[]) => {
    const workingDays = days
        .filter((day) => day.isWorkingDay)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
        .map((day) => DAY_LABELS[day.dayOfWeek]?.slice(0, 3))
        .filter(Boolean);

    if (workingDays.length === 0) return '--';

    return workingDays.join(', ');
};

const getShiftStartTime = (shift: Shift) => {
    const firstWorkingDay = shift.days
        .filter((day) => day.isWorkingDay && day.startTime)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)[0];

    return formatTime(firstWorkingDay?.startTime);
};

const getShiftEndTime = (shift: Shift) => {
    const firstWorkingDay = shift.days
        .filter((day) => day.isWorkingDay && day.endTime)
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)[0];

    return formatTime(firstWorkingDay?.endTime);
};

const cloneDays = (days: ShiftDay[]) =>
    days
        .map((day) => ({ ...day }))
        .sort((a, b) => a.dayOfWeek - b.dayOfWeek);

const mapShiftToAdminRecord = (shift: Shift): AdminShiftRecord => {
    const assignedCount = Number(
        (shift as Shift & { assignedCount?: number | null }).assignedCount ?? 0
    );

    return {
        id: shift.id,
        name: shift.name,
        timeIn: getShiftStartTime(shift),
        timeOut: getShiftEndTime(shift),
        grace: `${shift.lateGraceMinutes} min`,
        employees: assignedCount,
        assignedCount,
        status: shift.isActive ? 'Active' : 'Inactive',
    };
};

const normalizeDayForApi = (day: ShiftDay): ShiftDay => {
    if (!day.isWorkingDay) {
        return {
            ...day,
            startTime: null,
            breakStartTime: null,
            breakEndTime: null,
            endTime: null,
        };
    }

    return {
        ...day,
        startTime: toApiTimeString(day.startTime),
        breakStartTime: toApiTimeString(day.breakStartTime),
        breakEndTime: toApiTimeString(day.breakEndTime),
        endTime: toApiTimeString(day.endTime),
    };
};

const validateShiftDays = (days: ShiftDay[]) => {
    const workingDays = days.filter((day) => day.isWorkingDay);

    if (workingDays.length === 0) {
        return 'At least one working day is required.';
    }

    for (const day of workingDays) {
        if (!day.startTime || !day.endTime) {
            return `${DAY_LABELS[day.dayOfWeek]} needs start and end time.`;
        }

        if (day.breakStartTime && day.breakEndTime) {
            const start = toApiTimeString(day.startTime);
            const breakStart = toApiTimeString(day.breakStartTime);
            const breakEnd = toApiTimeString(day.breakEndTime);
            const end = toApiTimeString(day.endTime);

            if (start && breakStart && breakStart <= start) {
                return `${DAY_LABELS[day.dayOfWeek]} break start must be after shift start.`;
            }

            if (breakStart && breakEnd && breakEnd <= breakStart) {
                return `${DAY_LABELS[day.dayOfWeek]} break end must be after break start.`;
            }

            if (breakEnd && end && end <= breakEnd) {
                return `${DAY_LABELS[day.dayOfWeek]} shift end must be after break end.`;
            }
        }
    }

    return null;
};

const AdminSetupTab = ({ shifts, statusBadge, onAddShift }: Props) => {
    const [apiShifts, setApiShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<EmployeeOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [selectedShiftId, setSelectedShiftId] = useState<number | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [selectedAssignShiftId, setSelectedAssignShiftId] = useState<number | null>(null);
    const [effectiveFrom, setEffectiveFrom] = useState(todayApiDate());
    const [assignMessage, setAssignMessage] = useState<string | null>(null);
    const [assignError, setAssignError] = useState<string | null>(null);
    const [daysMessage, setDaysMessage] = useState<string | null>(null);
    const [daysError, setDaysError] = useState<string | null>(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [editName, setEditName] = useState('');
    const [editGraceMinutes, setEditGraceMinutes] = useState('0');
    const [editIsActive, setEditIsActive] = useState(true);
    const [editedDays, setEditedDays] = useState<ShiftDay[]>([]);
    const [savingShift, setSavingShift] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    const applyLoadedShifts = useCallback(
        (loadedShifts: Shift[], preferredShiftId?: number | null) => {
            setApiShifts(loadedShifts);

            const firstShiftWithDays = loadedShifts.find(
                (shift) => shift.days && shift.days.length > 0
            );

            const nextSelectedId =
                preferredShiftId ??
                selectedShiftId ??
                firstShiftWithDays?.id ??
                loadedShifts[0]?.id ??
                null;

            setSelectedShiftId(nextSelectedId);

            if (!selectedAssignShiftId) {
                setSelectedAssignShiftId(firstShiftWithDays?.id ?? loadedShifts[0]?.id ?? null);
            }
        },
        [selectedAssignShiftId, selectedShiftId]
    );

    const loadShifts = useCallback(
        async (preferredShiftId?: number | null) => {
            const response = await getShifts({
                page: 1,
                pageSize: 50,
            });

            const loadedShifts = response.items ?? [];
            applyLoadedShifts(loadedShifts, preferredShiftId);

            return loadedShifts;
        },
        [applyLoadedShifts]
    );

    useEffect(() => {
        let mounted = true;

        const loadInitialShifts = async () => {
            try {
                setLoading(true);

                const response = await getShifts({
                    page: 1,
                    pageSize: 50,
                });

                if (!mounted) return;

                const loadedShifts = response.items ?? [];
                applyLoadedShifts(loadedShifts);
            } catch (error) {
                console.error('Failed to load shifts.', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        const loadEmployees = async () => {
            try {
                setLoadingEmployees(true);

                const response = await apiRequest<PagedEmployeesResponse>(
                    '/employees?page=1&pageSize=100&isActive=true'
                );

                if (!mounted) return;

                setEmployees(response.items ?? []);
            } catch (error) {
                console.error('Failed to load employees.', error);
            } finally {
                if (mounted) setLoadingEmployees(false);
            }
        };

        void loadInitialShifts();
        void loadEmployees();

        return () => {
            mounted = false;
        };
    }, [applyLoadedShifts]);

    const displayRows = useMemo(() => {
        if (apiShifts.length > 0) return apiShifts.map(mapShiftToAdminRecord);
        return shifts ?? [];
    }, [apiShifts, shifts]);

    const selectedShift = useMemo(() => {
        if (selectedShiftId === null) return null;
        return apiShifts.find((shift) => shift.id === selectedShiftId) ?? null;
    }, [apiShifts, selectedShiftId]);

    const handleEditShiftClick = (shift: AdminShiftRecord) => {
        const fullShift = apiShifts.find((item) => item.id === shift.id);
        if (!fullShift) return;

        setSelectedShiftId(fullShift.id);
        setEditingShift(fullShift);
        setEditName(fullShift.name);
        setEditGraceMinutes(String(fullShift.lateGraceMinutes ?? 0));
        setEditIsActive(fullShift.isActive);
        setEditedDays(cloneDays(fullShift.days ?? []));
        setDaysMessage(null);
        setDaysError(null);
        setEditError(null);
        setShowEditModal(true);
    };

    const handleCloseEditModal = () => {
        if (savingShift) return;

        setShowEditModal(false);
        setEditingShift(null);
        setEditError(null);
        setEditedDays([]);
    };

    const handleChangeEditDay = (dayId: number, field: ShiftDayField, value: ShiftDayValue) => {
        setEditError(null);
        setDaysMessage(null);
        setDaysError(null);

        setEditedDays((current) =>
            current.map((day) => {
                if (day.id !== dayId) return day;

                if (field === 'isWorkingDay') {
                    const isWorkingDay = Boolean(value);

                    if (!isWorkingDay) {
                        return {
                            ...day,
                            isWorkingDay: false,
                            startTime: null,
                            breakStartTime: null,
                            breakEndTime: null,
                            endTime: null,
                        };
                    }

                    return {
                        ...day,
                        isWorkingDay: true,
                        startTime: day.startTime ?? '08:30:00',
                        breakStartTime: day.breakStartTime ?? '12:00:00',
                        breakEndTime: day.breakEndTime ?? '13:00:00',
                        endTime: day.endTime ?? '17:30:00',
                    };
                }

                return {
                    ...day,
                    [field]: typeof value === 'string' && value ? `${value.slice(0, 5)}:00` : null,
                };
            })
        );
    };

    const handleSaveEditShift = async () => {
        if (!editingShift) return;

        const trimmedName = editName.trim();
        if (!trimmedName) {
            setEditError('Shift name is required.');
            return;
        }

        const grace = Number(editGraceMinutes);
        if (Number.isNaN(grace) || grace < 0) {
            setEditError('Grace period must be a valid number.');
            return;
        }

        const validationError = validateShiftDays(editedDays);
        if (validationError) {
            setEditError(validationError);
            return;
        }

        try {
            setSavingShift(true);
            setEditError(null);
            setDaysMessage(null);
            setDaysError(null);

            await updateShift(editingShift.id, {
                code: editingShift.code,
                name: trimmedName,
                description: editingShift.description ?? null,
                lateGraceMinutes: grace,
                isFlexible: editingShift.isFlexible,
                isActive: editIsActive,
                days: editedDays.map(normalizeDayForApi),
            });

            await loadShifts(editingShift.id);
            setDaysMessage(`${trimmedName} updated.`);
            setShowEditModal(false);
            setEditingShift(null);
            setEditedDays([]);
        } catch (error) {
            console.error('Failed to update shift.', error);
            setEditError(getErrorMessage(error, 'Failed to update shift.'));
        } finally {
            setSavingShift(false);
        }
    };

    const handleAssignShift = async () => {
        setAssignMessage(null);
        setAssignError(null);

        if (!selectedEmployeeId || !selectedAssignShiftId || !effectiveFrom) {
            setAssignError('Please select an employee, shift, and effective date.');
            return;
        }

        try {
            setAssigning(true);

            await assignShift({
                employeeId: selectedEmployeeId,
                shiftId: selectedAssignShiftId,
                effectiveFrom,
            });

            const loadedShifts = await loadShifts(selectedAssignShiftId);

            const employee = employees.find((item) => item.id === selectedEmployeeId);
            const shift = loadedShifts.find((item) => item.id === selectedAssignShiftId);

            setAssignMessage(
                `${employee?.fullName ?? 'Employee'} assigned to ${
                    shift?.name ?? 'selected shift'
                }.`
            );
        } catch (error) {
            console.error('Failed to assign shift.', error);
            setAssignError('Failed to assign shift. Please verify the employee and shift.');
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="space-y-5">
            <ShiftTable
                shifts={displayRows}
                apiShifts={apiShifts}
                loading={loading}
                statusBadge={statusBadge}
                onEditShift={handleEditShiftClick}
                onAddShift={onAddShift}
                getWorkingDaysLabel={getWorkingDaysLabel}
            />

            <ShiftDaysTable
                selectedShift={selectedShift}
                dayLabels={DAY_LABELS}
                readOnly
            />

            {daysMessage && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {daysMessage}
                </div>
            )}

            {daysError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {daysError}
                </div>
            )}

            <AssignShiftForm
                employees={employees}
                apiShifts={apiShifts}
                loadingEmployees={loadingEmployees}
                assigning={assigning}
                selectedEmployeeId={selectedEmployeeId}
                selectedAssignShiftId={selectedAssignShiftId}
                effectiveFrom={effectiveFrom}
                assignMessage={assignMessage}
                assignError={assignError}
                onSelectedEmployeeChange={setSelectedEmployeeId}
                onSelectedAssignShiftChange={setSelectedAssignShiftId}
                onEffectiveFromChange={setEffectiveFrom}
                onAssignShift={handleAssignShift}
            />

            <EditShiftModal
                open={showEditModal}
                shift={editingShift}
                days={editedDays}
                name={editName}
                graceMinutes={editGraceMinutes}
                isActive={editIsActive}
                saving={savingShift}
                error={editError}
                onClose={handleCloseEditModal}
                onNameChange={setEditName}
                onGraceMinutesChange={setEditGraceMinutes}
                onIsActiveChange={setEditIsActive}
                onChangeDay={handleChangeEditDay}
                onSave={handleSaveEditShift}
            />
        </div>
    );
};

export default AdminSetupTab;

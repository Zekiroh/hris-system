import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEmployees, type EmployeeDto } from '../../../lib/employees';
import {
    createCompensation,
    getCompensations,
    updateCompensation,
    type CreateEmployeeCompensationRequestDto,
    type EmployeeCompensationDto,
    type UpdateEmployeeCompensationRequestDto,
} from '../../../lib/payroll';
import { emptyCompensationForm } from '../config/constants';
import { extractEmployeeItems } from '../config/helpers';
import type { CompensationFormState } from '../config/types';

export const useCompensationManagement = () => {
    const [loadingCompensations, setLoadingCompensations] = useState(true);
    const [savingCompensation, setSavingCompensation] = useState(false);
    const [compensations, setCompensations] = useState<EmployeeCompensationDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);
    const [editingCompensation, setEditingCompensation] = useState<EmployeeCompensationDto | null>(null);
    const [compensationForm, setCompensationForm] = useState<CompensationFormState>(emptyCompensationForm);
    const [compensationError, setCompensationError] = useState('');
    const [compensationSuccess, setCompensationSuccess] = useState('');

    const loadCompensationData = useCallback(async () => {
        setLoadingCompensations(true);
        setCompensationError('');

        try {
            const [compensationResponse, employeeResponse] = await Promise.all([
                getCompensations(),
                getEmployees({ page: 1, pageSize: 100, isActive: true }),
            ]);

            setCompensations(compensationResponse);
            setEmployees(extractEmployeeItems(employeeResponse));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load compensation records.';
            setCompensationError(message);
            setCompensations([]);
            setEmployees([]);
        } finally {
            setLoadingCompensations(false);
        }
    }, []);

    useEffect(() => {
        void loadCompensationData();
    }, [loadCompensationData]);

    const activeCompensationCount = compensations.filter((compensation) => compensation.isActive).length;
    const employeesWithoutCompensation = useMemo(
        () =>
            employees.filter(
                (employee) => !compensations.some((compensation) => compensation.employeeId === employee.id && compensation.isActive)
            ),
        [compensations, employees]
    );

    const resetCompensation = useCallback(() => {
        setEditingCompensation(null);
        setCompensationForm(emptyCompensationForm);
        setCompensationError('');
        setCompensationSuccess('');
    }, []);

    const prepareCreateCompensation = useCallback(() => {
        resetCompensation();
    }, [resetCompensation]);

    const prepareEditCompensation = useCallback((compensation: EmployeeCompensationDto) => {
        setEditingCompensation(compensation);
        setCompensationForm({
            employeeId: compensation.employeeId,
            compensationType: compensation.compensationType || 'Monthly',
            baseAmount: String(compensation.baseAmount),
            effectiveFrom: compensation.effectiveFrom?.slice(0, 10) || new Date().toISOString().slice(0, 10),
            effectiveTo: compensation.effectiveTo?.slice(0, 10) || '',
            isActive: compensation.isActive,
        });
        setCompensationError('');
        setCompensationSuccess('');
    }, []);

    const handleSaveCompensation = useCallback(async (onSuccess?: () => void) => {
        setCompensationError('');
        setCompensationSuccess('');

        const parsedAmount = Number(compensationForm.baseAmount);

        if (!editingCompensation && !compensationForm.employeeId) {
            setCompensationError('Employee is required.');
            return;
        }

        if (!compensationForm.compensationType.trim()) {
            setCompensationError('Compensation type is required.');
            return;
        }

        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            setCompensationError('Base amount must be greater than zero.');
            return;
        }

        if (!compensationForm.effectiveFrom) {
            setCompensationError('Effective from date is required.');
            return;
        }

        setSavingCompensation(true);

        try {
            if (editingCompensation) {
                const dto: UpdateEmployeeCompensationRequestDto = {
                    compensationType: compensationForm.compensationType,
                    baseAmount: parsedAmount,
                    effectiveFrom: compensationForm.effectiveFrom,
                    effectiveTo: compensationForm.effectiveTo || null,
                    isActive: compensationForm.isActive,
                };

                await updateCompensation(editingCompensation.id, dto);
                setCompensationSuccess('Compensation updated successfully.');
            } else {
                const dto: CreateEmployeeCompensationRequestDto = {
                    employeeId: compensationForm.employeeId,
                    compensationType: compensationForm.compensationType,
                    baseAmount: parsedAmount,
                    effectiveFrom: compensationForm.effectiveFrom,
                    effectiveTo: compensationForm.effectiveTo || null,
                    isActive: compensationForm.isActive,
                };

                await createCompensation(dto);
                setCompensationSuccess('Compensation created successfully.');
            }

            await loadCompensationData();
            onSuccess?.();
            resetCompensation();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save compensation.';
            setCompensationError(message);
        } finally {
            setSavingCompensation(false);
        }
    }, [compensationForm, editingCompensation, loadCompensationData, resetCompensation]);

    return {
        loadingCompensations,
        savingCompensation,
        compensations,
        employees,
        editingCompensation,
        compensationForm,
        setCompensationForm,
        compensationError,
        compensationSuccess,
        activeCompensationCount,
        employeesWithoutCompensation,
        resetCompensation,
        prepareCreateCompensation,
        prepareEditCompensation,
        handleSaveCompensation,
        loadCompensationData,
    };
};

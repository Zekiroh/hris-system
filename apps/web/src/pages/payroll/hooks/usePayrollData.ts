import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getPayrollPeriods,
    getPayrollRecords,
    processPayroll,
    type PayrollPeriodDto,
    type PayrollRecordDto,
} from '../../../lib/payroll';
import { formatCurrency, formatPeriod } from '../config/helpers';
import type { PayrollRecordRow } from '../config/types';

export const usePayrollData = () => {
    const [loadingPayroll, setLoadingPayroll] = useState(true);
    const [processingPayroll, setProcessingPayroll] = useState(false);
    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriodDto[]>([]);
    const [payrollRecordsByPeriod, setPayrollRecordsByPeriod] = useState<Record<number, PayrollRecordDto[]>>({});
    const [processStartDate, setProcessStartDate] = useState('');
    const [processEndDate, setProcessEndDate] = useState('');
    const [payrollError, setPayrollError] = useState('');
    const [payrollSuccess, setPayrollSuccess] = useState('');

    const loadPayrollData = useCallback(async () => {
        setLoadingPayroll(true);
        setPayrollError('');

        try {
            const periods = await getPayrollPeriods();
            const sortedPeriods = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
            const recordsByPeriodEntries = await Promise.all(
                sortedPeriods.map(async (period) => [period.id, await getPayrollRecords(period.id)] as const)
            );

            setPayrollPeriods(sortedPeriods);
            setPayrollRecordsByPeriod(Object.fromEntries(recordsByPeriodEntries));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load payroll records.';
            setPayrollError(message);
            setPayrollPeriods([]);
            setPayrollRecordsByPeriod({});
        } finally {
            setLoadingPayroll(false);
        }
    }, []);

    useEffect(() => {
        void loadPayrollData();
    }, [loadPayrollData]);

    const payrollRecords = useMemo<PayrollRecordRow[]>(
        () =>
            payrollPeriods.map((period) => {
                const records = payrollRecordsByPeriod[period.id] ?? [];
                const grossPay = records.reduce((sum, record) => sum + record.grossPay, 0);
                const deductions = records.reduce((sum, record) => sum + record.totalDeductions, 0);
                const netPay = records.reduce((sum, record) => sum + record.netPay, 0);

                return {
                    period: formatPeriod(period),
                    employees: records.length,
                    grossPay: formatCurrency(grossPay),
                    deductions: formatCurrency(deductions),
                    netPay: formatCurrency(netPay),
                    status: period.status,
                    periodId: period.id,
                    records,
                };
            }),
        [payrollPeriods, payrollRecordsByPeriod]
    );

    const latestPayrollRecords = payrollRecords[0]?.records ?? [];

    const totals = useMemo(() => {
        const records = payrollRecords.flatMap((record) => record.records);
        const grossPay = records.reduce((sum, record) => sum + record.grossPay, 0);
        const deductions = records.reduce((sum, record) => sum + record.totalDeductions, 0);
        const netPay = records.reduce((sum, record) => sum + record.netPay, 0);
        const deductionRate = grossPay > 0 ? (deductions / grossPay) * 100 : 0;

        return {
            grossPay,
            deductions,
            netPay,
            deductionRate,
        };
    }, [payrollRecords]);

    const payslipList = latestPayrollRecords.map((record) => ({
        name: record.employeeName,
        id: record.employeeNumber,
        netPay: formatCurrency(record.netPay),
        status: record.status,
        record,
    }));

    const handleProcessPayroll = useCallback(async (onSuccess?: () => void) => {
        setPayrollError('');
        setPayrollSuccess('');

        if (!processStartDate || !processEndDate) {
            setPayrollError('Payroll start and end dates are required.');
            return;
        }

        if (processStartDate > processEndDate) {
            setPayrollError('Payroll start date cannot be later than end date.');
            return;
        }

        setProcessingPayroll(true);

        try {
            await processPayroll({
                startDate: processStartDate,
                endDate: processEndDate,
            });

            setPayrollSuccess('Payroll processed successfully.');
            onSuccess?.();
            setProcessStartDate('');
            setProcessEndDate('');
            await loadPayrollData();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to process payroll.';
            setPayrollError(message);
        } finally {
            setProcessingPayroll(false);
        }
    }, [loadPayrollData, processEndDate, processStartDate]);

    return {
        loadingPayroll,
        processingPayroll,
        payrollPeriods,
        payrollRecords,
        latestPayrollRecords,
        totals,
        payslipList,
        processStartDate,
        processEndDate,
        payrollError,
        payrollSuccess,
        setProcessStartDate,
        setProcessEndDate,
        handleProcessPayroll,
        loadPayrollData,
    };
};

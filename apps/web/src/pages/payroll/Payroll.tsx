import { useEffect, useMemo, useState } from 'react';
import {
    DollarSign,
    TrendingDown,
    Percent,
} from 'lucide-react';
import {
    createCompensation,
    getCompensations,
    getPayrollPeriods,
    getPayrollRecords,
    processPayroll,
    updateCompensation,
    type CreateEmployeeCompensationRequestDto,
    type EmployeeCompensationDto,
    type PayrollPeriodDto,
    type PayrollRecordDto,
    type UpdateEmployeeCompensationRequestDto,
} from '../../lib/payroll';
import { getEmployees, type EmployeeDto } from '../../lib/employees';
import { emptyCompensationForm, tabs } from './config/constants';
import {
    extractEmployeeItems,
    formatCurrency,
    formatPeriod,
} from './config/helpers';
import type { CompensationFormState, PayrollRecordRow, Tab } from './config/types';
import CompensationModal from './components/CompensationModal';
import CompensationTab from './components/CompensationTab';
import ComputeThirteenthMonthModal from './components/ComputeThirteenthMonthModal';
import DeductionsTab from './components/DeductionsTab';
import GeneratePayslipsModal from './components/GeneratePayslipsModal';
import PayslipPreviewModal from './components/PayslipPreviewModal';
import PayslipTab from './components/PayslipTab';
import PayrollDetailsModal from './components/PayrollDetailsModal';
import PayrollRecordsTab from './components/PayrollRecordsTab';
import ProcessPayrollModal from './components/ProcessPayrollModal';
import RemittanceModal from './components/RemittanceModal';
import ThirteenthMonthTab from './components/ThirteenthMonthTab';

const Payroll = () => {
    const [activeTab, setActiveTab] = useState<Tab>('records');
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRemittanceModal, setShowRemittanceModal] = useState(false);
    const [showComputeModal, setShowComputeModal] = useState(false);
    const [showGeneratePayslips, setShowGeneratePayslips] = useState(false);
    const [showPayslipPreview, setShowPayslipPreview] = useState(false);
    const [showCompensationModal, setShowCompensationModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PayrollRecordRow | null>(null);
    const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecordDto | null>(null);
    const [editingCompensation, setEditingCompensation] = useState<EmployeeCompensationDto | null>(null);
    const [compensationForm, setCompensationForm] = useState<CompensationFormState>(emptyCompensationForm);

    const [loadingPayroll, setLoadingPayroll] = useState(true);
    const [loadingCompensations, setLoadingCompensations] = useState(true);
    const [savingCompensation, setSavingCompensation] = useState(false);
    const [processingPayroll, setProcessingPayroll] = useState(false);

    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriodDto[]>([]);
    const [payrollRecordsByPeriod, setPayrollRecordsByPeriod] = useState<Record<number, PayrollRecordDto[]>>({});
    const [compensations, setCompensations] = useState<EmployeeCompensationDto[]>([]);
    const [employees, setEmployees] = useState<EmployeeDto[]>([]);

    const [processStartDate, setProcessStartDate] = useState('');
    const [processEndDate, setProcessEndDate] = useState('');
    const [payrollError, setPayrollError] = useState('');
    const [payrollSuccess, setPayrollSuccess] = useState('');
    const [compensationError, setCompensationError] = useState('');
    const [compensationSuccess, setCompensationSuccess] = useState('');

    const loadPayrollData = async () => {
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
    };

    const loadCompensationData = async () => {
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
    };

    useEffect(() => {
        void loadPayrollData();
        void loadCompensationData();
    }, []);

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

    const statCards = [
        { label: 'Total Payroll', value: formatCurrency(totals.grossPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Total Deductions', value: formatCurrency(totals.deductions), icon: TrendingDown, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Deduction Rate', value: `${totals.deductionRate.toFixed(1)}%`, icon: Percent, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Net Payroll', value: formatCurrency(totals.netPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const govDeductions = [
        { name: 'SSS Contributions', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#2563eb' },
        { name: 'PhilHealth', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#059669' },
        { name: 'Pag-IBIG', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#d97706' },
        { name: 'Withholding Tax', status: 'Not configured', desc: 'Awaiting Government Compliance setup', color: '#dc2626' },
    ];

    const payslipList = latestPayrollRecords.map((record) => ({
        name: record.employeeName,
        id: record.employeeNumber,
        netPay: formatCurrency(record.netPay),
        status: record.status,
        record,
    }));

    const activeCompensationCount = compensations.filter((compensation) => compensation.isActive).length;
    const employeesWithoutCompensation = employees.filter(
        (employee) => !compensations.some((compensation) => compensation.employeeId === employee.id && compensation.isActive)
    );

    const selectedPayslip = selectedPayslipRecord ?? latestPayrollRecords[0] ?? null;
    const selectedPayslipEarnings = selectedPayslip?.items.filter((item) => item.type === 'Earning') ?? [];
    const selectedPayslipDeductions = selectedPayslip?.items.filter((item) => item.type === 'Deduction') ?? [];

    const selectedPayrollPeriod = selectedPayslip
        ? payrollPeriods.find((period) => period.id === selectedPayslip.payrollPeriodId)
        : undefined;

    const resetCompensationModal = () => {
        setEditingCompensation(null);
        setCompensationForm(emptyCompensationForm);
        setCompensationError('');
        setCompensationSuccess('');
    };

    const openCreateCompensationModal = () => {
        resetCompensationModal();
        setShowCompensationModal(true);
    };

    const openEditCompensationModal = (compensation: EmployeeCompensationDto) => {
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
        setShowCompensationModal(true);
    };

    const handleSaveCompensation = async () => {
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
            setShowCompensationModal(false);
            resetCompensationModal();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to save compensation.';
            setCompensationError(message);
        } finally {
            setSavingCompensation(false);
        }
    };

    const handleProcessPayroll = async () => {
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
            setShowProcessModal(false);
            setProcessStartDate('');
            setProcessEndDate('');
            await loadPayrollData();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to process payroll.';
            setPayrollError(message);
        } finally {
            setProcessingPayroll(false);
        }
    };

    const statusBadge: Record<string, string> = {
        Processed: 'badge-success',
        Pending: 'badge-warning',
        Computed: 'badge-success',
        Generated: 'badge-success',
        Active: 'badge-success',
        Inactive: 'badge-warning',
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="page-header animate-fade-in-up">
                <h1>Payroll</h1>
                <p>Manage payroll processing, compensation, deductions, and payslips</p>
            </div>

            {payrollError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {payrollError}
                </div>
            )}

            {payrollSuccess && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {payrollSuccess}
                </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="stat-label">{card.label}</p>
                                <p className="stat-value text-lg">{card.value}</p>
                            </div>
                            <div className="stat-icon">
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <div className="pro-tabs">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                {/* Tab: Payroll Records */}
                {activeTab === 'records' && (
                    <PayrollRecordsTab
                        loadingPayroll={loadingPayroll}
                        payrollRecords={payrollRecords}
                        totals={{
                            grossPay: totals.grossPay,
                            deductions: totals.deductions,
                            netPay: totals.netPay,
                        }}
                        onProcessPayroll={() => setShowProcessModal(true)}
                        onViewRecord={(record) => {
                            setSelectedRecord(record);
                            setShowDetailsModal(true);
                        }}
                    />
                )}

                {/* Tab: Compensation */}
                {activeTab === 'compensation' && (
                    <CompensationTab
                        loadingCompensations={loadingCompensations}
                        compensations={compensations}
                        activeCompensationCount={activeCompensationCount}
                        employeesWithoutCompensation={employeesWithoutCompensation}
                        compensationError={compensationError}
                        compensationSuccess={compensationSuccess}
                        onAddCompensation={openCreateCompensationModal}
                        onEditCompensation={openEditCompensationModal}
                    />
                )}

                {/* Tab: Deductions */}
                {activeTab === 'deductions' && (
                    <DeductionsTab
                        govDeductions={govDeductions}
                        onGenerateRemittance={() => setShowRemittanceModal(true)}
                    />
                )}
                {/* Tab: 13th Month */}
                {activeTab === '13th' && (
                    <ThirteenthMonthTab
                        onCompute={() => setShowComputeModal(true)}
                    />
                )}

                {/* Tab: Payslip */}
                {activeTab === 'payslip' && (
                    <PayslipTab
                        loadingPayroll={loadingPayroll}
                        payslipList={payslipList}
                        statusBadge={statusBadge}
                        onGeneratePayslips={() => setShowGeneratePayslips(true)}
                        onPreview={(record) => {
                            setSelectedPayslipRecord(record);
                            setShowPayslipPreview(true);
                        }}
                    />
                )}
                </div>
            </div>

            {/* Process Payroll Modal */}
            <ProcessPayrollModal
                open={showProcessModal}
                processStartDate={processStartDate}
                processEndDate={processEndDate}
                processingPayroll={processingPayroll}
                onStartDateChange={setProcessStartDate}
                onEndDateChange={setProcessEndDate}
                onClose={() => setShowProcessModal(false)}
                onProcess={handleProcessPayroll}
            />

            {/* Compensation Modal */}
            <CompensationModal
                open={showCompensationModal}
                editingCompensation={editingCompensation}
                compensationForm={compensationForm}
                employees={employees}
                compensationError={compensationError}
                savingCompensation={savingCompensation}
                onClose={() => {
                    setShowCompensationModal(false);
                    resetCompensationModal();
                }}
                onSave={handleSaveCompensation}
                setCompensationForm={setCompensationForm}
            />

            {/* Details Modal */}
            <PayrollDetailsModal
                open={showDetailsModal}
                record={selectedRecord}
                onClose={() => setShowDetailsModal(false)}
            />

            {/* Remittance Modal */}
            <RemittanceModal
                open={showRemittanceModal}
                onClose={() => setShowRemittanceModal(false)}
            />

            {/* Compute 13th Modal */}
            <ComputeThirteenthMonthModal
                open={showComputeModal}
                onClose={() => setShowComputeModal(false)}
            />

            {/* Generate Payslips Modal */}
            <GeneratePayslipsModal
                open={showGeneratePayslips}
                payslipCount={latestPayrollRecords.length}
                onClose={() => setShowGeneratePayslips(false)}
            />

            {/* Payslip Preview Modal */}
            <PayslipPreviewModal
                open={showPayslipPreview}
                selectedPayslip={selectedPayslip}
                selectedPayslipEarnings={selectedPayslipEarnings}
                selectedPayslipDeductions={selectedPayslipDeductions}
                selectedPayrollPeriod={selectedPayrollPeriod}
                onClose={() => setShowPayslipPreview(false)}
            />
        </div>
    );
};

export default Payroll;

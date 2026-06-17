import { useEffect, useMemo, useState } from 'react';
import {
    DollarSign,
    TrendingDown,
    Percent,
    FileText,
    X,
    Download,
    Eye,
    Printer,
    WalletCards,
    Plus,
    Edit3,
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

type Tab = 'records' | 'compensation' | 'deductions' | '13th' | 'payslip';

type PayrollRecordRow = {
    period: string;
    employees: number;
    grossPay: string;
    deductions: string;
    netPay: string;
    status: string;
    periodId: number;
    records: PayrollRecordDto[];
};

type CompensationFormState = {
    employeeId: string;
    compensationType: string;
    baseAmount: string;
    effectiveFrom: string;
    effectiveTo: string;
    isActive: boolean;
};

const emptyCompensationForm: CompensationFormState = {
    employeeId: '',
    compensationType: 'Monthly',
    baseAmount: '',
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    isActive: true,
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);

const formatDate = (value?: string | null) => {
    if (!value) return '—';

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const formatPeriod = (period: PayrollPeriodDto) => {
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return `${period.startDate} - ${period.endDate}`;
    }

    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }

    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
};

const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'E';
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getEmployeeDisplayName = (employee: EmployeeDto) => {
    const firstName = employee.firstName?.trim() ?? '';
    const lastName = employee.lastName?.trim() ?? '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || employee.employeeNumber;
};


type EmployeesResponse = Awaited<ReturnType<typeof getEmployees>>;

const extractEmployeeItems = (response: EmployeesResponse): EmployeeDto[] => {
    const payload = response && typeof response === 'object' && 'data' in response
        ? response.data
        : response;

    return payload && typeof payload === 'object' && 'items' in payload
        ? payload.items ?? []
        : [];
};

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

    const tabs = [
        { id: 'records' as Tab, label: 'Payroll Records', icon: FileText },
        { id: 'compensation' as Tab, label: 'Compensation', icon: WalletCards },
        { id: 'deductions' as Tab, label: 'Deductions', icon: TrendingDown },
        { id: '13th' as Tab, label: '13th Month Pay', icon: DollarSign },
        { id: 'payslip' as Tab, label: 'Payslip', icon: Printer },
    ];

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
            const compensationResponse = await getCompensations();
            const allEmployees: EmployeeDto[] = [];
            const pageSize = 100;
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const employeeResponse = await getEmployees({ page, pageSize, isActive: true });
                const employeeItems = extractEmployeeItems(employeeResponse);

                allEmployees.push(...employeeItems);
                hasMore = employeeItems.length === pageSize;
                page += 1;
            }

            setCompensations(compensationResponse);
            setEmployees(allEmployees);
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
    const selectedPayslipEarnings = selectedPayslip?.items?.filter((item) => item.type === 'Earning') ?? [];
    const selectedPayslipDeductions = selectedPayslip?.items?.filter((item) => item.type === 'Deduction') ?? [];

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

    return (
        <div className="p-6 space-y-6 fade-in">
            <div>
                <h1>Payroll</h1>
                <p>Manage payroll processing, compensation, deductions, and payslips</p>
            </div>

            {payrollError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {payrollError}
                </div>
            )}

            {payrollSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                    {payrollSuccess}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.label} className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg" style={{ background: stat.gradient }}>
                            <div className="relative z-10">
                                <p className="text-sm font-semibold opacity-90">{stat.label}</p>
                                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                            </div>
                            <div className="absolute top-1/2 right-6 -translate-y-1/2 bg-white/20 p-3 rounded-xl">
                                <Icon className="w-6 h-6" />
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />
                        </div>
                    );
                })}
            </div>

            <div className="pro-card">
                <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-600 hover:bg-white/50'}`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab: Payroll Records */}
                {activeTab === 'records' && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800">Payroll Records</h3>
                            <button onClick={() => setShowProcessModal(true)} className="btn btn-primary">Process Payroll</button>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="pro-table">
                                <thead><tr><th>Period</th><th>Employees</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {loadingPayroll ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-sm text-gray-500">Loading payroll records...</td>
                                        </tr>
                                    ) : payrollRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-sm text-gray-500">No payroll records found.</td>
                                        </tr>
                                    ) : (
                                        payrollRecords.map((r, idx) => (
                                            <tr key={`${r.periodId}-${idx}`}>
                                                <td>{r.period}</td>
                                                <td>{r.employees}</td>
                                                <td>{r.grossPay}</td>
                                                <td className="text-red-500">{r.deductions}</td>
                                                <td className="font-bold">{r.netPay}</td>
                                                <td><span className="badge badge-success">● {r.status}</span></td>
                                                <td>
                                                    <button
                                                        onClick={() => { setSelectedRecord(r); setShowDetailsModal(true); }}
                                                        className="btn-ghost btn-icon"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Payroll Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-xl font-bold text-gray-800">{formatCurrency(totals.grossPay)}</p><p className="text-xs text-gray-500">Total Gross</p></div>
                                <div><p className="text-xl font-bold text-red-500">{formatCurrency(totals.deductions)}</p><p className="text-xs text-gray-500">Total Deductions</p></div>
                                <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netPay)}</p><p className="text-xs text-gray-500">Total Net</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Compensation */}
                {activeTab === 'compensation' && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-base font-bold text-gray-800">Employee Compensation</h3>
                                <p className="text-sm text-gray-500">Assign and update salary records used by payroll processing.</p>
                            </div>
                            <button onClick={openCreateCompensationModal} className="btn btn-primary">
                                <Plus className="w-4 h-4" /> Add Compensation
                            </button>
                        </div>

                        {compensationError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                {compensationError}
                            </div>
                        )}
                        {compensationSuccess && (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                                {compensationSuccess}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">Active Compensation</p>
                                <p className="mt-1 text-2xl font-bold text-emerald-600">{activeCompensationCount}</p>
                            </div>
                            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">Missing Compensation</p>
                                <p className="mt-1 text-2xl font-bold text-orange-600">{employeesWithoutCompensation.length}</p>
                            </div>
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <p className="text-xs font-semibold uppercase text-gray-500">Payroll Source</p>
                                <p className="mt-1 text-sm font-bold text-blue-600">Active employee compensation</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-gray-200">
                            <table className="pro-table">
                                <thead><tr><th>Employee</th><th>Department</th><th>Position</th><th>Type</th><th>Base Amount</th><th>Effective From</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {loadingCompensations ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-sm text-gray-500">Loading compensation records...</td>
                                        </tr>
                                    ) : compensations.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-8 text-sm text-gray-500">No compensation records found.</td>
                                        </tr>
                                    ) : (
                                        compensations.map((compensation) => (
                                            <tr key={compensation.id}>
                                                <td>
                                                    <div className="font-semibold text-gray-800">{compensation.employeeName}</div>
                                                    <div className="text-xs text-gray-400">{compensation.employeeNumber}</div>
                                                </td>
                                                <td>{compensation.department || '—'}</td>
                                                <td>{compensation.position || '—'}</td>
                                                <td>{compensation.compensationType}</td>
                                                <td className="font-bold">{formatCurrency(compensation.baseAmount)}</td>
                                                <td>{formatDate(compensation.effectiveFrom)}</td>
                                                <td><span className={`badge ${compensation.isActive ? 'badge-success' : 'badge-warning'}`}>● {compensation.isActive ? 'Active' : 'Inactive'}</span></td>
                                                <td>
                                                    <button onClick={() => openEditCompensationModal(compensation)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {employeesWithoutCompensation.length > 0 && (
                            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                                <h4 className="text-sm font-bold text-orange-700 mb-2">Employees not included in payroll yet</h4>
                                <p className="text-sm text-orange-600">
                                    These employees need active compensation before payroll processing can generate payslips:{' '}
                                    {employeesWithoutCompensation.slice(0, 5).map(getEmployeeDisplayName).join(', ')}
                                    {employeesWithoutCompensation.length > 5 ? `, +${employeesWithoutCompensation.length - 5} more` : ''}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Deductions */}
                {activeTab === 'deductions' && (
                    <div className="space-y-6">
                        <h3 className="text-base font-bold text-gray-800">Government Deductions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {govDeductions.map((d) => (
                                <div key={d.name} className="p-5 border border-gray-200 rounded-xl flex items-center gap-4">
                                    <div className="p-3 rounded-xl" style={{ backgroundColor: `${d.color}10` }}>
                                        <DollarSign className="w-6 h-6" style={{ color: d.color }} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{d.name}</h4>
                                        <p className="text-xl font-bold" style={{ color: d.color }}>{d.status}</p>
                                        <p className="text-xs text-gray-400">{d.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border border-gray-200 rounded-xl p-5">
                            <h4 className="font-bold text-gray-700 mb-3">Deductions Tracking — Monthly Breakdown</h4>
                            <p className="text-sm text-gray-500">Government contribution and withholding tax tracking will be available once the Government Compliance module is configured.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setShowRemittanceModal(true)} className="btn btn-primary">Generate Remittance Report</button>
                            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Export to Excel</button>
                        </div>
                    </div>
                )}

                {/* Tab: 13th Month */}
                {activeTab === '13th' && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800">13th Month Pay Computation</h3>
                            <button onClick={() => setShowComputeModal(true)} className="btn btn-primary">Compute All</button>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <h4 className="font-bold text-gray-800">13th month computation is not yet configured</h4>
                            <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500">
                                Payroll currently supports compensation-based salary computation, overtime inclusion, deductions, payroll records, and payslip generation. 13th month computation will be enabled once its backend service is available.
                            </p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5">
                            <h4 className="font-bold text-gray-700 mb-4">Computation Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-xl font-bold text-gray-800">—</p><p className="text-xs text-gray-500">Total Employees</p></div>
                                <div><p className="text-xl font-bold text-gray-800">—</p><p className="text-xs text-gray-500">Total Basic Salary Annual</p></div>
                                <div><p className="text-xl font-bold text-emerald-600">—</p><p className="text-xs text-gray-500">Total 13th Month</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Payslip */}
                {activeTab === 'payslip' && (
                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <h3 className="text-base font-bold text-gray-800">Employee Payslips</h3>
                            <button onClick={() => setShowGeneratePayslips(true)} className="btn btn-primary">Generate All Payslips</button>
                        </div>
                        {loadingPayroll ? (
                            <div className="py-8 text-center text-sm text-gray-500">Loading payslips...</div>
                        ) : payslipList.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">No payslips available. Process payroll first.</div>
                        ) : (
                            <div className="space-y-3">
                                {payslipList.map((p) => (
                                    <div key={p.record.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-emerald-300 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center font-bold">{getInitials(p.name)}</div>
                                            <div>
                                                <h4 className="font-bold text-gray-800">{p.name}</h4>
                                                <p className="text-xs text-gray-400">{p.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">{p.netPay}</p>
                                                <span className="badge badge-success">● {p.status}</span>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedPayslipRecord(p.record);
                                                    setShowPayslipPreview(true);
                                                }}
                                                className="btn-ghost btn-icon"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="btn-ghost btn-icon"><Download className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Process Payroll Modal */}
            {showProcessModal && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header"><h3>Process Payroll</h3><button onClick={() => setShowProcessModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Start Date</label><input type="date" value={processStartDate} onChange={(event) => setProcessStartDate(event.target.value)} className="pro-input" /></div>
                                <div><label className="pro-label">End Date</label><input type="date" value={processEndDate} onChange={(event) => setProcessEndDate(event.target.value)} className="pro-input" /></div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                <p className="text-gray-600">Employees to process: <strong>Based on active compensation</strong></p>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowProcessModal(false)} className="btn btn-secondary">Cancel</button><button onClick={handleProcessPayroll} disabled={processingPayroll} className="btn btn-primary">{processingPayroll ? 'Processing...' : 'Process Payroll'}</button></div>
                    </div>
                </div>
            )}

            {/* Compensation Modal */}
            {showCompensationModal && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header">
                            <h3>{editingCompensation ? 'Edit Compensation' : 'Add Compensation'}</h3>
                            <button onClick={() => { setShowCompensationModal(false); resetCompensationModal(); }} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            {compensationError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {compensationError}
                                </div>
                            )}
                            {!editingCompensation && (
                                <div>
                                    <label className="pro-label">Employee</label>
                                    <select value={compensationForm.employeeId} onChange={(event) => setCompensationForm((current) => ({ ...current, employeeId: event.target.value }))} className="pro-input">
                                        <option value="">Select employee</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.employeeNumber} — {getEmployeeDisplayName(employee)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {editingCompensation && (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-xs text-gray-500">Employee</p>
                                    <p className="font-bold text-gray-800">{editingCompensation.employeeName}</p>
                                    <p className="text-xs text-gray-500">{editingCompensation.employeeNumber}</p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Compensation Type</label>
                                    <select value={compensationForm.compensationType} onChange={(event) => setCompensationForm((current) => ({ ...current, compensationType: event.target.value }))} className="pro-input">
                                        <option value="Monthly">Monthly</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Hourly">Hourly</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pro-label">Base Amount</label>
                                    <input type="number" min="0" step="0.01" value={compensationForm.baseAmount} onChange={(event) => setCompensationForm((current) => ({ ...current, baseAmount: event.target.value }))} className="pro-input" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Effective From</label>
                                    <input type="date" value={compensationForm.effectiveFrom} onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveFrom: event.target.value }))} className="pro-input" />
                                </div>
                                <div>
                                    <label className="pro-label">Effective To</label>
                                    <input type="date" value={compensationForm.effectiveTo} onChange={(event) => setCompensationForm((current) => ({ ...current, effectiveTo: event.target.value }))} className="pro-input" />
                                </div>
                            </div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <input type="checkbox" checked={compensationForm.isActive} onChange={(event) => setCompensationForm((current) => ({ ...current, isActive: event.target.checked }))} />
                                Active compensation
                            </label>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => { setShowCompensationModal(false); resetCompensationModal(); }} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSaveCompensation} disabled={savingCompensation} className="btn btn-primary">{savingCompensation ? 'Saving...' : 'Save Compensation'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedRecord && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header"><h3>Payroll Details</h3><button onClick={() => setShowDetailsModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body">
                            <div className="space-y-4">
                                {[
                                    ['Period', selectedRecord.period],
                                    ['Employees', selectedRecord.employees],
                                    ['Gross Pay', selectedRecord.grossPay],
                                    ['Deductions', selectedRecord.deductions],
                                    ['Net Pay', selectedRecord.netPay],
                                    ['Status', selectedRecord.status],
                                ].map(([label, val]) => (
                                    <div key={String(label)} className="flex justify-between py-2 border-b border-gray-100">
                                        <span className="text-gray-500">{label}</span><span className="font-bold text-gray-800">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowDetailsModal(false)} className="btn btn-primary">Close</button></div>
                    </div>
                </div>
            )}

            {/* Remittance Modal */}
            {showRemittanceModal && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header"><h3>Generate Remittance Report</h3><button onClick={() => setShowRemittanceModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <p className="text-sm text-gray-600">Government remittance reporting is not available yet. Configure the Government Compliance module first.</p>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowRemittanceModal(false)} className="btn btn-primary">Close</button></div>
                    </div>
                </div>
            )}

            {/* Compute 13th Month Modal */}
            {showComputeModal && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header"><h3>Compute 13th Month Pay</h3><button onClick={() => setShowComputeModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <p className="text-sm text-gray-600">13th month computation is not available yet. This will be enabled once the backend service is implemented.</p>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                                <p className="text-orange-700 text-sm font-medium">Current payroll scope: compensation, payroll processing, payroll records, and payslips.</p>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowComputeModal(false)} className="btn btn-primary">Close</button></div>
                    </div>
                </div>
            )}

            {/* Generate Payslips Modal */}
            {showGeneratePayslips && (
                <div className="modal-backdrop">
                    <div className="pro-modal">
                        <div className="pro-modal-header"><h3>Generate All Payslips</h3><button onClick={() => setShowGeneratePayslips(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <p className="text-sm text-gray-600">Payslips are generated automatically from processed payroll records.</p>
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                <p className="text-sm text-gray-500">{latestPayrollRecords.length} payslips available for the latest payroll period.</p>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowGeneratePayslips(false)} className="btn btn-primary">Close</button></div>
                    </div>
                </div>
            )}

            {/* Payslip Preview */}
            {showPayslipPreview && selectedPayslip && (
                <div className="modal-backdrop">
                    <div className="pro-modal max-w-lg">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6 rounded-t-2xl text-center">
                            <h2 className="text-xl font-bold">SIMPLEVIA Technologies, Inc.</h2>
                            <p className="text-sm opacity-90">Employee Payslip</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {[
                                    ['Employee ID', selectedPayslip.employeeNumber],
                                    ['Employee', selectedPayslip.employeeName],
                                    ['Department', selectedPayslip.department || '—'],
                                    ['Pay Period', selectedPayrollPeriod ? formatPeriod(selectedPayrollPeriod) : '—'],
                                    ['Payment Date', formatDate(new Date().toISOString())],
                                ].map(([label, val]) => (
                                    <div key={String(label)}>
                                        <p className="text-gray-400">{label}</p>
                                        <p className="font-bold text-gray-800">{val}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Earnings</h4>
                                {selectedPayslipEarnings.length === 0 ? (
                                    <div className="flex justify-between py-2"><span>Basic Pay</span><span className="font-bold">{formatCurrency(selectedPayslip.grossPay)}</span></div>
                                ) : (
                                    selectedPayslipEarnings.map((item) => (
                                        <div key={item.id} className="flex justify-between py-2"><span>{item.name}</span><span className="font-bold">{formatCurrency(item.amount)}</span></div>
                                    ))
                                )}
                                <div className="flex justify-between py-2 border-t border-gray-100 font-bold"><span>Total Earnings</span><span>{formatCurrency(selectedPayslip.grossPay)}</span></div>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Deductions</h4>
                                {selectedPayslipDeductions.length === 0 ? (
                                    <div className="flex justify-between py-2"><span>Total Deductions</span><span className="font-bold text-red-500">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                                ) : (
                                    selectedPayslipDeductions.map((item) => (
                                        <div key={item.id} className="flex justify-between py-2"><span>{item.name}</span><span className="font-bold text-red-500">{formatCurrency(item.amount)}</span></div>
                                    ))
                                )}
                                <div className="flex justify-between py-2 border-t border-gray-100 font-bold"><span>Total Deductions</span><span className="text-red-500">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                            </div>
                            <div className="bg-emerald-500 text-white rounded-xl p-4 flex justify-between items-center">
                                <span className="font-bold">Net Pay</span><span className="text-2xl font-bold">{formatCurrency(selectedPayslip.netPay)}</span>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
                            <button onClick={() => setShowPayslipPreview(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payroll;
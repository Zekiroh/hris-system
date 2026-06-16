import { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingDown, Percent, FileText, X, Download, Eye, Printer } from 'lucide-react';
import {
    getPayrollPeriods,
    getPayrollRecords,
    processPayroll,
    type PayrollPeriodDto,
    type PayrollRecordDto,
} from '../../lib/payroll';

type Tab = 'records' | 'deductions' | '13th' | 'payslip';

type PayrollRecordRow = {
    id: number;
    period: string;
    employees: number;
    grossPay: string;
    deductions: string;
    netPay: string;
    status: string;
    records: PayrollRecordDto[];
};

type ProcessPeriodOption = {
    label: string;
    startDate: string;
    endDate: string;
};

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);

const parseDateOnly = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const formatPeriod = (startDate: string, endDate: string) => {
    const start = parseDateOnly(startDate);
    const end = parseDateOnly(endDate);

    const startMonth = start.toLocaleString('en-US', { month: 'short' });
    const endMonth = end.toLocaleString('en-US', { month: 'short' });
    const year = end.getFullYear();

    if (startMonth === endMonth) {
        return `${startMonth} ${start.getDate()}-${end.getDate()}, ${year}`;
    }

    return `${startMonth} ${start.getDate()}-${endMonth} ${end.getDate()}, ${year}`;
};

const toDateOnly = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const getNextSemiMonthlyOptions = (periods: PayrollPeriodDto[]): ProcessPeriodOption[] => {
    const sorted = [...periods].sort((a, b) => b.endDate.localeCompare(a.endDate));
    const latestEnd = sorted[0]?.endDate;
    const base = latestEnd ? parseDateOnly(latestEnd) : new Date();

    let targetYear = base.getFullYear();
    let targetMonth = base.getMonth();

    if (base.getDate() >= 15) {
        targetMonth += 1;
    }

    const firstStart = new Date(targetYear, targetMonth, 1);
    const firstEnd = new Date(targetYear, targetMonth, 15);
    const secondStart = new Date(targetYear, targetMonth, 16);
    const secondEnd = new Date(targetYear, targetMonth + 1, 0);

    targetYear = firstStart.getFullYear();

    return [
        {
            label: formatPeriod(toDateOnly(firstStart), toDateOnly(firstEnd)),
            startDate: toDateOnly(firstStart),
            endDate: toDateOnly(firstEnd),
        },
        {
            label: formatPeriod(toDateOnly(secondStart), toDateOnly(secondEnd)),
            startDate: toDateOnly(secondStart),
            endDate: toDateOnly(secondEnd),
        },
    ];
};

const Payroll = () => {
    const [activeTab, setActiveTab] = useState<Tab>('records');
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showRemittanceModal, setShowRemittanceModal] = useState(false);
    const [showComputeModal, setShowComputeModal] = useState(false);
    const [show13thDetails, setShow13thDetails] = useState(false);
    const [showGeneratePayslips, setShowGeneratePayslips] = useState(false);
    const [showPayslipPreview, setShowPayslipPreview] = useState(false);

    const [selectedRecord, setSelectedRecord] = useState<PayrollRecordRow | null>(null);
    const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecordDto | null>(null);

    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriodDto[]>([]);
    const [recordsByPeriodId, setRecordsByPeriodId] = useState<Record<number, PayrollRecordDto[]>>({});
    const [loadingPayroll, setLoadingPayroll] = useState(true);
    const [payrollError, setPayrollError] = useState('');
    const [processingPayroll, setProcessingPayroll] = useState(false);
    const [processError, setProcessError] = useState('');
    const [processSuccess, setProcessSuccess] = useState('');
    const [selectedProcessPeriod, setSelectedProcessPeriod] = useState('');

    const loadPayrollData = async () => {
        setLoadingPayroll(true);
        setPayrollError('');

        try {
            const periods = await getPayrollPeriods();
            const sortedPeriods = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));

            const recordEntries = await Promise.all(
                sortedPeriods.map(async (period) => {
                    const records = await getPayrollRecords(period.id);
                    return [period.id, records] as const;
                })
            );

            setPayrollPeriods(sortedPeriods);
            setRecordsByPeriodId(Object.fromEntries(recordEntries));

            const nextOptions = getNextSemiMonthlyOptions(sortedPeriods);
            setSelectedProcessPeriod((current) => current || `${nextOptions[0].startDate}|${nextOptions[0].endDate}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to load payroll data.';
            setPayrollError(message);
        } finally {
            setLoadingPayroll(false);
        }
    };

    useEffect(() => {
        void loadPayrollData();
    }, []);

    const tabs = [
        { id: 'records' as Tab, label: 'Payroll Records', icon: FileText },
        { id: 'deductions' as Tab, label: 'Deductions', icon: TrendingDown },
        { id: '13th' as Tab, label: '13th Month Pay', icon: DollarSign },
        { id: 'payslip' as Tab, label: 'Payslip', icon: Printer },
    ];

    const payrollRecords = useMemo<PayrollRecordRow[]>(() => {
        return payrollPeriods.map((period) => {
            const records = recordsByPeriodId[period.id] ?? [];
            const grossPay = records.reduce((sum, record) => sum + record.grossPay, 0);
            const deductions = records.reduce((sum, record) => sum + record.totalDeductions, 0);
            const netPay = records.reduce((sum, record) => sum + record.netPay, 0);

            return {
                id: period.id,
                period: formatPeriod(period.startDate, period.endDate),
                employees: records.length,
                grossPay: formatCurrency(grossPay),
                deductions: formatCurrency(deductions),
                netPay: formatCurrency(netPay),
                status: period.status,
                records,
            };
        });
    }, [payrollPeriods, recordsByPeriodId]);

    const latestPayrollRecords = payrollRecords[0]?.records ?? [];

    const totals = useMemo(() => {
        const records = payrollRecords.flatMap((record) => record.records);
        const grossPay = records.reduce((sum, record) => sum + record.grossPay, 0);
        const deductions = records.reduce((sum, record) => sum + record.totalDeductions, 0);
        const netPay = records.reduce((sum, record) => sum + record.netPay, 0);
        const taxRate = grossPay > 0 ? (deductions / grossPay) * 100 : 0;

        return {
            grossPay,
            deductions,
            netPay,
            taxRate,
        };
    }, [payrollRecords]);

    const statCards = [
        { label: 'Total Payroll', value: formatCurrency(totals.grossPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Total Deductions', value: formatCurrency(totals.deductions), icon: TrendingDown, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Avg Tax Rate', value: `${totals.taxRate.toFixed(1)}%`, icon: Percent, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Net Payroll', value: formatCurrency(totals.netPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const govDeductions = [
        { name: 'SSS Contributions', amount: '₱245,000', desc: 'Total for 245 employees', color: '#2563eb' },
        { name: 'PhilHealth', amount: '₱128,000', desc: 'Total for 245 employees', color: '#059669' },
        { name: 'Pag-IBIG', amount: '₱89,000', desc: 'Total for 245 employees', color: '#d97706' },
        { name: 'Withholding Tax', amount: '₱1,280,000', desc: 'Total for 245 employees', color: '#dc2626' },
    ];

    const thirteenthMonthData = [
        { empId: 'EMP-001', name: 'Dela Cruz, Juan', totalSalary: '₱480,000', thirteenthMonth: '₱40,000', status: 'Computed' },
        { empId: 'EMP-002', name: 'Santos, Maria', totalSalary: '₱540,000', thirteenthMonth: '₱45,000', status: 'Computed' },
        { empId: 'EMP-003', name: 'Reyes, Jose', totalSalary: '₱360,000', thirteenthMonth: '₱30,000', status: 'Pending' },
        { empId: 'EMP-004', name: 'Garcia, Ana', totalSalary: '₱420,000', thirteenthMonth: '₱35,000', status: 'Computed' },
    ];

    const payslipList = latestPayrollRecords.map((record) => ({
        name: record.employeeName,
        id: record.employeeNumber,
        netPay: formatCurrency(record.netPay),
        status: record.status || 'Generated',
        record,
    }));

    const processPeriodOptions = useMemo(() => getNextSemiMonthlyOptions(payrollPeriods), [payrollPeriods]);
    const selectedProcessOption = processPeriodOptions.find(
        (option) => `${option.startDate}|${option.endDate}` === selectedProcessPeriod
    ) ?? processPeriodOptions[0];

    const statusBadge: Record<string, string> = {
        Processed: 'badge-success',
        Pending: 'badge-warning',
        Computed: 'badge-success',
        Generated: 'badge-success',
    };

    const payrollDetailRows: [string, string | number][] = selectedRecord
        ? [
            ['Period', selectedRecord.period],
            ['Employees', selectedRecord.employees],
            ['Gross Pay', selectedRecord.grossPay],
            ['Deductions', selectedRecord.deductions],
            ['Net Pay', selectedRecord.netPay],
            ['Status', selectedRecord.status],
        ]
        : [];

    const handleProcessPayroll = async () => {
        if (!selectedProcessOption) return;

        setProcessingPayroll(true);
        setProcessError('');
        setProcessSuccess('');

        try {
            await processPayroll({
                startDate: selectedProcessOption.startDate,
                endDate: selectedProcessOption.endDate,
            });

            setProcessSuccess(`Payroll processed for ${selectedProcessOption.label}.`);
            setShowProcessModal(false);
            await loadPayrollData();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to process payroll.';
            setProcessError(message);
        } finally {
            setProcessingPayroll(false);
        }
    };

    const selectedPayslip = selectedPayslipRecord ?? latestPayrollRecords[0] ?? null;
    const selectedPayslipEarnings = selectedPayslip?.items.filter((item) => item.type === 'Earning') ?? [];
    const selectedPayslipDeductions = selectedPayslip?.items.filter((item) => item.type === 'Deduction') ?? [];

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Payroll</h1>
                <p>Manage payroll processing, deductions, and payslips</p>
            </div>

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
                    {activeTab === 'records' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Payroll Records</h3>
                                <button onClick={() => setShowProcessModal(true)} className="btn btn-primary">Process Payroll</button>
                            </div>

                            {processSuccess && (
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                    {processSuccess}
                                </div>
                            )}

                            {payrollError && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {payrollError}
                                </div>
                            )}

                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Period', 'Employees', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Action'].map(h => <th key={h}>{h}</th>)}</tr></thead>
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
                                            payrollRecords.map((r) => (
                                                <tr key={r.id}>
                                                    <td className="!font-medium !text-gray-800">{r.period}</td>
                                                    <td>{r.employees}</td>
                                                    <td>{r.grossPay}</td>
                                                    <td className="!text-red-500">{r.deductions}</td>
                                                    <td className="!font-bold !text-gray-900">{r.netPay}</td>
                                                    <td><span className={`badge ${statusBadge[r.status] ?? 'badge-warning'}`}><span className="badge-dot" />{r.status}</span></td>
                                                    <td><button onClick={() => { setSelectedRecord(r); setShowDetailsModal(true); }} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button></td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Payroll Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xl font-bold text-gray-900">{formatCurrency(totals.grossPay)}</p><p className="text-xs text-gray-500">Total Gross</p></div>
                                    <div><p className="text-xl font-bold text-red-500">{formatCurrency(totals.deductions)}</p><p className="text-xs text-gray-500">Total Deductions</p></div>
                                    <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netPay)}</p><p className="text-xs text-gray-500">Total Net</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'deductions' && (
                        <div className="space-y-6">
                            <h3 className="text-base font-bold text-gray-800">Government Deductions</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {govDeductions.map(d => (
                                    <div key={d.name} className="pro-card !shadow-none border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ background: d.color + '15' }}>
                                            <DollarSign className="w-5 h-5" style={{ color: d.color }} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                            <p className="text-lg font-bold" style={{ color: d.color }}>{d.amount}</p>
                                            <p className="text-xs text-gray-400">{d.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pro-card !shadow-none border border-gray-100 p-5">
                                <h4 className="text-sm font-bold text-gray-700 mb-4">Deductions Tracking — Monthly Breakdown</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-lg font-bold text-blue-600">₱462,000</p><p className="text-xs text-gray-500">Employee Share</p></div>
                                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100"><p className="text-lg font-bold text-emerald-600">₱580,000</p><p className="text-xs text-gray-500">Employer Share</p></div>
                                    <div className="bg-orange-50 rounded-xl p-4 border border-orange-100"><p className="text-lg font-bold text-orange-600">₱1,042,000</p><p className="text-xs text-gray-500">Total Remittance</p></div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowRemittanceModal(true)} className="btn btn-primary">Generate Remittance Report</button>
                                <button className="btn btn-secondary"><Download className="w-4 h-4" /> Export to Excel</button>
                            </div>
                        </div>
                    )}

                    {activeTab === '13th' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">13th Month Pay Computation</h3>
                                <button onClick={() => setShowComputeModal(true)} className="btn btn-primary">Compute All</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee ID', 'Employee Name', 'Total Basic Salary (YTD)', '13th Month Pay', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {thirteenthMonthData.map((r, i) => (
                                            <tr key={i}>
                                                <td className="font-mono text-xs">{r.empId}</td>
                                                <td className="!font-medium !text-gray-800">{r.name}</td>
                                                <td>{r.totalSalary}</td>
                                                <td className="!font-bold !text-emerald-600">{r.thirteenthMonth}</td>
                                                <td><span className={`badge ${statusBadge[r.status]}`}><span className="badge-dot" />{r.status}</span></td>
                                                <td><button onClick={() => setShow13thDetails(true)} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                                <h4 className="text-sm font-bold text-gray-700 mb-3">Computation Summary</h4>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-xl font-bold text-gray-900">245</p><p className="text-xs text-gray-500">Total Employees</p></div>
                                    <div><p className="text-xl font-bold text-gray-900">₱98,400,000</p><p className="text-xs text-gray-500">Total Basic Salary Annual</p></div>
                                    <div><p className="text-xl font-bold text-emerald-600">₱8,200,000</p><p className="text-xs text-gray-500">Total 13th Month</p></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'payslip' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Employee Payslips</h3>
                                <button onClick={() => setShowGeneratePayslips(true)} className="btn btn-primary">Generate All Payslips</button>
                            </div>
                            <div className="space-y-3">
                                {loadingPayroll ? (
                                    <div className="pro-card !shadow-none border border-gray-100 p-4 text-center text-sm text-gray-500">
                                        Loading payslips...
                                    </div>
                                ) : payslipList.length === 0 ? (
                                    <div className="pro-card !shadow-none border border-gray-100 p-4 text-center text-sm text-gray-500">
                                        No payslips found.
                                    </div>
                                ) : (
                                    payslipList.map(emp => (
                                        <div key={`${emp.id}-${emp.record.id}`} className="pro-card !shadow-none border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">{emp.name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                                                    <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-gray-900">{emp.netPay}</p>
                                                    <span className={`badge text-[10px] ${statusBadge[emp.status] ?? 'badge-success'}`}><span className="badge-dot" />{emp.status}</span>
                                                </div>
                                                <button onClick={() => { setSelectedPayslipRecord(emp.record); setShowPayslipPreview(true); }} className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"><Eye className="w-4 h-4" /></button>
                                                <button className="btn-ghost btn-icon text-gray-400 hover:bg-gray-100"><Download className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showProcessModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Process Payroll</h3><button onClick={() => setShowProcessModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div>
                                <label className="pro-label">Payroll Period</label>
                                <select
                                    className="pro-select"
                                    value={selectedProcessPeriod}
                                    onChange={(event) => {
                                        setSelectedProcessPeriod(event.target.value);
                                        setProcessError('');
                                    }}
                                >
                                    {processPeriodOptions.map((option) => (
                                        <option key={`${option.startDate}|${option.endDate}`} value={`${option.startDate}|${option.endDate}`}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {processError && (
                                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {processError}
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 border border-gray-100">
                                <p className="text-gray-600">Employees to process: <strong>Based on active compensation</strong></p>
                                <p className="text-gray-600">Selected period: <strong>{selectedProcessOption?.label ?? '—'}</strong></p>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowProcessModal(false)} className="btn btn-secondary" disabled={processingPayroll}>Cancel</button>
                            <button onClick={handleProcessPayroll} className="btn btn-primary" disabled={processingPayroll}>
                                {processingPayroll ? 'Processing...' : 'Process Payroll'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDetailsModal && selectedRecord && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Payroll Details</h3><button onClick={() => setShowDetailsModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-1">
                            {payrollDetailRows.map(([label, value]) => (
                                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-bold text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowDetailsModal(false)} className="btn btn-secondary">Close</button></div>
                    </div>
                </div>
            )}

            {showRemittanceModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Generate Remittance Report</h3><button onClick={() => setShowRemittanceModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Report Type</label><select className="pro-select"><option>SSS Contribution Report</option><option>PhilHealth</option><option>Pag-IBIG</option><option>BIR Withholding Tax</option></select></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="pro-label">Month</label><select className="pro-select">{['January', 'February', 'March'].map(m => <option key={m}>{m}</option>)}</select></div>
                                <div><label className="pro-label">Year</label><select className="pro-select"><option>2026</option><option>2025</option></select></div>
                            </div>
                            <div>
                                <label className="pro-label">Format</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="format" defaultChecked className="accent-emerald-600" /> PDF</label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="radio" name="format" className="accent-emerald-600" /> Excel</label>
                                </div>
                            </div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowRemittanceModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowRemittanceModal(false)} className="btn btn-primary">Generate Report</button></div>
                    </div>
                </div>
            )}

            {showComputeModal && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Compute 13th Month Pay</h3><button onClick={() => setShowComputeModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <p className="text-sm text-gray-600">This will compute 13th month pay for all eligible employees based on their year-to-date basic salary.</p>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-1 border border-gray-100">
                                <p className="text-gray-600">Eligible Employees: <strong>245</strong></p>
                                <p className="text-gray-600">Estimated Total: <strong>₱8,200,000</strong></p>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" className="accent-emerald-600" /> Send notification to employees</label>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowComputeModal(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowComputeModal(false)} className="btn btn-primary">Generate Report</button></div>
                    </div>
                </div>
            )}

            {show13thDetails && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>13th Month Pay Details</h3><button onClick={() => setShow13thDetails(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-1">
                            {[['Employee', 'Dela Cruz, Juan'], ['Employee ID', 'EMP-001'], ['Total Basic Salary (YTD)', '₱480,000'], ['Months Employed', '12'], ['Divisor', '12'], ['13th Month Pay', '₱40,000']].map(([label, value]) => (
                                <div key={label} className="flex justify-between py-2.5 border-b border-gray-50">
                                    <span className="text-sm text-gray-500">{label}</span>
                                    <span className="text-sm font-bold text-gray-900">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pro-modal-footer">
                            <button className="btn btn-secondary"><Download className="w-4 h-4" /> Download PDF</button>
                            <button onClick={() => setShow13thDetails(false)} className="btn btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {showGeneratePayslips && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Generate All Payslips</h3><button onClick={() => setShowGeneratePayslips(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Payroll Period</label><select className="pro-select">{payrollRecords.map((record) => <option key={record.id}>{record.period}</option>)}</select></div>
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" className="accent-emerald-600" defaultChecked /> Email Notification</label>
                            <p className="text-sm text-gray-500">{latestPayrollRecords.length} payslips will be generated</p>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowGeneratePayslips(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowGeneratePayslips(false)} className="btn btn-primary">Start Generation</button></div>
                    </div>
                </div>
            )}

            {showPayslipPreview && selectedPayslip && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-lg !p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-5 text-white text-center">
                            <h3 className="text-lg font-bold">SIMPLEVIA Technologies, Inc.</h3>
                            <p className="text-xs text-emerald-100/80">Employee Payslip</p>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {[
                                    ['Employee ID', selectedPayslip.employeeNumber],
                                    ['Employee', selectedPayslip.employeeName],
                                    ['Department', '—'],
                                    ['Pay Period', payrollRecords.find((record) => record.id === selectedPayslip.payrollPeriodId)?.period ?? '—'],
                                    ['Payment Date', new Date(selectedPayslip.createdAtUtc).toLocaleDateString()],
                                ].map(([l, v]) => (
                                    <div key={l}><p className="text-gray-400 text-xs">{l}</p><p className="font-semibold text-gray-800">{v}</p></div>
                                ))}
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Earnings</h4>
                                <div className="space-y-1.5">
                                    {selectedPayslipEarnings.length === 0 ? (
                                        <div className="flex justify-between text-sm"><span className="text-gray-600">Gross Pay</span><span className="font-semibold">{formatCurrency(selectedPayslip.grossPay)}</span></div>
                                    ) : (
                                        selectedPayslipEarnings.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.description}</span><span className="font-semibold">{formatCurrency(item.amount)}</span></div>
                                        ))
                                    )}
                                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Earnings</span><span>{formatCurrency(selectedPayslip.grossPay)}</span></div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Deductions</h4>
                                <div className="space-y-1.5">
                                    {selectedPayslipDeductions.length === 0 ? (
                                        <div className="flex justify-between text-sm"><span className="text-gray-600">Total Deductions</span><span className="text-red-500 font-medium">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                                    ) : (
                                        selectedPayslipDeductions.map((item) => (
                                            <div key={item.id} className="flex justify-between text-sm"><span className="text-gray-600">{item.description}</span><span className="text-red-500 font-medium">{formatCurrency(item.amount)}</span></div>
                                        ))
                                    )}
                                    <div className="flex justify-between text-sm font-bold border-t border-gray-100 pt-1.5"><span>Total Deductions</span><span className="text-red-500">{formatCurrency(selectedPayslip.totalDeductions)}</span></div>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-4 flex justify-between text-white shadow-sm">
                                <span className="font-bold">Net Pay</span>
                                <span className="font-bold text-xl">{formatCurrency(selectedPayslip.netPay)}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 px-6 pb-5">
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
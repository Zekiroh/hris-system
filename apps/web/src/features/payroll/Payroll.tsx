import { useState } from 'react';
import {
    DollarSign,
    TrendingDown,
    Percent,
} from 'lucide-react';
import type { EmployeeCompensationDto, PayrollRecordDto } from '../../lib/payroll';
import { govDeductions, statusBadge, tabs } from './config/constants';
import { formatCurrency } from './config/helpers';
import type { PayrollRecordRow, Tab } from './config/types';
import CompensationModal from './components/modals/CompensationModal';
import CompensationTab from './components/CompensationTab';
import ComputeThirteenthMonthModal from './components/modals/ComputeThirteenthMonthModal';
import DeductionsTab from './components/DeductionsTab';
import GeneratePayslipsModal from './components/modals/GeneratePayslipsModal';
import PayslipPreviewModal from './components/modals/PayslipPreviewModal';
import PayslipTab from './components/PayslipTab';
import PayrollDetailsModal from './components/modals/PayrollDetailsModal';
import PayrollRecordsTab from './components/PayrollRecordsTab';
import ProcessPayrollModal from './components/modals/ProcessPayrollModal';
import RemittanceModal from './components/modals/RemittanceModal';
import ThirteenthMonthTab from './components/ThirteenthMonthTab';
import { useCompensationManagement } from './hooks/useCompensationManagement';
import { usePayrollData } from './hooks/usePayrollData';

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
    const {
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
    } = usePayrollData();
    const {
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
    } = useCompensationManagement();

    const statCards = [
        { label: 'Total Payroll', value: formatCurrency(totals.grossPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Total Deductions', value: formatCurrency(totals.deductions), icon: TrendingDown, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Deduction Rate', value: `${totals.deductionRate.toFixed(1)}%`, icon: Percent, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Net Payroll', value: formatCurrency(totals.netPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const selectedPayslip = selectedPayslipRecord ?? latestPayrollRecords[0] ?? null;
    const selectedPayslipEarnings = selectedPayslip?.items.filter((item) => item.type === 'Earning') ?? [];
    const selectedPayslipDeductions = selectedPayslip?.items.filter((item) => item.type === 'Deduction') ?? [];

    const selectedPayrollPeriod = selectedPayslip
        ? payrollPeriods.find((period) => period.id === selectedPayslip.payrollPeriodId)
        : undefined;

    const openCreateCompensationModal = () => {
        prepareCreateCompensation();
        setShowCompensationModal(true);
    };

    const openEditCompensationModal = (compensation: EmployeeCompensationDto) => {
        prepareEditCompensation(compensation);
        setShowCompensationModal(true);
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
                onProcess={() => handleProcessPayroll(() => setShowProcessModal(false))}
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
                    resetCompensation();
                }}
                onSave={() => handleSaveCompensation(() => setShowCompensationModal(false))}
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

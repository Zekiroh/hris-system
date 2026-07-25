import { useState } from 'react';
import {
    DollarSign,
    Percent,
    TrendingDown,
} from 'lucide-react';
import type { EmployeeCompensationDto, PayrollRecordDto } from '../../../services/api/payroll/payroll';
import { tabs } from '../config/constants';
import { formatCurrency } from '../config/helpers';
import type { PayrollRecordRow, Tab } from '../config/types';
import CompensationModal from '../components/modals/CompensationModal';
import CompensationTab from '../components/CompensationTab';
import PayslipPreviewModal from '../components/modals/PayslipPreviewModal';
import PayslipTab from '../components/PayslipTab';
import PayrollDetailsModal from '../components/modals/PayrollDetailsModal';
import PayrollRecordsTab from '../components/PayrollRecordsTab';
import ProcessPayrollModal from '../components/modals/ProcessPayrollModal';
import ThirteenthMonthTab from '../components/ThirteenthMonthTab';
import { useCompensationManagement } from '../hooks/useCompensationManagement';
import { usePayrollData } from '../hooks/usePayrollData';
import { useThirteenthMonthPay } from '../hooks/useThirteenthMonthPay';

const AdminPayroll = () => {
    const [activeTab, setActiveTab] = useState<Tab>('periods');
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPayslipPreview, setShowPayslipPreview] = useState(false);
    const [showCompensationModal, setShowCompensationModal] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<PayrollRecordRow | null>(null);
    const [selectedPayslipRecord, setSelectedPayslipRecord] = useState<PayrollRecordDto | null>(null);

    const {
        loadingPayroll,
        processingPayroll,
        releasingPeriodId,
        downloadingRecordId,
        payrollRecords,
        releasedPayrollRows,
        totals,
        processStartDate,
        processEndDate,
        payrollError,
        payrollSuccess,
        setProcessStartDate,
        setProcessEndDate,
        handleProcessPayroll,
        handleReleasePayrollPeriod,
        handleDownloadPayslipPdf,
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

    const thirteenthMonth = useThirteenthMonthPay();

    const statCards = [
        { label: 'Total Payroll', value: formatCurrency(totals.grossPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Total Deductions', value: formatCurrency(totals.deductions), icon: TrendingDown, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { label: 'Deduction Rate', value: `${totals.deductionRate.toFixed(1)}%`, icon: Percent, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Net Payroll', value: formatCurrency(totals.netPay), icon: DollarSign, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const selectedPayslipEarnings = selectedPayslipRecord?.items.filter((item) => item.type.toLowerCase() === 'earning') ?? [];
    const selectedPayslipDeductions = selectedPayslipRecord?.items.filter((item) => item.type.toLowerCase() === 'deduction') ?? [];

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
            <div className="page-header animate-fade-in-up">
                <h1>Payroll</h1>
                <p>Manage payroll periods, compensation, released payslips, and 13th-month pay</p>
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

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {statCards.map((card, index) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${index * 0.1}s`, opacity: 0 }}>
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
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {activeTab === 'periods' && (
                        <PayrollRecordsTab
                            loadingPayroll={loadingPayroll}
                            payrollRecords={payrollRecords}
                            totals={{
                                grossPay: totals.grossPay,
                                deductions: totals.deductions,
                                netPay: totals.netPay,
                            }}
                            releasingPeriodId={releasingPeriodId}
                            onProcessPayroll={() => setShowProcessModal(true)}
                            onViewRecord={(record) => {
                                setSelectedRecord(record);
                                setShowDetailsModal(true);
                            }}
                            onReleasePeriod={handleReleasePayrollPeriod}
                        />
                    )}

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

                    {activeTab === 'payslips' && (
                        <PayslipTab
                            loadingPayroll={loadingPayroll}
                            releasedPayrollRows={releasedPayrollRows}
                            downloadingRecordId={downloadingRecordId}
                            onPreview={(record) => {
                                setSelectedPayslipRecord(record);
                                setShowPayslipPreview(true);
                            }}
                            onDownload={handleDownloadPayslipPdf}
                        />
                    )}

                    {activeTab === '13th' && (
                        <ThirteenthMonthTab
                            year={thirteenthMonth.year}
                            records={thirteenthMonth.records}
                            loading={thirteenthMonth.loading}
                            loaded={thirteenthMonth.loaded}
                            error={thirteenthMonth.error}
                            summary={thirteenthMonth.summary}
                            onYearChange={thirteenthMonth.setYear}
                            onLoad={thirteenthMonth.load}
                        />
                    )}
                </div>
            </div>

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

            <PayrollDetailsModal
                open={showDetailsModal}
                record={selectedRecord}
                downloadingRecordId={downloadingRecordId}
                onClose={() => setShowDetailsModal(false)}
                onDownloadRecord={handleDownloadPayslipPdf}
            />

            <PayslipPreviewModal
                open={showPayslipPreview}
                selectedPayslip={selectedPayslipRecord}
                selectedPayslipEarnings={selectedPayslipEarnings}
                selectedPayslipDeductions={selectedPayslipDeductions}
                downloadingRecordId={downloadingRecordId}
                onClose={() => setShowPayslipPreview(false)}
                onDownload={handleDownloadPayslipPdf}
            />
        </div>
    );
};

export default AdminPayroll;

import { useState } from 'react';
import { Package, Laptop, Wrench, AlertTriangle, Clock, CheckCircle, Calendar } from 'lucide-react';
import AssetStatCard from '../../components/assets/AssetStatCard';
import AddAnnouncementModal from '../../components/assets/modals/AddAnnouncementModal';
import AddAssetModal from '../../components/assets/modals/AddAssetModal';
import AssignAssetModal from '../../components/assets/modals/AssignAssetModal';
import NewClearanceModal from '../../components/assets/modals/NewClearanceModal';
import ReturnReviewModal from '../../components/assets/modals/ReturnReviewModal';
import AdminAnnouncementsTab from '../../components/assets/tabs/AdminAnnouncementsTab';
import AdminClearanceTab from '../../components/assets/tabs/AdminClearanceTab';
import AdminEvaluationTab from '../../components/assets/tabs/AdminEvaluationTab';
import AdminInventoryTab from '../../components/assets/tabs/AdminInventoryTab';
import {
    adminAssetTabs,
    evaluations,
    initialClearanceForm,
} from '../../components/assets/assetManagementConfig';
import {
    getEmployeeName,
} from '../../components/assets/assetManagementHelpers';
import type {
    AdminAssetTab,
} from '../../components/assets/assetManagementTypes';
import { useAdminAnnouncementWorkflow } from '../../components/assets/hooks/useAdminAnnouncementWorkflow';
import { useAdminAssetData } from '../../components/assets/hooks/useAdminAssetData';
import { useAdminClearanceData } from '../../components/assets/hooks/useAdminClearanceData';
import { useAdminClearanceWorkflow } from '../../components/assets/hooks/useAdminClearanceWorkflow';
import { useAssetAssignmentWorkflow } from '../../components/assets/hooks/useAssetAssignmentWorkflow';
import { useAssetCreationWorkflow } from '../../components/assets/hooks/useAssetCreationWorkflow';
import { useReturnReviewWorkflow } from '../../components/assets/hooks/useReturnReviewWorkflow';

const AssetManagement = () => {
    const [activeTab, setActiveTab] = useState<AdminAssetTab['id']>('inventory');
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
    const [showNewClearance, setShowNewClearance] = useState(false);
    const {
        assets,
        returnRequests,
        activeEmployees,
        announcements,
        isLoadingAssets,
        isLoadingReturnRequests,
        isLoadingEmployees,
        isLoadingAnnouncements,
        assetError,
        returnRequestError,
        employeeError,
        announcementError,
        loadAssets,
        loadReturnRequests,
        loadAnnouncements,
    } = useAdminAssetData();
    const {
        clearances,
        isLoadingClearances,
        clearanceError,
        loadClearances,
    } = useAdminClearanceData();
    const {
        isCreatingClearance,
        updatingDepartmentApprovalId,
        clearanceWorkflowError,
        handleCreateClearance,
        handleUpdateDepartmentApproval,
    } = useAdminClearanceWorkflow({ loadClearances });
    const {
        assetForm,
        setAssetForm,
        isSavingAsset,
        handleAddAsset,
    } = useAssetCreationWorkflow({
        loadAssets,
        closeAddAssetModal: () => setShowAddAsset(false),
    });
    const {
        showAssignAsset,
        selectedAsset,
        assignForm,
        setAssignForm,
        isAssigningAsset,
        openAssignAssetModal,
        closeAssignAssetModal,
        handleAssignAsset,
    } = useAssetAssignmentWorkflow({ loadAssets });
    const {
        selectedReturnRequest,
        returnReviewAction,
        returnReviewRemarks,
        setReturnReviewRemarks,
        isReviewingReturnRequest,
        openReturnReviewModal,
        closeReturnReviewModal,
        handleReviewReturnRequest,
    } = useReturnReviewWorkflow({ loadReturnRequests });
    const {
        announcementForm,
        setAnnouncementForm,
        isSavingAnnouncement,
        publishingAnnouncementId,
        closeAnnouncementWorkflowModal,
        handleSaveAnnouncement,
        handlePublishAnnouncement,
    } = useAdminAnnouncementWorkflow({
        loadAnnouncements,
        closeAnnouncementModal: () => setShowAddAnnouncement(false),
    });

    const [clearanceForm, setClearanceForm] = useState(initialClearanceForm);

    const statCards = [
        { label: 'Total Assets', value: assets.length, icon: Package, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'In Use', value: assets.filter(asset => asset.status === 'In Use').length, icon: Laptop, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Under Maintenance', value: assets.filter(asset => asset.status === 'Maintenance' || asset.status === 'Under Maintenance').length, icon: Wrench, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Needs Replacement', value: assets.filter(asset => asset.status === 'Needs Replacement').length, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    ];

    const isCreatedThisMonth = (createdAtUtc: string) => {
        const createdAt = new Date(createdAtUtc);
        if (Number.isNaN(createdAt.getTime())) return false;

        const now = new Date();
        return createdAt.getFullYear() === now.getFullYear()
            && createdAt.getMonth() === now.getMonth();
    };

    const clearanceStatCards = [
        {
            label: 'In Progress',
            value: clearances.filter(clearance => clearance.status === 'Pending' || clearance.status === 'InProgress').length,
            icon: Clock,
            gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        },
        {
            label: 'Completed',
            value: clearances.filter(clearance => clearance.status === 'Completed').length,
            icon: CheckCircle,
            gradient: 'linear-gradient(135deg, #059669, #10b981)',
        },
        {
            label: 'This Month',
            value: clearances.filter(clearance => isCreatedThisMonth(clearance.createdAtUtc)).length,
            icon: Calendar,
            gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)',
        },
    ];

    const handleAddClearance = async () => {
        if (!clearanceForm.employeeId || !clearanceForm.lastWorkingDay) {
            alert('Please fill in all required fields.');
            return;
        }

        try {
            const createdClearance = await handleCreateClearance({
                employeeId: clearanceForm.employeeId,
                lastWorkingDay: clearanceForm.lastWorkingDay,
                remarks: clearanceForm.remarks.trim() || null,
            });

            if (!createdClearance) return;

            setClearanceForm(initialClearanceForm);
            setShowNewClearance(false);
        } catch {
            return;
        }
    };

    const handleDepartmentApproval = async (id: number, approved: boolean) => {
        try {
            await handleUpdateDepartmentApproval(id, {
                approved,
                remarks: null,
            });
        } catch {
            return;
        }
    };

    const currentStats = activeTab === 'clearance' ? clearanceStatCards : statCards;
    const combinedClearanceError =
        clearanceWorkflowError || clearanceError;

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Asset Management</h1>
                <p>Track company assets, performance evaluations, announcements, and employee exits</p>
            </div>

            <div className={`grid gap-4 ${activeTab === 'clearance' ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {currentStats.map((card, i) => (
                    <AssetStatCard
                        key={card.label}
                        label={card.label}
                        value={card.value}
                        gradient={card.gradient}
                        icon={card.icon}
                        index={i}
                    />
                ))}
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <div className="pro-tabs">
                        {adminAssetTabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`pro-tab flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}>
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'inventory' && (
                        <AdminInventoryTab
                            assets={assets}
                            returnRequests={returnRequests}
                            isLoadingAssets={isLoadingAssets}
                            isLoadingReturnRequests={isLoadingReturnRequests}
                            assetError={assetError}
                            employeeError={employeeError}
                            returnRequestError={returnRequestError}
                            onAddAsset={() => setShowAddAsset(true)}
                            onAssignAsset={openAssignAssetModal}
                            onRefreshReturnRequests={() => void loadReturnRequests()}
                            onReviewReturnRequest={openReturnReviewModal}
                        />
                    )}

                    {activeTab === 'clearance' && (
                        <AdminClearanceTab
                            clearances={clearances}
                            isLoadingClearances={isLoadingClearances}
                            clearanceError={combinedClearanceError}
                            updatingDepartmentApprovalId={updatingDepartmentApprovalId}
                            onOpenNewClearance={() => setShowNewClearance(true)}
                            onUpdateDepartmentApproval={handleDepartmentApproval}
                        />
                    )}

                    {activeTab === 'evaluation' && (
                        <AdminEvaluationTab evaluations={evaluations} />
                    )}

                    {activeTab === 'announcements' && (
                        <AdminAnnouncementsTab
                            announcements={announcements}
                            isLoadingAnnouncements={isLoadingAnnouncements}
                            announcementError={announcementError}
                            publishingAnnouncementId={publishingAnnouncementId}
                            onNewAnnouncement={() => setShowAddAnnouncement(true)}
                            onPublishAnnouncement={handlePublishAnnouncement}
                        />
                    )}
                </div>
            </div>

            {showAddAsset && (
                <AddAssetModal
                    assetForm={assetForm}
                    isSavingAsset={isSavingAsset}
                    onClose={() => setShowAddAsset(false)}
                    onSubmit={handleAddAsset}
                    onFormChange={(field, value) =>
                        setAssetForm(current => ({ ...current, [field]: value }))
                    }
                />
            )}

            {showAssignAsset && selectedAsset && (
                <AssignAssetModal
                    selectedAsset={selectedAsset}
                    assignForm={assignForm}
                    activeEmployees={activeEmployees}
                    isLoadingEmployees={isLoadingEmployees}
                    isAssigningAsset={isAssigningAsset}
                    onClose={closeAssignAssetModal}
                    onSubmit={handleAssignAsset}
                    onFormChange={(field, value) =>
                        setAssignForm(current => ({ ...current, [field]: value }))
                    }
                    getEmployeeName={getEmployeeName}
                />
            )}

            {selectedReturnRequest && (
                <ReturnReviewModal
                    selectedReturnRequest={selectedReturnRequest}
                    returnReviewAction={returnReviewAction}
                    returnReviewRemarks={returnReviewRemarks}
                    isReviewingReturnRequest={isReviewingReturnRequest}
                    onClose={closeReturnReviewModal}
                    onConfirm={handleReviewReturnRequest}
                    onRemarksChange={setReturnReviewRemarks}
                />
            )}

            {showAddAnnouncement && (
                <AddAnnouncementModal
                    announcementForm={announcementForm}
                    isSavingAnnouncement={isSavingAnnouncement}
                    onClose={closeAnnouncementWorkflowModal}
                    onSaveDraft={() => handleSaveAnnouncement(false)}
                    onPublish={() => handleSaveAnnouncement(true)}
                    onFormChange={(field, value) =>
                        setAnnouncementForm(current => ({ ...current, [field]: value }))
                    }
                />
            )}

            {showNewClearance && (
                <NewClearanceModal
                    clearanceForm={clearanceForm}
                    employees={activeEmployees}
                    isCreatingClearance={isCreatingClearance}
                    onClose={() => setShowNewClearance(false)}
                    onSave={handleAddClearance}
                    onFormChange={(field, value) =>
                        setClearanceForm(current => ({ ...current, [field]: value }))
                    }
                />
            )}
        </div>
    );
};

export default AssetManagement;

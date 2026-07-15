import { useState } from 'react';
import { Package, Laptop, Wrench, AlertTriangle } from 'lucide-react';
import { approveReturnRequest, rejectReturnRequest } from '../../lib/assets';
import type { AssetReturnRequestDto } from '../../lib/assets';
import { createAnnouncement, publishAnnouncement } from '../../lib/announcement';
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
    clearanceDepartments,
    clearanceEmployees,
    clearanceStats,
    evaluations,
    initialAnnouncementForm,
    initialClearanceForm,
    initialClearanceRecords,
} from '../../components/assets/assetManagementConfig';
import {
    getEmployeeName,
} from '../../components/assets/assetManagementHelpers';
import type {
    AdminAssetTab,
    ClearanceChecklist,
    ClearanceRecord,
    ReturnReviewAction,
} from '../../components/assets/assetManagementTypes';
import { useAdminAssetData } from '../../components/assets/hooks/useAdminAssetData';
import { useAssetAssignmentWorkflow } from '../../components/assets/hooks/useAssetAssignmentWorkflow';
import { useAssetCreationWorkflow } from '../../components/assets/hooks/useAssetCreationWorkflow';

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
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
    const [publishingAnnouncementId, setPublishingAnnouncementId] = useState<string | null>(null);
    const [isReviewingReturnRequest, setIsReviewingReturnRequest] = useState(false);
    const [selectedReturnRequest, setSelectedReturnRequest] = useState<AssetReturnRequestDto | null>(null);
    const [returnReviewAction, setReturnReviewAction] = useState<ReturnReviewAction>('approve');
    const [returnReviewRemarks, setReturnReviewRemarks] = useState('');
    const [announcementForm, setAnnouncementForm] = useState(initialAnnouncementForm);

    const [clearanceForm, setClearanceForm] = useState(initialClearanceForm);

    const closeAnnouncementModal = () => {
        if (isSavingAnnouncement) return;

        setAnnouncementForm(initialAnnouncementForm);
        setShowAddAnnouncement(false);
    };

    const handleSaveAnnouncement = async (publishImmediately: boolean) => {
        if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
            alert('Please fill in the announcement title and content.');
            return;
        }

        setIsSavingAnnouncement(true);

        try {
            await createAnnouncement({
                title: announcementForm.title.trim(),
                content: announcementForm.content.trim(),
                priority: announcementForm.priority,
                publishImmediately,
            });

            setAnnouncementForm(initialAnnouncementForm);
            setShowAddAnnouncement(false);
            await loadAnnouncements();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to save announcement.');
        } finally {
            setIsSavingAnnouncement(false);
        }
    };

    const handlePublishAnnouncement = async (id: string) => {
        setPublishingAnnouncementId(id);

        try {
            await publishAnnouncement(id);
            await loadAnnouncements();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to publish announcement.');
        } finally {
            setPublishingAnnouncementId(null);
        }
    };

    const openReturnReviewModal = (request: AssetReturnRequestDto, action: ReturnReviewAction) => {
        setSelectedReturnRequest(request);
        setReturnReviewAction(action);
        setReturnReviewRemarks('');
    };

    const closeReturnReviewModal = () => {
        if (isReviewingReturnRequest) return;

        setSelectedReturnRequest(null);
        setReturnReviewAction('approve');
        setReturnReviewRemarks('');
    };

    const handleReviewReturnRequest = async () => {
        if (!selectedReturnRequest) return;

        setIsReviewingReturnRequest(true);

        try {
            if (returnReviewAction === 'approve') {
                await approveReturnRequest(selectedReturnRequest.id, {
                    remarks: returnReviewRemarks.trim() || null,
                });
            } else {
                await rejectReturnRequest(selectedReturnRequest.id, {
                    remarks: returnReviewRemarks.trim() || null,
                });
            }

            setSelectedReturnRequest(null);
            setReturnReviewRemarks('');
            await loadReturnRequests();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to review return request.');
        } finally {
            setIsReviewingReturnRequest(false);
        }
    };

    const statCards = [
        { label: 'Total Assets', value: assets.length, icon: Package, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'In Use', value: assets.filter(asset => asset.status === 'In Use').length, icon: Laptop, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Under Maintenance', value: assets.filter(asset => asset.status === 'Maintenance' || asset.status === 'Under Maintenance').length, icon: Wrench, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Needs Replacement', value: assets.filter(asset => asset.status === 'Needs Replacement').length, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    ];

    const [clearanceRecords, setClearanceRecords] = useState<ClearanceRecord[]>(initialClearanceRecords);

    const toggleChecklistItem = (recordId: string, item: keyof ClearanceChecklist) => {
        setClearanceRecords(prev => prev.map(r => {
            if (r.id !== recordId) return r;
            const updatedChecklist = { ...r.checklist, [item]: !r.checklist[item] };
            const allChecked = Object.values(updatedChecklist).every(v => v);
            return { ...r, checklist: updatedChecklist, status: allChecked ? 'Completed' : 'In Progress' };
        }));
    };

    const handleAddClearance = () => {
        if (!clearanceForm.employee || !clearanceForm.lastDay || !clearanceForm.department) {
            alert('Please fill in all required fields.');
            return;
        }
        const newRecord: ClearanceRecord = {
            id: `CLR-${String(clearanceRecords.length + 1).padStart(3, '0')}`,
            employee: clearanceForm.employee,
            empId: `EMP-${String(Math.floor(Math.random() * 900) + 100)}`,
            department: clearanceForm.department,
            lastDay: clearanceForm.lastDay,
            status: 'In Progress',
            checklist: { laptop: false, idCard: false, keys: false, documents: false, deptClearance: false },
        };
        setClearanceRecords(prev => [newRecord, ...prev]);
        setClearanceForm(initialClearanceForm);
        setShowNewClearance(false);
    };

    const currentStats = activeTab === 'clearance' ? clearanceStats : statCards;

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
                            clearanceRecords={clearanceRecords}
                            onOpenNewClearance={() => setShowNewClearance(true)}
                            onToggleChecklistItem={toggleChecklistItem}
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
                    onClose={closeAnnouncementModal}
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
                    employees={clearanceEmployees}
                    departments={clearanceDepartments}
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

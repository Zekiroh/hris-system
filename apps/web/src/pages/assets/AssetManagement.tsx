import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Package, Laptop, Wrench, AlertTriangle, Plus, X } from 'lucide-react';
import { approveReturnRequest, assignAsset, createAsset, getAssets, getReturnRequests, rejectReturnRequest } from '../../lib/assets';
import type { AssetDto, AssetReturnRequestDto } from '../../lib/assets';
import { getEmployees } from '../../lib/employees';
import type { EmployeeDto } from '../../lib/employees';
import { createAnnouncement, getAnnouncements, publishAnnouncement } from '../../lib/announcement';
import type { AnnouncementDto } from '../../lib/announcement';
import AdminAnnouncementCard from '../../components/assets/AdminAnnouncementCard';
import AdminAssetInventoryTable from '../../components/assets/AdminAssetInventoryTable';
import AdminClearanceRecordCard from '../../components/assets/AdminClearanceRecordCard';
import AdminEvaluationTable from '../../components/assets/AdminEvaluationTable';
import AdminReturnRequestTable from '../../components/assets/AdminReturnRequestTable';
import AssetStatCard from '../../components/assets/AssetStatCard';
import {
    adminAssetTabs,
    clearanceDepartments,
    clearanceEmployees,
    clearanceStats,
    createInitialAssignForm,
    evaluations,
    initialAnnouncementForm,
    initialAssetForm,
    initialClearanceForm,
    initialClearanceRecords,
} from '../../components/assets/assetManagementConfig';
import {
    getEmployeeName,
    unwrapEmployeesResponse,
} from '../../components/assets/assetManagementHelpers';
import type {
    AdminAssetTab,
    ClearanceChecklist,
    ClearanceRecord,
    ReturnReviewAction,
} from '../../components/assets/assetManagementTypes';

const AssetManagement = () => {
    const [activeTab, setActiveTab] = useState<AdminAssetTab['id']>('inventory');
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
    const [showNewClearance, setShowNewClearance] = useState(false);
    const [showAssignAsset, setShowAssignAsset] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
    const [assets, setAssets] = useState<AssetDto[]>([]);
    const [returnRequests, setReturnRequests] = useState<AssetReturnRequestDto[]>([]);
    const [activeEmployees, setActiveEmployees] = useState<EmployeeDto[]>([]);
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [isLoadingReturnRequests, setIsLoadingReturnRequests] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
    const [assetError, setAssetError] = useState('');
    const [returnRequestError, setReturnRequestError] = useState('');
    const [employeeError, setEmployeeError] = useState('');
    const [announcementError, setAnnouncementError] = useState('');
    const [isSavingAsset, setIsSavingAsset] = useState(false);
    const [isAssigningAsset, setIsAssigningAsset] = useState(false);
    const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
    const [publishingAnnouncementId, setPublishingAnnouncementId] = useState<string | null>(null);
    const [isReviewingReturnRequest, setIsReviewingReturnRequest] = useState(false);
    const [selectedReturnRequest, setSelectedReturnRequest] = useState<AssetReturnRequestDto | null>(null);
    const [returnReviewAction, setReturnReviewAction] = useState<ReturnReviewAction>('approve');
    const [returnReviewRemarks, setReturnReviewRemarks] = useState('');
    const [assetForm, setAssetForm] = useState(initialAssetForm);
    const [assignForm, setAssignForm] = useState(createInitialAssignForm);
    const [announcementForm, setAnnouncementForm] = useState(initialAnnouncementForm);

    const [clearanceForm, setClearanceForm] = useState(initialClearanceForm);

    useEffect(() => {
        void loadAssets();
        void loadReturnRequests();
        void loadEmployees();
        void loadAnnouncements();
    }, []);

    const loadAssets = async () => {
        setIsLoadingAssets(true);
        setAssetError('');

        try {
            const data = await getAssets();
            setAssets(data);
        } catch (error) {
            setAssetError(error instanceof Error ? error.message : 'Unable to load assets.');
        } finally {
            setIsLoadingAssets(false);
        }
    };

    const loadReturnRequests = async () => {
        setIsLoadingReturnRequests(true);
        setReturnRequestError('');

        try {
            const data = await getReturnRequests();
            setReturnRequests(data);
        } catch (error) {
            setReturnRequestError(error instanceof Error ? error.message : 'Unable to load return requests.');
        } finally {
            setIsLoadingReturnRequests(false);
        }
    };

    const loadEmployees = async () => {
        setIsLoadingEmployees(true);
        setEmployeeError('');

        try {
            const response = await getEmployees({ page: 1, pageSize: 100 });
            const payload = unwrapEmployeesResponse(response);
            setActiveEmployees(payload.items.filter((employee: EmployeeDto) => employee.isActive));
        } catch (error) {
            setEmployeeError(error instanceof Error ? error.message : 'Unable to load employees.');
        } finally {
            setIsLoadingEmployees(false);
        }
    };

    const loadAnnouncements = async () => {
        setIsLoadingAnnouncements(true);
        setAnnouncementError('');

        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            setAnnouncementError(error instanceof Error ? error.message : 'Unable to load announcements.');
        } finally {
            setIsLoadingAnnouncements(false);
        }
    };

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

    const openAssignAssetModal = (asset: AssetDto) => {
        setSelectedAsset(asset);
        setAssignForm(createInitialAssignForm());
        setShowAssignAsset(true);
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

    const handleAddAsset = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!assetForm.assetCode.trim() || !assetForm.assetName.trim() || !assetForm.category.trim()) {
            alert('Please fill in all required asset fields.');
            return;
        }

        setIsSavingAsset(true);

        try {
            await createAsset({
                assetCode: assetForm.assetCode.trim(),
                assetName: assetForm.assetName.trim(),
                category: assetForm.category.trim(),
                brand: assetForm.brand.trim() || null,
                model: assetForm.model.trim() || null,
                serialNumber: assetForm.serialNumber.trim() || null,
                purchaseDate: assetForm.purchaseDate || null,
                status: assetForm.status || null,
                notes: assetForm.notes.trim() || null,
            });

            setAssetForm(initialAssetForm);
            setShowAddAsset(false);
            await loadAssets();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to add asset.');
        } finally {
            setIsSavingAsset(false);
        }
    };

    const handleAssignAsset = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedAsset) return;

        if (!assignForm.employeeId) {
            alert('Please select an employee.');
            return;
        }

        setIsAssigningAsset(true);

        try {
            await assignAsset(selectedAsset.id, {
                employeeId: assignForm.employeeId,
                assignedDate: assignForm.assignedDate || null,
                remarks: assignForm.remarks.trim() || null,
            });

            setAssignForm(createInitialAssignForm());
            setSelectedAsset(null);
            setShowAssignAsset(false);
            await loadAssets();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to assign asset.');
        } finally {
            setIsAssigningAsset(false);
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
                        <div className="space-y-6">
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-bold text-gray-800">Assets</h3>
                                    <button onClick={() => setShowAddAsset(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Asset</button>
                                </div>
                                {assetError && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {assetError}
                                    </div>
                                )}
                                {employeeError && (
                                    <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                                        {employeeError}
                                    </div>
                                )}
                                <AdminAssetInventoryTable
                                    assets={assets}
                                    isLoading={isLoadingAssets}
                                    onAssignAsset={openAssignAssetModal}
                                />
                            </div>

                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-base font-bold text-gray-800">Return Requests</h3>
                                        <p className="text-xs text-gray-400 mt-1">Review employee asset return requests before physical receiving.</p>
                                    </div>
                                    <button onClick={() => void loadReturnRequests()} className="btn btn-secondary text-xs !py-1.5">
                                        Refresh
                                    </button>
                                </div>

                                {returnRequestError && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {returnRequestError}
                                    </div>
                                )}

                                <AdminReturnRequestTable
                                    returnRequests={returnRequests}
                                    isLoading={isLoadingReturnRequests}
                                    onReviewReturnRequest={openReturnReviewModal}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'clearance' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Exit Clearance Records</h3>
                                <button onClick={() => setShowNewClearance(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Clearance</button>
                            </div>

                            <div className="space-y-4">
                                {clearanceRecords.map(record => (
                                    <AdminClearanceRecordCard
                                        key={record.id}
                                        record={record}
                                        onToggleChecklistItem={toggleChecklistItem}
                                    />
                                ))}
                                {clearanceRecords.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm italic">No clearance records yet.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'evaluation' && (
                        <div className="space-y-5">
                            <h3 className="text-base font-bold text-gray-800">Performance Evaluation Results</h3>
                            <AdminEvaluationTable evaluations={evaluations} />
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Announcements</h3>
                                <button onClick={() => setShowAddAnnouncement(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
                            </div>
                            <div className="space-y-4">
                                {announcementError && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {announcementError}
                                    </div>
                                )}
                                {isLoadingAnnouncements && (
                                    <div className="pro-card !shadow-none border border-gray-100 !p-5">
                                        <p className="text-sm text-gray-500">Loading announcements...</p>
                                    </div>
                                )}
                                {!isLoadingAnnouncements && announcements.map(a => (
                                    <AdminAnnouncementCard
                                        key={a.id}
                                        announcement={a}
                                        publishingAnnouncementId={publishingAnnouncementId}
                                        onPublishAnnouncement={handlePublishAnnouncement}
                                    />
                                ))}
                                {!isLoadingAnnouncements && announcements.length === 0 && (
                                    <div className="pro-card !shadow-none border border-gray-100 !p-5">
                                        <p className="text-sm text-gray-500">No announcements yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showAddAsset && (
                <div className="pro-modal-overlay" onClick={() => setShowAddAsset(false)}>
                    <form className="pro-modal max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()} onSubmit={handleAddAsset}>
                        <div className="pro-modal-header border-b border-gray-100">
                            <div>
                                <h3>Add New Asset</h3>
                                <p className="text-xs text-gray-400 mt-1">Create a company asset record. Assignment is handled separately.</p>
                            </div>
                            <button type="button" onClick={() => setShowAddAsset(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-5 max-h-[70vh] overflow-y-auto">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <Laptop className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">Asset Information</p>
                                        <p className="text-xs text-gray-500 mt-1">Use a unique asset ID and complete the device details for monitoring.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Asset ID <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. AST-001"
                                        className="pro-input"
                                        value={assetForm.assetCode}
                                        onChange={e => setAssetForm({ ...assetForm, assetCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Asset Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dell Laptop XPS 15"
                                        className="pro-input"
                                        value={assetForm.assetName}
                                        onChange={e => setAssetForm({ ...assetForm, assetName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Category <span className="text-red-500">*</span></label>
                                    <select
                                        className="pro-select"
                                        value={assetForm.category}
                                        onChange={e => setAssetForm({ ...assetForm, category: e.target.value })}
                                    >
                                        <option>IT Equipment</option>
                                        <option>Office Equipment</option>
                                        <option>Furniture</option>
                                        <option>Vehicle</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pro-label">Status</label>
                                    <select
                                        className="pro-select"
                                        value={assetForm.status}
                                        onChange={e => setAssetForm({ ...assetForm, status: e.target.value })}
                                    >
                                        <option>Available</option>
                                        <option>Maintenance</option>
                                        <option>Needs Replacement</option>
                                        <option>Disposed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pro-label">Brand</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Dell"
                                        className="pro-input"
                                        value={assetForm.brand}
                                        onChange={e => setAssetForm({ ...assetForm, brand: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Model</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. XPS 15"
                                        className="pro-input"
                                        value={assetForm.model}
                                        onChange={e => setAssetForm({ ...assetForm, model: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Serial Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. SN-123456"
                                        className="pro-input"
                                        value={assetForm.serialNumber}
                                        onChange={e => setAssetForm({ ...assetForm, serialNumber: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="pro-label">Purchase Date</label>
                                    <input
                                        type="date"
                                        className="pro-input"
                                        value={assetForm.purchaseDate}
                                        onChange={e => setAssetForm({ ...assetForm, purchaseDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="pro-label">Notes</label>
                                <textarea
                                    rows={3}
                                    placeholder="Optional notes..."
                                    className="pro-input resize-none"
                                    value={assetForm.notes}
                                    onChange={e => setAssetForm({ ...assetForm, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pro-modal-footer border-t border-gray-100">
                            <button type="button" onClick={() => setShowAddAsset(false)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" disabled={isSavingAsset} className="btn btn-primary">
                                {isSavingAsset ? 'Saving...' : 'Save Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showAssignAsset && selectedAsset && (
                <div className="pro-modal-overlay" onClick={() => setShowAssignAsset(false)}>
                    <form className="pro-modal max-w-md overflow-hidden" onClick={e => e.stopPropagation()} onSubmit={handleAssignAsset}>
                        <div className="pro-modal-header border-b border-gray-100">
                            <div>
                                <h3>Assign Asset</h3>
                                <p className="text-xs text-gray-400 mt-1">Assign {selectedAsset.assetCode} to an active employee.</p>
                            </div>
                            <button type="button" onClick={() => setShowAssignAsset(false)} className="btn-ghost btn-icon" disabled={isAssigningAsset}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-5">
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                                <p className="text-sm font-bold text-gray-800">{selectedAsset.assetName}</p>
                                <p className="text-xs text-gray-500 mt-1">{selectedAsset.assetCode} • {selectedAsset.category}</p>
                            </div>

                            <div>
                                <label className="pro-label">Employee <span className="text-red-500">*</span></label>
                                <select
                                    className="pro-select"
                                    value={assignForm.employeeId}
                                    onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                                    disabled={isLoadingEmployees || isAssigningAsset}
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {activeEmployees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {getEmployeeName(employee)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="pro-label">Assigned Date</label>
                                <input
                                    type="date"
                                    className="pro-input"
                                    value={assignForm.assignedDate}
                                    onChange={e => setAssignForm({ ...assignForm, assignedDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="pro-label">Remarks</label>
                                <textarea
                                    rows={3}
                                    placeholder="Optional assignment remarks..."
                                    className="pro-input resize-none"
                                    value={assignForm.remarks}
                                    onChange={e => setAssignForm({ ...assignForm, remarks: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pro-modal-footer border-t border-gray-100">
                            <button type="button" onClick={() => setShowAssignAsset(false)} className="btn btn-secondary">Cancel</button>
                            <button type="submit" disabled={isAssigningAsset || isLoadingEmployees} className="btn btn-primary">
                                {isAssigningAsset ? 'Assigning...' : 'Assign Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {selectedReturnRequest && (
                <div className="pro-modal-overlay" onClick={closeReturnReviewModal}>
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100">
                            <div>
                                <h3>{returnReviewAction === 'approve' ? 'Approve Return Request' : 'Reject Return Request'}</h3>
                                <p className="text-xs text-gray-400 mt-1">
                                    Review request RR-{String(selectedReturnRequest.id).padStart(3, '0')}.
                                </p>
                            </div>
                            <button type="button" onClick={closeReturnReviewModal} className="btn-ghost btn-icon" disabled={isReviewingReturnRequest}>
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                <p className="text-sm font-bold text-gray-800">{selectedReturnRequest.assetName}</p>
                                <p className="text-xs text-gray-500 mt-1">{selectedReturnRequest.assetCode} • {selectedReturnRequest.requestedByEmployeeName}</p>
                                <p className="text-xs text-gray-400 mt-2">{selectedReturnRequest.reason}</p>
                            </div>

                            <div>
                                <label className="pro-label">Review Remarks</label>
                                <textarea
                                    rows={3}
                                    className="pro-input resize-none"
                                    placeholder={returnReviewAction === 'approve' ? 'e.g. Approved for physical return.' : 'e.g. Request rejected due to incomplete details.'}
                                    value={returnReviewRemarks}
                                    onChange={e => setReturnReviewRemarks(e.target.value)}
                                    disabled={isReviewingReturnRequest}
                                />
                            </div>
                        </div>
                        <div className="pro-modal-footer border-t border-gray-100">
                            <button type="button" onClick={closeReturnReviewModal} className="btn btn-secondary" disabled={isReviewingReturnRequest}>Cancel</button>
                            <button type="button" onClick={handleReviewReturnRequest} disabled={isReviewingReturnRequest} className="btn btn-primary">
                                {isReviewingReturnRequest
                                    ? 'Saving...'
                                    : returnReviewAction === 'approve'
                                        ? 'Approve Request'
                                        : 'Reject Request'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddAnnouncement && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>New Announcement</h3><button onClick={closeAnnouncementModal} disabled={isSavingAnnouncement} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Title</label><input type="text" placeholder="Announcement title" className="pro-input" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} disabled={isSavingAnnouncement} /></div>
                            <div><label className="pro-label">Priority</label><select className="pro-select" value={announcementForm.priority} onChange={e => setAnnouncementForm({ ...announcementForm, priority: e.target.value })} disabled={isSavingAnnouncement}><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                            <div><label className="pro-label">Content</label><textarea rows={4} placeholder="Write your announcement..." className="pro-input resize-none" value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} disabled={isSavingAnnouncement} /></div>
                        </div>
                        <div className="pro-modal-footer"><button type="button" onClick={() => handleSaveAnnouncement(false)} disabled={isSavingAnnouncement} className="btn btn-secondary">{isSavingAnnouncement ? 'Saving...' : 'Save Draft'}</button><button type="button" onClick={() => handleSaveAnnouncement(true)} disabled={isSavingAnnouncement} className="btn btn-primary">{isSavingAnnouncement ? 'Publishing...' : 'Publish'}</button></div>
                    </div>
                </div>
            )}

            {showNewClearance && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header">
                            <h3>Process Employee Clearance</h3>
                            <button onClick={() => setShowNewClearance(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4">
                            <div>
                                <label className="pro-label">Select Employee</label>
                                <select
                                    className="pro-select"
                                    value={clearanceForm.employee}
                                    onChange={e => setClearanceForm({ ...clearanceForm, employee: e.target.value })}
                                >
                                    <option value="">-- Choose Employee --</option>
                                    {clearanceEmployees.map(emp => (
                                        <option key={emp} value={emp}>{emp}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="pro-label">Department</label>
                                <select
                                    className="pro-select"
                                    value={clearanceForm.department}
                                    onChange={e => setClearanceForm({ ...clearanceForm, department: e.target.value })}
                                >
                                    <option value="">-- Choose Department --</option>
                                    {clearanceDepartments.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="pro-label">Last Day of Work</label>
                                <input
                                    type="date"
                                    className="pro-input"
                                    value={clearanceForm.lastDay}
                                    onChange={e => setClearanceForm({ ...clearanceForm, lastDay: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="pro-label">Notes / Remarks</label>
                                <textarea
                                    rows={3}
                                    className="pro-input resize-none"
                                    placeholder="Add any final notes..."
                                    value={clearanceForm.notes}
                                    onChange={e => setClearanceForm({ ...clearanceForm, notes: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowNewClearance(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleAddClearance} className="btn btn-primary">Save Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetManagement;

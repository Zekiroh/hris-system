import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Package, Laptop, Wrench, AlertTriangle, Plus, X, Star, Megaphone, CheckCircle, XCircle, Clock, ClipboardCheck, Calendar, UserPlus } from 'lucide-react';
import { approveReturnRequest, assignAsset, createAsset, getAssets, getReturnRequests, rejectReturnRequest } from '../../lib/assets';
import type { AssetDto, AssetReturnRequestDto } from '../../lib/assets';
import { getEmployees } from '../../lib/employees';
import type { EmployeeDto, PagedEmployeesResponse } from '../../lib/employees';

type Tab = 'inventory' | 'clearance' | 'evaluation' | 'announcements';
type ClearanceStatus = 'In Progress' | 'Completed';
type ReturnReviewAction = 'approve' | 'reject';

interface ClearanceChecklist {
    laptop: boolean;
    idCard: boolean;
    keys: boolean;
    documents: boolean;
    deptClearance: boolean;
}

interface ClearanceRecord {
    id: string;
    employee: string;
    empId: string;
    department: string;
    lastDay: string;
    status: ClearanceStatus;
    checklist: ClearanceChecklist;
}

const initialAssetForm = {
    assetCode: '',
    assetName: '',
    category: 'IT Equipment',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    status: 'Available',
    notes: '',
};

const initialAssignForm = {
    employeeId: '',
    assignedDate: new Date().toISOString().slice(0, 10),
    remarks: '',
};

const unwrapEmployeesResponse = (
    response: Awaited<ReturnType<typeof getEmployees>>
): PagedEmployeesResponse => {
    if ('data' in response && response.data) {
        return response.data;
    }

    return response as PagedEmployeesResponse;
};

const AssetManagement = () => {
    const [activeTab, setActiveTab] = useState<Tab>('inventory');
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
    const [showNewClearance, setShowNewClearance] = useState(false);
    const [showAssignAsset, setShowAssignAsset] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<AssetDto | null>(null);
    const [assets, setAssets] = useState<AssetDto[]>([]);
    const [returnRequests, setReturnRequests] = useState<AssetReturnRequestDto[]>([]);
    const [activeEmployees, setActiveEmployees] = useState<EmployeeDto[]>([]);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);
    const [isLoadingReturnRequests, setIsLoadingReturnRequests] = useState(false);
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
    const [assetError, setAssetError] = useState('');
    const [returnRequestError, setReturnRequestError] = useState('');
    const [employeeError, setEmployeeError] = useState('');
    const [isSavingAsset, setIsSavingAsset] = useState(false);
    const [isAssigningAsset, setIsAssigningAsset] = useState(false);
    const [isReviewingReturnRequest, setIsReviewingReturnRequest] = useState(false);
    const [selectedReturnRequest, setSelectedReturnRequest] = useState<AssetReturnRequestDto | null>(null);
    const [returnReviewAction, setReturnReviewAction] = useState<ReturnReviewAction>('approve');
    const [returnReviewRemarks, setReturnReviewRemarks] = useState('');
    const [assetForm, setAssetForm] = useState(initialAssetForm);
    const [assignForm, setAssignForm] = useState(initialAssignForm);

    const [clearanceForm, setClearanceForm] = useState({
        employee: '',
        department: '',
        lastDay: '',
        notes: '',
    });

    useEffect(() => {
        void loadAssets();
        void loadReturnRequests();
        void loadEmployees();
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

    const getEmployeeName = (employee: EmployeeDto) => {
        return [employee.firstName, employee.middleName, employee.lastName]
            .filter(Boolean)
            .join(' ');
    };

    const openAssignAssetModal = (asset: AssetDto) => {
        setSelectedAsset(asset);
        setAssignForm(initialAssignForm);
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

            setAssignForm(initialAssignForm);
            setSelectedAsset(null);
            setShowAssignAsset(false);
            await loadAssets();
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Unable to assign asset.');
        } finally {
            setIsAssigningAsset(false);
        }
    };

    const tabs = [
        { id: 'inventory' as Tab, label: 'Laptop Monitoring', icon: Laptop },
        { id: 'clearance' as Tab, label: 'Clearance & Exit', icon: ClipboardCheck },
        { id: 'evaluation' as Tab, label: 'Performance Evaluation', icon: Star },
        { id: 'announcements' as Tab, label: 'Announcement Board', icon: Megaphone },
    ];

    const statCards = [
        { label: 'Total Assets', value: assets.length, icon: Package, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'In Use', value: assets.filter(asset => asset.status === 'In Use').length, icon: Laptop, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Under Maintenance', value: assets.filter(asset => asset.status === 'Maintenance' || asset.status === 'Under Maintenance').length, icon: Wrench, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Needs Replacement', value: assets.filter(asset => asset.status === 'Needs Replacement').length, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    ];

    const clearanceStats = [
        { label: 'In Progress', value: 3, icon: Clock, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Completed', value: 15, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'This Month', value: 5, icon: Calendar, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const statusBadge: Record<string, string> = {
        'In Use': 'badge-success',
        Available: 'badge-info',
        Maintenance: 'badge-warning',
        'Under Maintenance': 'badge-warning',
        'Needs Replacement': 'badge-danger',
        Disposed: 'badge-neutral',
        Excellent: 'badge-success',
        Good: 'badge-info',
        'Needs Improvement': 'badge-warning',
        Published: 'badge-success',
        Draft: 'badge-neutral',
        'In Progress': 'badge-warning',
        Completed: 'badge-success',
        Pending: 'badge-warning',
        Approved: 'badge-success',
        Rejected: 'badge-danger',
    };

    const priorityBadge: Record<string, string> = {
        Normal: 'badge-neutral',
        Important: 'badge-warning',
        Urgent: 'badge-danger',
    };

    const evaluations = [
        { employee: 'Dela Cruz, Juan', period: 'Q4 2025', reviewer: 'Admin Manager', score: '4.5/5.0', rating: 'Excellent', status: 'Excellent' },
        { employee: 'Santos, Maria', period: 'Q4 2025', reviewer: 'Admin Manager', score: '4.0/5.0', rating: 'Good', status: 'Good' },
        { employee: 'Reyes, Jose', period: 'Q4 2025', reviewer: 'Admin Manager', score: '3.2/5.0', rating: 'Needs Improvement', status: 'Needs Improvement' },
    ];

    const announcements = [
        { title: 'Company Outing 2026', date: '2026-02-20', author: 'HR Department', priority: 'Normal', status: 'Published', excerpt: 'Annual company outing scheduled for March 15-16, 2026 at Batangas Beach Resort.' },
        { title: 'Policy Update: Remote Work', date: '2026-02-15', author: 'Admin Department', priority: 'Important', status: 'Published', excerpt: 'Updated remote work policy effective March 1, 2026. All employees must acknowledge.' },
        { title: 'System Maintenance Notice', date: '2026-02-10', author: 'IT Department', priority: 'Urgent', status: 'Draft', excerpt: 'Scheduled system maintenance on February 28, 2026 from 10 PM to 2 AM.' },
    ];

    const [clearanceRecords, setClearanceRecords] = useState<ClearanceRecord[]>([
        {
            id: 'CLR-001',
            employee: 'Roberto Gomez',
            empId: 'EMP-025',
            department: 'Sales',
            lastDay: '2026-03-15',
            status: 'In Progress',
            checklist: { laptop: true, idCard: true, keys: false, documents: true, deptClearance: false },
        },
        {
            id: 'CLR-002',
            employee: 'Ana Reyes',
            empId: 'EMP-018',
            department: 'Marketing',
            lastDay: '2026-02-20',
            status: 'Completed',
            checklist: { laptop: true, idCard: true, keys: true, documents: true, deptClearance: true },
        },
    ]);

    const employees = [
        'Dela Cruz, Juan', 'Santos, Maria', 'Reyes, Jose', 'Garcia, Ana', 'Fernandez, Rosa',
        'Roberto Gomez', 'Ana Reyes', 'Carlos Mendoza', 'Lisa Tan',
    ];

    const departments = ['Administration', 'Sales', 'Marketing', 'IT', 'Finance', 'HR'];

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
        setClearanceForm({ employee: '', department: '', lastDay: '', notes: '' });
        setShowNewClearance(false);
    };

    const checklistLabels: { key: keyof ClearanceChecklist; label: string }[] = [
        { key: 'laptop', label: 'Laptop' },
        { key: 'idCard', label: 'ID Card' },
        { key: 'keys', label: 'Keys' },
        { key: 'documents', label: 'Documents' },
        { key: 'deptClearance', label: 'Dept. Clearance' },
    ];

    const currentStats = activeTab === 'clearance' ? clearanceStats : statCards;

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Asset Management</h1>
                <p>Track company assets, performance evaluations, announcements, and employee exits</p>
            </div>

            <div className={`grid gap-4 ${activeTab === 'clearance' ? 'grid-cols-3' : 'grid-cols-2 lg:grid-cols-4'}`}>
                {currentStats.map((card, i) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                        <div className="flex items-center justify-between relative z-10">
                            <div>
                                <p className="stat-label">{card.label}</p>
                                <p className="stat-value">{card.value}</p>
                            </div>
                            <div className="stat-icon"><card.icon className="w-5 h-5" /></div>
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
                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="pro-table">
                                        <thead>
                                            <tr>
                                                {['Asset ID', 'Name', 'Category', 'Assigned To', 'Purchase Date', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingAssets && (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm italic">Loading assets...</td>
                                                </tr>
                                            )}
                                            {!isLoadingAssets && assets.map(a => (
                                                <tr key={a.id}>
                                                    <td className="font-mono text-xs">{a.assetCode}</td>
                                                    <td className="!font-medium !text-gray-800">{a.assetName}</td>
                                                    <td>{a.category}</td>
                                                    <td>{a.assignedEmployeeName || '-'}</td>
                                                    <td>{a.purchaseDate || '-'}</td>
                                                    <td><span className={`badge ${statusBadge[a.status] ?? 'badge-neutral'}`}><span className="badge-dot" />{a.status}</span></td>
                                                    <td>
                                                        <button
                                                            type="button"
                                                            onClick={() => openAssignAssetModal(a)}
                                                            disabled={a.status !== 'Available' || Boolean(a.activeAssignmentId)}
                                                            className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <UserPlus className="w-3.5 h-3.5" />
                                                            Assign
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {!isLoadingAssets && assets.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm italic">No assets found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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

                                <div className="overflow-x-auto rounded-xl border border-gray-100">
                                    <table className="pro-table">
                                        <thead>
                                            <tr>
                                                {['Request ID', 'Asset', 'Employee', 'Requested Date', 'Reason', 'Status', 'Reviewed By', 'Actions'].map(h => <th key={h}>{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isLoadingReturnRequests && (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-8 text-gray-400 text-sm italic">Loading return requests...</td>
                                                </tr>
                                            )}
                                            {!isLoadingReturnRequests && returnRequests.map(request => (
                                                <tr key={request.id}>
                                                    <td className="font-mono text-xs">RR-{String(request.id).padStart(3, '0')}</td>
                                                    <td>
                                                        <div className="!font-medium !text-gray-800">{request.assetName}</div>
                                                        <div className="text-xs text-gray-400">{request.assetCode}</div>
                                                    </td>
                                                    <td>
                                                        <div className="!font-medium !text-gray-800">{request.requestedByEmployeeName}</div>
                                                        <div className="text-xs text-gray-400">{request.requestedByEmployeeNumber}</div>
                                                    </td>
                                                    <td>{request.requestedDate}</td>
                                                    <td className="max-w-[220px]">
                                                        <p className="truncate" title={request.reason}>{request.reason}</p>
                                                        {request.reviewRemarks && (
                                                            <p className="text-xs text-gray-400 truncate mt-1" title={request.reviewRemarks}>
                                                                Review: {request.reviewRemarks}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td><span className={`badge ${statusBadge[request.status] ?? 'badge-neutral'}`}><span className="badge-dot" />{request.status}</span></td>
                                                    <td>{request.reviewedByUserName || '-'}</td>
                                                    <td>
                                                        {request.status === 'Pending' ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openReturnReviewModal(request, 'approve')}
                                                                    className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                                                                >
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openReturnReviewModal(request, 'reject')}
                                                                    className="btn btn-secondary flex items-center gap-1.5 text-xs !py-1.5"
                                                                >
                                                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="badge badge-neutral">
                                                                <span className="badge-dot" />
                                                                Reviewed
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {!isLoadingReturnRequests && returnRequests.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="text-center py-8 text-gray-400 text-sm italic">No return requests found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
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
                                    <div key={record.id} className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-800">{record.employee}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {record.empId} • {record.department} • Last Day: {record.lastDay}
                                                </p>
                                            </div>
                                            <span className={`badge ${statusBadge[record.status]}`}>
                                                <span className="badge-dot" />{record.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">Clearance Checklist</p>
                                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                                            {checklistLabels.map(item => (
                                                <button
                                                    key={item.key}
                                                    onClick={() => toggleChecklistItem(record.id, item.key)}
                                                    className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-70"
                                                    title={`Click to toggle ${item.label}`}
                                                >
                                                    {record.checklist[item.key] ? (
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-400" />
                                                    )}
                                                    <span className={record.checklist[item.key] ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Employee', 'Review Period', 'Reviewer', 'Score', 'Rating'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {evaluations.map((e, i) => (
                                            <tr key={i}>
                                                <td className="!font-medium !text-gray-800">{e.employee}</td>
                                                <td>{e.period}</td>
                                                <td>{e.reviewer}</td>
                                                <td className="!font-bold">{e.score}</td>
                                                <td><span className={`badge ${statusBadge[e.status]}`}><span className="badge-dot" />{e.rating}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Announcements</h3>
                                <button onClick={() => setShowAddAnnouncement(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Announcement</button>
                            </div>
                            <div className="space-y-4">
                                {announcements.map((a, i) => (
                                    <div key={i} className="pro-card !shadow-none border border-gray-100 !p-5 hover:border-emerald-200 transition-colors">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="text-sm font-bold text-gray-800">{a.title}</h4>
                                            <div className="flex gap-2">
                                                <span className={`badge text-[10px] ${priorityBadge[a.priority]}`}><span className="badge-dot" />{a.priority}</span>
                                                <span className={`badge text-[10px] ${statusBadge[a.status]}`}><span className="badge-dot" />{a.status}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{a.excerpt}</p>
                                        <p className="text-xs text-gray-400">{a.date} • {a.author}</p>
                                    </div>
                                ))}
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
                            <button type="submit" disabled={isSavingAsset} className="btn btn-primary">{isSavingAsset ? 'Adding...' : 'Add Asset'}</button>
                        </div>
                    </form>
                </div>
            )}

            {showAssignAsset && selectedAsset && (
                <div className="pro-modal-overlay" onClick={() => setShowAssignAsset(false)}>
                    <form className="pro-modal max-w-lg overflow-hidden" onClick={e => e.stopPropagation()} onSubmit={handleAssignAsset}>
                        <div className="pro-modal-header border-b border-gray-100">
                            <div>
                                <h3>Assign Asset</h3>
                                <p className="text-xs text-gray-400 mt-1">Link this company asset to an active employee.</p>
                            </div>
                            <button type="button" onClick={() => setShowAssignAsset(false)} className="btn-ghost btn-icon">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <div className="pro-modal-body space-y-5">
                            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Laptop className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{selectedAsset.assetName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{selectedAsset.assetCode} • {selectedAsset.category}</p>
                                        <p className="text-xs text-gray-400 mt-1">{selectedAsset.brand || 'No brand'} {selectedAsset.model || ''}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="pro-label">Employee <span className="text-red-500">*</span></label>
                                <select
                                    className="pro-select"
                                    value={assignForm.employeeId}
                                    onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                                    disabled={isLoadingEmployees}
                                >
                                    <option value="">{isLoadingEmployees ? 'Loading employees...' : '-- Select Employee --'}</option>
                                    {activeEmployees.map(employee => (
                                        <option key={employee.id} value={employee.id}>
                                            {employee.employeeNumber} - {getEmployeeName(employee)}
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
                        <div className="pro-modal-header"><h3>New Announcement</h3><button onClick={() => setShowAddAnnouncement(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Title</label><input type="text" placeholder="Announcement title" className="pro-input" /></div>
                            <div><label className="pro-label">Priority</label><select className="pro-select"><option>Normal</option><option>Important</option><option>Urgent</option></select></div>
                            <div><label className="pro-label">Content</label><textarea rows={4} placeholder="Write your announcement..." className="pro-input resize-none" /></div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowAddAnnouncement(false)} className="btn btn-secondary">Save Draft</button><button onClick={() => setShowAddAnnouncement(false)} className="btn btn-primary">Publish</button></div>
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
                                    {employees.map(emp => (
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
                                    {departments.map(dept => (
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
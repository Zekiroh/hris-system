import { useState } from 'react';
import { Package, Laptop, Wrench, AlertTriangle, Plus, X, Star, Megaphone, CheckCircle, XCircle, Clock, ClipboardCheck, Calendar } from 'lucide-react';

type Tab = 'inventory' | 'clearance' | 'evaluation' | 'announcements';
type ClearanceStatus = 'In Progress' | 'Completed';

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

const AssetManagement = () => {
    const [activeTab, setActiveTab] = useState<Tab>('inventory');
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
    const [showNewClearance, setShowNewClearance] = useState(false);

    // New clearance form state
    const [clearanceForm, setClearanceForm] = useState({
        employee: '',
        department: '',
        lastDay: '',
        notes: '',
    });

    const tabs = [
        { id: 'inventory' as Tab, label: 'Laptop Monitoring', icon: Laptop },
        { id: 'clearance' as Tab, label: 'Clearance & Exit', icon: ClipboardCheck },
        { id: 'evaluation' as Tab, label: 'Performance Evaluation', icon: Star },
        { id: 'announcements' as Tab, label: 'Announcement Board', icon: Megaphone },
    ];

    const statCards = [
        { label: 'Total Assets', value: 850, icon: Package, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'In Use', value: 720, icon: Laptop, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Under Maintenance', value: 45, icon: Wrench, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Needs Replacement', value: 15, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
    ];

    // Clearance-specific stat cards
    const clearanceStats = [
        { label: 'In Progress', value: 3, icon: Clock, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Completed', value: 15, icon: CheckCircle, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'This Month', value: 5, icon: Calendar, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    const statusBadge: Record<string, string> = {
        'In Use': 'badge-success',
        Available: 'badge-info',
        Maintenance: 'badge-warning',
        Disposed: 'badge-neutral',
        Excellent: 'badge-success',
        Good: 'badge-info',
        'Needs Improvement': 'badge-warning',
        Published: 'badge-success',
        Draft: 'badge-neutral',
        'In Progress': 'badge-warning',
        Completed: 'badge-success',
    };

    const priorityBadge: Record<string, string> = {
        Normal: 'badge-neutral',
        Important: 'badge-warning',
        Urgent: 'badge-danger',
    };

    const assets = [
        { id: 'AST-001', name: 'Dell Laptop XPS 15', category: 'IT Equipment', assignedTo: 'Dela Cruz, Juan', purchaseDate: '2024-06-15', status: 'In Use' },
        { id: 'AST-002', name: 'HP LaserJet Printer', category: 'Office Equipment', assignedTo: '-', purchaseDate: '2023-11-20', status: 'Available' },
        { id: 'AST-003', name: 'Ergonomic Office Chair', category: 'Furniture', assignedTo: 'Santos, Maria', purchaseDate: '2024-01-10', status: 'In Use' },
        { id: 'AST-004', name: 'Samsung Monitor 27"', category: 'IT Equipment', assignedTo: '-', purchaseDate: '2022-08-05', status: 'Maintenance' },
    ];

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

    // Clearance records with checklists
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

    // Determine which stat cards to show based on tab
    const currentStats = activeTab === 'clearance' ? clearanceStats : statCards;

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Asset Management</h1>
                <p>Track company assets, performance evaluations, announcements, and employee exits</p>
            </div>

            {/* Stat Cards */}
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

            {/* Tabs Card */}
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
                    {/* Laptop Monitoring Tab */}
                    {activeTab === 'inventory' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Assets</h3>
                                <button onClick={() => setShowAddAsset(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> Add Asset</button>
                            </div>
                            <div className="overflow-x-auto rounded-xl border border-gray-100">
                                <table className="pro-table">
                                    <thead><tr>{['Asset ID', 'Name', 'Category', 'Assigned To', 'Purchase Date', 'Status'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                                    <tbody>
                                        {assets.map(a => (
                                            <tr key={a.id}>
                                                <td className="font-mono text-xs">{a.id}</td>
                                                <td className="!font-medium !text-gray-800">{a.name}</td>
                                                <td>{a.category}</td>
                                                <td>{a.assignedTo}</td>
                                                <td>{a.purchaseDate}</td>
                                                <td><span className={`badge ${statusBadge[a.status]}`}><span className="badge-dot" />{a.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Clearance & Exit Tab */}
                    {activeTab === 'clearance' && (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <h3 className="text-base font-bold text-gray-800">Exit Clearance Records</h3>
                                <button onClick={() => setShowNewClearance(true)} className="btn btn-primary"><Plus className="w-4 h-4" /> New Clearance</button>
                            </div>

                            {/* Clearance Cards with Checklists */}
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

                    {/* Performance Evaluation Tab */}
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

                    {/* Announcement Board Tab */}
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

            {/* Add Asset Modal */}
            {showAddAsset && (
                <div className="pro-modal-overlay">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header"><h3>Add New Asset</h3><button onClick={() => setShowAddAsset(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button></div>
                        <div className="pro-modal-body space-y-4">
                            <div><label className="pro-label">Asset Name</label><input type="text" placeholder="e.g. Dell Laptop XPS 15" className="pro-input" /></div>
                            <div><label className="pro-label">Category</label><select className="pro-select"><option>IT Equipment</option><option>Office Equipment</option><option>Furniture</option><option>Vehicle</option></select></div>
                            <div><label className="pro-label">Purchase Date</label><input type="date" className="pro-input" /></div>
                        </div>
                        <div className="pro-modal-footer"><button onClick={() => setShowAddAsset(false)} className="btn btn-secondary">Cancel</button><button onClick={() => setShowAddAsset(false)} className="btn btn-primary">Add Asset</button></div>
                    </div>
                </div>
            )}

            {/* Add Announcement Modal */}
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

            {/* New Clearance Modal */}
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

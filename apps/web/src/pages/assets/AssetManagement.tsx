import { useState } from 'react';
import { Package, Laptop, Wrench, AlertTriangle, Plus, X, Star, Megaphone } from 'lucide-react';

type Tab = 'inventory' | 'evaluation' | 'announcements';

const AssetManagement = () => {
    const [activeTab, setActiveTab] = useState<Tab>('inventory');
    const [showAddAsset, setShowAddAsset] = useState(false);
    const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);

    const tabs = [
        { id: 'inventory' as Tab, label: 'Asset Inventory', icon: Package },
        { id: 'evaluation' as Tab, label: 'Performance Evaluation', icon: Star },
        { id: 'announcements' as Tab, label: 'Announcement Board', icon: Megaphone },
    ];

    const statCards = [
        { label: 'Total Assets', value: 850, icon: Package, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'In Use', value: 720, icon: Laptop, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { label: 'Under Maintenance', value: 45, icon: Wrench, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Needs Replacement', value: 15, icon: AlertTriangle, gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
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

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Asset Management</h1>
                <p>Track company assets, performance evaluations, and announcements</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, i) => (
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
        </div>
    );
};

export default AssetManagement;

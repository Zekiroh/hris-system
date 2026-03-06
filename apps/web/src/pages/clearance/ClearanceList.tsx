import { Search, Eye, CheckCircle, XCircle, Clock, MoreVertical, Edit, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

const ClearanceList = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved'>('All');

    const clearances = [
        { id: 1, name: 'Dela Cruz, Juan', position: 'Admin Officer', purpose: 'Retirement', status: 'Pending', date: '2024-09-10' },
        { id: 2, name: 'Santos, Maria', position: 'Project Manager', purpose: 'Transfer', status: 'Approved', date: '2024-09-08' },
        { id: 3, name: 'Reyes, Jose', position: 'Tech Assistant', purpose: 'Resignation', status: 'Rejected', date: '2024-09-05' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = (id: number) => setActiveMenu(activeMenu === id ? null : id);

    const statusBadge: Record<string, string> = {
        Approved: 'badge-success',
        Rejected: 'badge-danger',
        Pending: 'badge-warning',
    };

    const statusIcon: Record<string, JSX.Element> = {
        Approved: <CheckCircle size={12} />,
        Rejected: <XCircle size={12} />,
        Pending: <Clock size={12} />,
    };

    const statCards = [
        { label: 'Total Requests', value: clearances.length, gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { label: 'Pending', value: clearances.filter(c => c.status === 'Pending').length, gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { label: 'Approved', value: clearances.filter(c => c.status === 'Approved').length, gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
    ];

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up flex items-start justify-between">
                <div>
                    <h1>Clearance Requests</h1>
                    <p>Manage employee clearance processing</p>
                </div>
                <button className="btn btn-primary"><Plus className="w-4 h-4" /> New Request</button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-4">
                {statCards.map((card, i) => (
                    <div key={card.label} className="stat-card animate-fade-in-up" style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                        <div className="relative z-10">
                            <p className="stat-label">{card.label}</p>
                            <p className="stat-value">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-wrap gap-3">
                    <div className="pro-tabs !border-none !p-0">
                        {(['All', 'Pending', 'Approved'] as const).map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`pro-tab ${filter === f ? 'active' : ''}`}>{f}</button>
                        ))}
                    </div>
                    <div className="relative">
                        <input type="text" placeholder="Search..." className="pro-input !w-56 !pl-9 !py-2" />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="pro-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Purpose</th>
                                <th>Date Filed</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clearances
                                .filter(item => filter === 'All' ? true : item.status === filter)
                                .map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">
                                                    {item.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">{item.name}</div>
                                                    <div className="text-xs text-gray-400">{item.position}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{item.purpose}</td>
                                        <td>{item.date}</td>
                                        <td>
                                            <span className={`badge ${statusBadge[item.status] || 'badge-neutral'}`}>
                                                {statusIcon[item.status]}{item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex justify-end gap-1 relative">
                                                <button onClick={() => navigate('/dashboard/clearance/1')} className="btn-ghost btn-icon text-emerald-500 hover:bg-emerald-50" title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                <div className="relative">
                                                    <button onClick={(e) => { e.stopPropagation(); toggleMenu(item.id); }} className="btn-ghost btn-icon text-gray-400">
                                                        <MoreVertical size={16} />
                                                    </button>
                                                    {activeMenu === item.id && (
                                                        <div ref={menuRef} className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl z-50 border border-gray-100 py-1">
                                                            <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2" onClick={() => setActiveMenu(null)}>
                                                                <Edit size={14} /> Edit
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClearanceList;

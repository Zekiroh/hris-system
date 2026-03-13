import { Search, UserPlus, Shield, Filter, Download, Edit, EyeOff, Ban, MoreVertical, X, Check, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const UserManagement = () => {
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState(''); // Added search state

    // 1. Move users to state to allow modifications
    const [users, setUsers] = useState([
        { id: 1, name: 'Juan Dela Cruz', email: 'juan.delacruz@pdea.gov.ph', role: 'Administrator', status: 'Active', lastActive: '2 mins ago', hidden: false },
        { id: 2, name: 'Maria Santos', email: 'maria.santos@pdea.gov.ph', role: 'HR Manager', status: 'Active', lastActive: '1 hour ago', hidden: false },
        { id: 3, name: 'Jose Reyes', email: 'jose.reyes@pdea.gov.ph', role: 'Regional Director', status: 'Inactive', lastActive: '2 days ago', hidden: false },
        { id: 4, name: 'Ana Garcia', email: 'ana.garcia@pdea.gov.ph', role: 'Staff', status: 'Active', lastActive: '5 mins ago', hidden: false },
    ]);

    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        id: 0,
        name: '',
        email: '',
        role: 'Staff',
        status: 'Active'
    });

    // Handle clicking outside the 3-dots menu to close it reliably
    useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const toggleMenu = (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); // Prevents the document click listener from firing immediately
        setActiveMenu(activeMenu === id ? null : id);
    };

    // --- Action Handlers ---

    const handleAddClick = () => {
        setFormData({ id: 0, name: '', email: '', role: 'Staff', status: 'Active' });
        setShowAddModal(true);
    };

    const handleSaveAdd = () => {
        if (!formData.name || !formData.email) {
            alert("Name and email are required.");
            return;
        }
        const newUser = {
            ...formData,
            id: Date.now(),
            lastActive: 'Just now',
            hidden: false
        };
        setUsers([newUser, ...users]);
        setShowAddModal(false);
    };

    const handleEditClick = (user: any) => {
        setFormData({ ...user });
        setShowEditModal(true);
        setActiveMenu(null);
    };

    const handleSaveEdit = () => {
        setUsers(users.map(u => u.id === formData.id ? { ...u, ...formData } : u));
        setShowEditModal(false);
    };

    const handleHide = (id: number) => {
        if (window.confirm("Are you sure you want to hide this user from the list?")) {
            setUsers(users.map(u => u.id === id ? { ...u, hidden: true } : u));
        }
        setActiveMenu(null);
    };

    const handleBlock = (id: number) => {
        if (window.confirm("Are you sure you want to block this user?")) {
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Blocked' } : u));
        }
        setActiveMenu(null);
    };

    const handleUnblock = (id: number) => {
        if (window.confirm("Are you sure you want to unblock this user?")) {
            setUsers(users.map(u => u.id === id ? { ...u, status: 'Active' } : u));
        }
        setActiveMenu(null);
    };

    // Helper for matching status badges
    const getStatusBadge = (status: string) => {
        if (status === 'Active') return 'badge-success';
        if (status === 'Blocked') return 'badge-danger';
        return 'badge-neutral';
    };

    // --- Search Filter Logic ---
    const filteredUsers = users.filter(user => {
        // Skip hidden users
        if (user.hidden) return false;
        
        // If no search term, show all
        if (!searchTerm) return true;

        const lowerSearch = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(lowerSearch) ||
            user.email.toLowerCase().includes(lowerSearch) ||
            user.role.toLowerCase().includes(lowerSearch) ||
            user.status.toLowerCase().includes(lowerSearch)
        );
    });

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or role..."
                        className="pro-input !pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button className="btn btn-secondary flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export
                    </button>
                    <button onClick={handleAddClick} className="btn btn-primary flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Add User
                    </button>
                </div>
            </div>

            <div className="overflow-visible rounded-xl border border-gray-100 min-h-[300px]">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Active</th>
                            <th className="text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td className="!font-medium !text-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600 shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight">{user.name}</p>
                                                <p className="text-[10px] text-gray-500 leading-tight">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                            <Shield className="w-3.5 h-3.5 text-gray-400" />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(user.status)}`}>
                                            <span className="badge-dot" />{user.status}
                                        </span>
                                    </td>
                                    <td>{user.lastActive}</td>
                                    <td className="!pr-6">
                                        <div className="relative flex justify-end">
                                            <button
                                                onClick={(e) => toggleMenu(e, user.id)}
                                                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                <MoreVertical className="w-4 h-4" />
                                            </button>

                                            {/* Dropdown Menu */}
                                            {activeMenu === user.id && (
                                                <div
                                                    onClick={(e) => e.stopPropagation()} 
                                                    className="absolute right-0 top-8 mt-1 w-36 bg-white rounded-xl shadow-xl z-[100] border border-gray-100 py-1 overflow-hidden animate-in fade-in zoom-in duration-200"
                                                >
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                        onClick={() => handleEditClick(user)}
                                                    >
                                                        <Edit className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                        onClick={() => handleHide(user.id)}
                                                    >
                                                        <EyeOff className="w-3.5 h-3.5" /> Hide
                                                    </button>
                                                    
                                                    {user.status === 'Blocked' ? (
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                                                            onClick={() => handleUnblock(user.id)}
                                                        >
                                                            <CheckCircle className="w-3.5 h-3.5" /> Unblock
                                                        </button>
                                                    ) : (
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors border-t border-gray-50"
                                                            onClick={() => handleBlock(user.id)}
                                                        >
                                                            <Ban className="w-3.5 h-3.5" /> Block
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500 italic">
                                    {searchTerm ? 'No users match your search.' : 'No users available.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal - Teleported to document.body */}
            {showAddModal && createPortal(
                <div className="pro-modal-overlay z-[200]">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100 pb-4">
                            <h3>Add New User</h3>
                            <button onClick={() => setShowAddModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4 pt-4">
                            <div>
                                <label className="pro-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="pro-input" 
                                    placeholder="e.g. Juan Dela Cruz"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="pro-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="pro-input" 
                                    placeholder="e.g. email@pdea.gov.ph"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Role</label>
                                    <select 
                                        className="pro-select"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Regional Director">Regional Director</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pro-label">Status</label>
                                    <select 
                                        className="pro-select"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSaveAdd} className="btn btn-primary flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Create User
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Edit User Modal - Teleported to document.body */}
            {showEditModal && createPortal(
                <div className="pro-modal-overlay z-[200]">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100 pb-4">
                            <h3>Edit User</h3>
                            <button onClick={() => setShowEditModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4 pt-4">
                            <div>
                                <label className="pro-label">Full Name</label>
                                <input 
                                    type="text" 
                                    className="pro-input" 
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="pro-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="pro-input" 
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="pro-label">Role</label>
                                    <select 
                                        className="pro-select"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Staff">Staff</option>
                                        <option value="HR Manager">HR Manager</option>
                                        <option value="Regional Director">Regional Director</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="pro-label">Status</label>
                                    <select 
                                        className="pro-select"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        <option value="Blocked">Blocked</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pro-modal-footer">
                            <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSaveEdit} className="btn btn-primary flex items-center gap-2">
                                <Check className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default UserManagement;
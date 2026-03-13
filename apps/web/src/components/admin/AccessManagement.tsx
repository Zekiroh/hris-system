import { Fragment, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Check, ShieldCheck } from 'lucide-react';

const AccessManagement = () => {
    // Modules Configuration (Static layout)
    const modules = [
        { name: 'Dashboard', permissions: ['View'] },
        { name: 'Personal Records', permissions: ['View', 'Create', 'Update', 'Archive'] },
        { name: 'Attendance', permissions: ['View', 'Update', 'Approve'] },
        { name: 'Clearance', permissions: ['View', 'Create', 'Approve'] },
        { name: 'Regional Offices', permissions: ['View'] },
        { name: 'Admin Settings', permissions: ['View', 'Manage Users'] },
    ];

    // 1. Manage Roles State
    const [roles, setRoles] = useState(['Administrator', 'HR Manager', 'Regional Director', 'Staff']);
    
    // 2. Manage Permissions State
    // We store permissions in a Record dictionary using a key like "Dashboard-View-Staff"
    const [permissions, setPermissions] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        modules.forEach(mod => {
            mod.permissions.forEach(perm => {
                roles.forEach(role => {
                    const key = `${mod.name}-${perm}-${role}`;
                    // Default logic: Admin gets everything, HR gets everything except Manage Users
                    initialState[key] = role === 'Administrator' || (role === 'HR Manager' && perm !== 'Manage Users');
                });
            });
        });
        return initialState;
    });

    // Modal States
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    // --- Action Handlers ---

    // Toggle a specific permission checkbox
    const handleTogglePermission = (moduleName: string, permName: string, roleName: string) => {
        const key = `${moduleName}-${permName}-${roleName}`;
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Save changes notification
    const handleSaveChanges = () => {
        // In a real app, you would make an API call here with the `permissions` object.
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    // Add a new role
    const handleAddRole = () => {
        if (!newRole.trim()) return;
        if (roles.includes(newRole.trim())) {
            alert("This role already exists!");
            return;
        }
        
        const updatedRoles = [...roles, newRole.trim()];
        setRoles(updatedRoles);
        
        // Initialize permissions for the new role as false
        const newPerms = { ...permissions };
        modules.forEach(mod => {
            mod.permissions.forEach(perm => {
                newPerms[`${mod.name}-${perm}-${newRole.trim()}`] = false;
            });
        });
        setPermissions(newPerms);
        setNewRole('');
    };

    // Delete a role
    const handleDeleteRole = (roleToDelete: string) => {
        if (roleToDelete === 'Administrator') {
            alert("You cannot delete the Administrator role.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete the ${roleToDelete} role?`)) {
            setRoles(roles.filter(r => r !== roleToDelete));
            
            // Clean up permissions map
            const newPerms = { ...permissions };
            Object.keys(newPerms).forEach(key => {
                if (key.endsWith(`-${roleToDelete}`)) {
                    delete newPerms[key];
                }
            });
            setPermissions(newPerms);
        }
    };

    return (
        <div className="space-y-6 relative">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Access Management</h2>
                <div className="flex items-center gap-3">
                    {saveSuccess && (
                        <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                            <Check className="w-4 h-4" /> Saved Successfully!
                        </span>
                    )}
                    <button onClick={() => setShowRoleModal(true)} className="btn btn-secondary flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Manage Roles
                    </button>
                </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th className="text-left w-64">Module / Permission</th>
                            {roles.map(role => (
                                <th key={role} className="text-center whitespace-nowrap px-4">{role}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((module) => (
                            <Fragment key={module.name}>
                                <tr className="bg-gray-50/80">
                                    <td className="!font-bold !text-gray-800 uppercase text-xs tracking-wider" colSpan={roles.length + 1}>
                                        {module.name}
                                    </td>
                                </tr>
                                {module.permissions.map(perm => (
                                    <tr key={`${module.name}-${perm}`}>
                                        <td className="pl-10 text-gray-600">
                                            {perm}
                                        </td>
                                        {roles.map(role => {
                                            const key = `${module.name}-${perm}-${role}`;
                                            return (
                                                <td key={key} className="text-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                                        checked={permissions[key] || false}
                                                        onChange={() => handleTogglePermission(module.name, perm, role)}
                                                        disabled={role === 'Administrator'} // Admins usually can't have permissions revoked
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Save Button Container */}
            <div className="flex justify-end pt-4">
                <button onClick={handleSaveChanges} className="btn btn-primary shadow-sm flex items-center gap-2">
                    <Check className="w-4 h-4" /> Save Changes
                </button>
            </div>

            {/* Manage Roles Modal - Teleported to Body */}
            {showRoleModal && createPortal(
                <div className="pro-modal-overlay z-[200]">
                    <div className="pro-modal max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="pro-modal-header border-b border-gray-100 pb-4">
                            <h3>Manage Roles</h3>
                            <button onClick={() => setShowRoleModal(false)} className="btn-ghost btn-icon"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>
                        <div className="pro-modal-body space-y-4 pt-4">
                            
                            {/* Add New Role Input */}
                            <div>
                                <label className="pro-label">Add New Role</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="pro-input flex-1" 
                                        placeholder="e.g. Finance Manager"
                                        value={newRole}
                                        onChange={e => setNewRole(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddRole()}
                                    />
                                    <button onClick={handleAddRole} className="btn btn-primary px-3">
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Existing Roles List */}
                            <div className="mt-6">
                                <label className="pro-label mb-2">Existing Roles</label>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    {roles.map((role) => (
                                        <div key={role} className="flex items-center justify-between px-4 py-3 bg-white">
                                            <span className="text-sm font-medium text-gray-700">{role}</span>
                                            {role !== 'Administrator' && (
                                                <button 
                                                    onClick={() => handleDeleteRole(role)}
                                                    className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                                                    title="Delete Role"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                        </div>
                        <div className="pro-modal-footer mt-2">
                            <button onClick={() => setShowRoleModal(false)} className="btn btn-secondary w-full">Done</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AccessManagement;
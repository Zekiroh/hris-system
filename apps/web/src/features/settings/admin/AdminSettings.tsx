import { useMemo, useState } from 'react';
import { Users, Shield, Activity, Check, ShieldCheck, User } from 'lucide-react';
import AdminProfile from './AdminProfile';
import { useAuth } from '../../../app/auth/useAuth';
import UserManagement from '../../iam/user-management/UserManagement';
import AccessManagement from '../../iam/access-management/AccessManagement';
import ActivityLog from './activity-log/ActivityLog';

type AdminSettingsTab = 'users' | 'access' | 'logs'| 'profile';

const AdminSettings = () => {
    const { user } = useAuth();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const tabs = useMemo(
        () => [
            { id: 'profile' as const, label: 'Profile', icon: User },
            { id: 'users' as const, label: 'User Management', icon: Users },
            ...(isSuperAdmin
                ? [{ id: 'access' as const, label: 'Access Management', icon: Shield }]
                : []),
            { id: 'logs' as const, label: 'Activity Log', icon: Activity },
            
        ],
        [isSuperAdmin]
    );

    const [activeTab, setActiveTab] = useState<AdminSettingsTab>(() => {
    const saved = localStorage.getItem(`admin-settings.activeTab.${user?.id}`);
    return (saved as AdminSettingsTab) ?? 'profile';
});
    const [accessRoleModalOpen, setAccessRoleModalOpen] = useState(false);
    const [accessSaveSuccess, setAccessSaveSuccess] = useState(false);

    const safeActiveTab: AdminSettingsTab =
        !isSuperAdmin && activeTab === 'access' ? 'users' : activeTab;

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Admin Settings</h1>
                <p>Manage users, access control, and system logs</p>
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="px-6 pt-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="pro-tabs">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => { setActiveTab(tab.id); localStorage.setItem(`admin-settings.activeTab.${user?.id}`, tab.id); }}
                                    className={`pro-tab flex items-center gap-2 ${safeActiveTab === tab.id ? 'active' : ''}`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {safeActiveTab === 'access' && isSuperAdmin && (
                            <div className="flex items-center gap-3 shrink-0">
                                {accessSaveSuccess && (
                                    <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                                        <Check className="w-4 h-4" /> Saved Successfully!
                                    </span>
                                )}

                                <button
                                    onClick={() => setAccessRoleModalOpen(true)}
                                    className="btn btn-secondary flex items-center gap-2"
                                    type="button"
                                >
                                    <ShieldCheck className="w-4 h-4" /> Manage Roles
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6">
                    {safeActiveTab === 'users' && <UserManagement />}
                    {safeActiveTab === 'access' && isSuperAdmin && (
                        <AccessManagement
                            showRoleModal={accessRoleModalOpen}
                            setShowRoleModal={setAccessRoleModalOpen}
                            onSaveSuccess={() => {
                                setAccessSaveSuccess(true);
                                window.setTimeout(() => setAccessSaveSuccess(false), 3000);
                            }}
                        />
                    )}
                    {safeActiveTab === 'logs' && <ActivityLog />}
                    {safeActiveTab === 'profile' && <AdminProfile />}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
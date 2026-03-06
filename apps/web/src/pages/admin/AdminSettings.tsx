import { useState } from 'react';
import { Users, Shield, Activity } from 'lucide-react';
import UserManagement from '../../components/admin/UserManagement';
import AccessManagement from '../../components/admin/AccessManagement';
import ActivityLog from '../../components/admin/ActivityLog';

const AdminSettings = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'access' | 'logs'>('users');

    const tabs = [
        { id: 'users' as const, label: 'User Management', icon: Users },
        { id: 'access' as const, label: 'Access Management', icon: Shield },
        { id: 'logs' as const, label: 'Activity Log', icon: Activity },
    ];

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Admin Settings</h1>
                <p>Manage users, access control, and system logs</p>
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
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
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'access' && <AccessManagement />}
                    {activeTab === 'logs' && <ActivityLog />}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;

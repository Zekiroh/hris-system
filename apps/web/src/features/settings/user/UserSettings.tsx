import { useState } from 'react';
import {
    User, Lock, Activity, FileText
} from 'lucide-react';
import { useAuth } from '../../../app/auth/AuthContext';
import ProfileTab from './ProfileTab';
import SecurityTab from '../../../components/user/settings/SecurityTab';
import DocumentsTab from '../../../components/user/settings/DocumentsTab';
import ActivityLogTab from '../../../components/user/settings/ActivityLogTab';
import ConfirmModal from '../../../components/user/settings/ConfirmModal';



type SettingsTab = 'profile' | 'security' | 'documents' | 'logs';

const tabs = [
    { id: 'profile'   as const, label: 'Profile',            icon: User     },
    { id: 'security'  as const, label: 'Account & Security', icon: Lock     },
    { id: 'documents' as const, label: 'Documents',          icon: FileText },
    { id: 'logs'      as const, label: 'Activity Log',       icon: Activity },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const UserSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>(() => {
        const saved = localStorage.getItem(`settings.activeTab.${user?.id}`);
        return (saved as SettingsTab) ?? 'profile';
    });
    const [logRefreshKey,  setLogRefreshKey]  = useState(0);

    const triggerLogRefresh = () => setLogRefreshKey(k => k + 1);

    return (
        <div className="space-y-6">
            <div className="page-header animate-fade-in-up">
                <h1>Settings</h1>
                <p>Manage your profile, account security, and activity</p>
            </div>

            <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="px-6 pt-4 flex">
                    <div className="overflow-x-auto scrollbar-none">
                        <div className="pro-tabs">
                            {tabs.map(tab => (
                                <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); localStorage.setItem(`settings.activeTab.${user?.id}`, tab.id); }}
                                    className={`pro-tab flex items-center gap-2 whitespace-nowrap shrink-0 w-auto !flex-none` + (activeTab === tab.id ? ' active' : '')}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className={activeTab === 'profile'   ? '' : 'hidden'}><ProfileTab  user={user} onSaved={triggerLogRefresh} ConfirmModal={ConfirmModal} /></div>
                    <div className={activeTab === 'security'  ? '' : 'hidden'}><SecurityTab user={user} onSaved={triggerLogRefresh} ConfirmModal={ConfirmModal} /></div>
                    <div className={activeTab === 'documents' ? '' : 'hidden'}><DocumentsTab onSaved={triggerLogRefresh} ConfirmModal={ConfirmModal} /></div>
                    <div className={activeTab === 'logs'      ? '' : 'hidden'}><ActivityLogTab refreshKey={logRefreshKey} /></div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
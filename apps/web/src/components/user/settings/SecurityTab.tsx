import { useState, useEffect, type ChangeEvent, type ComponentType, type ReactNode } from 'react';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createActivityLog } from '../../../lib/activityLogs';
import { apiRequest } from '../../../lib/api';
import GovernmentInfoSection from './GovernmentInfoSection';

type ConfirmModalProps = {
    title:    string;
    message:  ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
};

type SecurityTabUser = {
    role?: string | null;
} | null | undefined;

type EmployeeMeResponse = {
    employeeNumber?: string | null;
    dateHired?: string | null;
};

const SecurityTab = ({
    user,
    onSaved,
    ConfirmModal,
}: {
    user: SecurityTabUser;
    onSaved?: () => void;
    ConfirmModal: ComponentType<ConfirmModalProps>;
}) => {
    const [showCurrent,    setShowCurrent]    = useState(false);
    const [showNew,        setShowNew]        = useState(false);
    const [showConfirm,    setShowConfirm]    = useState(false);
    const [passwords,      setPasswords]      = useState({ current: '', newPass: '', confirm: '' });
    const [error,          setError]          = useState('');
    const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
    const [hiredDate,      setHiredDate]      = useState<string | null>(null);
    const [confirmOpen,    setConfirmOpen]    = useState(false);

    useEffect(() => {
        const fetchEmployeeNumber = async () => {
            try {
                const data = await apiRequest<EmployeeMeResponse>('/employees/me');
                setEmployeeNumber(data.employeeNumber ?? null);
setHiredDate(data.dateHired ? new Date(data.dateHired).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null);
            } catch {
                setEmployeeNumber(null);
            }
        };
        void fetchEmployeeNumber();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSave = () => {
        if (!passwords.current)                      { setError('Please enter your current password.'); return; }
        if (passwords.newPass !== passwords.confirm) { setError('New passwords do not match.'); return; }
        if (passwords.newPass.length < 8)            { setError('Password must be at least 8 characters.'); return; }
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        try {
            await apiRequest('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    currentPassword: passwords.current,
                    newPassword:     passwords.newPass,
                }),
            });

            setPasswords({ current: '', newPass: '', confirm: '' });
            setError('');
            toast.success('Password updated successfully.');
            void createActivityLog({
                action: 'PASSWORD_CHANGED',
                module: 'SECURITY',
                summary: 'User changed their password.',
            });
            onSaved?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : '';
            if (message.toLowerCase().includes('incorrect')) {
                setError('Current password is incorrect.');
            } else {
                setError('Failed to update password. Please try again.');
            }
        }
    };

    return (
        <div className="space-y-6">
            {confirmOpen && (
                <ConfirmModal
                    title="Update password?"
                    message="Are you sure you want to change your password?"
                    onConfirm={handleConfirmSave}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}

            {/* ── Government Information (secure) ── */}
            <GovernmentInfoSection onSaved={onSaved} />

            <div className="border-t border-gray-100" />

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account information</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                        <input value={employeeNumber ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hired date</label>
                        <input value={hiredDate ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <input value={user?.role ?? '—'} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-green-500 font-semibold text-sm border-0 outline-none cursor-default select-none" />
                    </div>
                    <div>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Change password</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Current password</label>
                        <div className="relative">
                            <input name="current" type={showCurrent ? 'text' : 'password'}
                                value={passwords.current} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Enter current password" />
                            <button type="button" onClick={() => setShowCurrent(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">New password</label>
                        <div className="relative">
                            <input name="newPass" type={showNew ? 'text' : 'password'}
                                value={passwords.newPass} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Min. 8 characters" />
                            <button type="button" onClick={() => setShowNew(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Confirm new password</label>
                        <div className="relative">
                            <input name="confirm" type={showConfirm ? 'text' : 'password'}
                                value={passwords.confirm} onChange={handleChange}
                                className="pro-input w-full pr-10" placeholder="Repeat new password" />
                            <button type="button" onClick={() => setShowConfirm(v => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="mt-3 text-sm text-rose-600 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </p>
                )}

                <div className="flex items-center gap-3 mt-4">
                    <button onClick={handleSave} className="btn btn-primary flex items-center gap-2" type="button">
                        <Check className="w-4 h-4" /> Update password
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecurityTab;

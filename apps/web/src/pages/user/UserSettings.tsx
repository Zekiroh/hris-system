import { useState, useEffect, useRef, useCallback } from 'react';
import {
    User, Lock, Activity, FileText,
    Eye, EyeOff, Check, AlertCircle,
    Upload, File, X, ShieldCheck, ShieldAlert, Pencil
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Calendar, Search } from 'lucide-react';
import { getBadgeClassName, formatActionLabel } from '../../lib/activityLog.utils';

type SettingsTab = 'profile' | 'security' | 'documents' | 'logs';

const tabs = [
    { id: 'profile'   as const, label: 'Profile',            icon: User     },
    { id: 'security'  as const, label: 'Account & Security', icon: Lock     },
    { id: 'documents' as const, label: 'Documents',          icon: FileText },
    { id: 'logs'      as const, label: 'Activity Log',       icon: Activity },
];

// ─── Masking helpers ──────────────────────────────────────────────────────────

const maskValue = (value: string): string => {
    if (!value) return '—';
    const visible = Math.min(2, value.replace(/\D/g, '').length);
    return value.slice(0, visible) + value.slice(visible).replace(/[^-\s]/g, '*');
};

// ─── Auto-hide hook ───────────────────────────────────────────────────────────

const AUTO_HIDE_MS = 10_000;

function useAutoHide(visible: boolean, hide: () => void, isEditing: boolean = false): number | null {
    const [remaining, setRemaining] = useState<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const timeoutRef  = useRef<ReturnType<typeof setTimeout>  | null>(null);

    useEffect(() => {
        if (!visible || isEditing) {
            setRemaining(null);
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current)  clearTimeout(timeoutRef.current);
            return;
        }
        setRemaining(AUTO_HIDE_MS / 1000);
        intervalRef.current = setInterval(() => {
            setRemaining(prev => (prev !== null && prev > 1 ? prev - 1 : null));
        }, 1000);
        timeoutRef.current = setTimeout(() => { hide(); }, AUTO_HIDE_MS);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current)  clearTimeout(timeoutRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    return remaining;
}

// ─── Password Verification Modal ──────────────────────────────────────────────

interface VerifyModalProps {
    onVerify: (password: string) => Promise<boolean>;
    onClose:  () => void;
}

const VerifyModal = ({ onVerify, onClose }: VerifyModalProps) => {
    const [password, setPassword] = useState('');
    const [show,     setShow]     = useState(false);
    const [error,    setError]    = useState('');

    const handleVerify = async () => {
        if (!password) { setError('Please enter your password.'); return; }
        const ok = await onVerify(password);
        if (!ok) setError('Incorrect password. Please try again.');
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleVerify();
        if (e.key === 'Escape') onClose();
    };

    return createPortal(
        <div
            className="pro-modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="pro-modal w-full max-w-sm p-6 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">Identity Verification</p>
                        <p className="text-xs text-gray-400">Enter your password to unlock sensitive data</p>
                    </div>
                </div>

                <div className="border-t border-gray-100" />

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Current password</label>
                    <div className="relative">
                        <input
                            type={show ? 'text' : 'password'}
                            value={password}
                            onChange={e => { setPassword(e.target.value); setError(''); }}
                            onKeyDown={handleKey}
                            autoFocus
                            className="pro-input w-full pr-10"
                            placeholder="Enter your password"
                        />
                        <button type="button" onClick={() => setShow(v => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-xs text-rose-600 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="btn btn-secondary text-sm">Cancel</button>
                    <button type="button" onClick={handleVerify} className="btn btn-primary flex items-center gap-2 text-sm">
                        <ShieldCheck className="w-4 h-4" /> Verify
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ─── Secure Government Field ──────────────────────────────────────────────────

interface SecureFieldProps {
    label:       string;
    value:       string;
    name:        string;
    visible:     boolean;
    onShow:      () => void;
    onHide:      () => void;
    onChange:    (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    maxLength?:  number;
    isVerified:  boolean;
    isEditing:   boolean;
}

const SecureField = ({
    label, value, name, visible,
    onShow, onHide, onChange,
    placeholder, maxLength, isVerified, isEditing,
}: SecureFieldProps) => {
    const remaining = useAutoHide(visible, onHide, isEditing);

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <div className="relative flex items-center gap-2">
                <input
                    name={name}
                    value={visible ? value : maskValue(value)}
                    onChange={onChange}
                    readOnly={!visible || !isVerified || !isEditing}
                    className={`pro-input w-full pr-10 font-mono text-sm tracking-wide ${
                        !visible || !isEditing
                            ? 'text-gray-400 bg-gray-50 cursor-default select-none'
                            : ''
                    }`}
                    placeholder={placeholder}
                    maxLength={maxLength}
                />
                {isVerified && (
                    <button
                        type="button"
                        onClick={visible ? onHide : onShow}
                        title={visible ? 'Hide' : 'Show'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                )}
            </div>
            {visible && remaining !== null && (
                <p className="mt-1 text-[11px] text-amber-600 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    Visible for {remaining}s — will hide automatically
                </p>
            )}
        </div>
    );
};

// ─── Government Information Section ──────────────────────────────────────────

type GovInfoFields = {
    sssNumber:        string;
    pagIbigNumber:    string;
    philHealthNumber: string;
    tinNumber:        string;
};

interface GovernmentInfoSectionProps {
    form:      GovInfoFields;
    onChange:  (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
}

const SESSION_EXPIRE_MS = 60_000;

const GovernmentInfoSection = ({ form, onChange, isEditing }: GovernmentInfoSectionProps) => {
    const [isVerified,     setIsVerified]     = useState(false);
    const [modalOpen,      setModalOpen]      = useState(false);
    const [showSSS,        setShowSSS]        = useState(false);
    const [showTIN,        setShowTIN]        = useState(false);
    const [showPagIbig,    setShowPagIbig]    = useState(false);
    const [showPhilHealth, setShowPhilHealth] = useState(false);

    const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const expireSession = useCallback(() => {
        setIsVerified(false);
        setShowSSS(false);
        setShowTIN(false);
        setShowPagIbig(false);
        setShowPhilHealth(false);
    }, []);

    useEffect(() => {
        if (isVerified) {
            sessionTimer.current = setTimeout(expireSession, SESSION_EXPIRE_MS);
        }
        return () => { if (sessionTimer.current) clearTimeout(sessionTimer.current); };
    }, [isVerified, expireSession]);

    useEffect(() => () => { if (sessionTimer.current) clearTimeout(sessionTimer.current); }, []);

    const handleVerify = async (password: string): Promise<boolean> => {
        if (password.length > 0) {
            setIsVerified(true);
            setModalOpen(false);
            return true;
        }
        return false;
    };

    return (
        <>
            {modalOpen && (
                <VerifyModal onVerify={handleVerify} onClose={() => setModalOpen(false)} />
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-amber-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                            <Lock className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-800">Government Information</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Sensitive government information is protected for your privacy and security.
                            </p>
                        </div>
                    </div>
                    {isVerified && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Session active
                        </span>
                    )}
                </div>

                <div className="px-5 py-4 space-y-4">
                    {!isVerified && (
                        <div className="flex items-center justify-between gap-4 py-2 px-4 rounded-lg bg-white border border-amber-100">
                            <p className="text-xs text-gray-500">
                                Your government IDs are hidden. Verify your identity to view or edit them.
                            </p>
                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="btn btn-primary flex items-center gap-2 text-xs whitespace-nowrap shrink-0"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                View Full Information
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SecureField label="SSS number"       name="sssNumber"        value={form.sssNumber}
                            visible={showSSS}        onShow={() => setShowSSS(true)}        onHide={() => setShowSSS(false)}
                            onChange={onChange} placeholder="10 digits" maxLength={12} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="Pag-IBIG number"  name="pagIbigNumber"    value={form.pagIbigNumber}
                            visible={showPagIbig}    onShow={() => setShowPagIbig(true)}    onHide={() => setShowPagIbig(false)}
                            onChange={onChange} placeholder="12 digits" maxLength={14} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="PhilHealth number" name="philHealthNumber" value={form.philHealthNumber}
                            visible={showPhilHealth} onShow={() => setShowPhilHealth(true)} onHide={() => setShowPhilHealth(false)}
                            onChange={onChange} placeholder="12 digits" maxLength={14} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="TIN number"       name="tinNumber"        value={form.tinNumber}
                            visible={showTIN}        onShow={() => setShowTIN(true)}        onHide={() => setShowTIN(false)}
                            onChange={onChange} placeholder="9 digits"  maxLength={11} isVerified={isVerified} isEditing={isEditing} />
                    </div>

                    {isVerified && !isEditing && (
                        <p className="text-[11px] text-amber-700 flex items-center gap-1.5 pt-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            Verification session expires in 1 minute. Each revealed field hides after 10 seconds.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
};

// ─── Profile Tab ──────────────────────────────────────────────────────────────

type ProfileForm = {
    fullName:         string;
    email:            string;
    contactNumber:    string;
    addressLine1:     string;
    addressLine2:     string;
    city:             string;
    province:         string;
    zipCode:          string;
    position:         string;
    employmentType:   string;
    department:       string;
    employmentStatus: string;
    sssNumber:        string;
    pagIbigNumber:    string;
    philHealthNumber: string;
    tinNumber:        string;
};

const employmentTypeOptions   = ['Regular', 'Probationary', 'Project-based'];
const employmentStatusOptions = ['Active', 'Inactive'];
const PROFILE_STORAGE_KEY     = 'settings.profileForm';

const ProfileTab = ({ user }: { user: any }) => {
    const initialForm: ProfileForm = {
        fullName:         user?.fullName         ?? '',
        email:            user?.email            ?? '',
        contactNumber:    user?.contactNumber    ?? '',
        addressLine1:     user?.addressLine1     ?? '',
        addressLine2:     user?.addressLine2     ?? '',
        city:             user?.city             ?? '',
        province:         user?.province         ?? '',
        zipCode:          user?.zipCode          ?? '',
        position:         user?.position         ?? '',
        employmentType:   user?.employmentType   ?? '',
        department:       user?.department       ?? '',
        employmentStatus: user?.employmentStatus ?? 'Active',
        sssNumber:        user?.sssNumber        ?? '',
        pagIbigNumber:    user?.pagIbigNumber    ?? '',
        philHealthNumber: user?.philHealthNumber ?? '',
        tinNumber:        user?.tinNumber        ?? '',
    };

    const [form,        setForm]        = useState<ProfileForm>(initialForm);
    const [snapshot,    setSnapshot]    = useState<ProfileForm>(initialForm);
    const [isEditing,   setIsEditing]   = useState(false);
    const [avatar,      setAvatar]      = useState<AvatarState>({ url: null });
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setAvatar({ url });
        toast.success('Profile photo updated.');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleEdit = () => {
        setSnapshot(form);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setForm(snapshot);
        setIsEditing(false);
    };

    const handleSave = () => {
        // TODO: connect to API — updateEmployee(user.employeeId, form)
        const hasChanges = JSON.stringify(form) !== JSON.stringify(snapshot);

        if (!hasChanges) {
            toast.info('No changes have been made.');
            setIsEditing(false);
            return;
        }

        sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(form));
        setSnapshot(form);
        setIsEditing(false);
        toast.success('Profile updated successfully.');
    };

    const initials = form.fullName
        ? form.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    const inputClass = isEditing
        ? 'pro-input w-full'
        : 'pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed';

    const selectClass = isEditing
        ? 'pro-input w-full'
        : 'pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed';

    return (
        <div className="space-y-8">

            {/* Avatar row + Edit / Save / Cancel */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Hidden file input */}
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                    />

                    {/* Clickable avatar */}
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Change profile photo"
                        className="relative w-24 h-24 rounded-2xl shrink-0 group overflow-hidden border border-gray-100"
                    >
                        {avatar.url ? (
                            <img
                                src={avatar.url}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold rounded-2xl">
                                {initials}
                            </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </button>

                    <div>
                        <p className="text-sm font-semibold text-gray-800">{form.fullName || '—'}</p>
                        <p className="text-xs text-gray-400">{form.position || 'No position set'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    

                    {!isEditing ? (
                        <button onClick={handleEdit} className="btn btn-secondary flex items-center gap-2" type="button">
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    ) : (
                        <>
                            <button onClick={handleCancel} className="btn btn-secondary flex items-center gap-2" type="button">
                                <X className="w-4 h-4" />
                            </button>
                            <button onClick={handleSave} className="btn btn-primary flex items-center gap-2" type="button">
                                <Check className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Personal Information ── */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Personal information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
                        <input value={form.fullName} readOnly
                            className="pro-input w-full text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                        <input value={form.email} readOnly type="email"
                            className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact number</label>
                        <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="+63 912 345 6789" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Address line 1</label>
                        <input name="addressLine1" value={form.addressLine1} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="House No., Street" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Address line 2</label>
                        <input name="addressLine2" value={form.addressLine2} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="Barangay, Subdivision (optional)" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">City / Municipality</label>
                        <input name="city" value={form.city} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="Manila" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Province</label>
                        <input name="province" value={form.province} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="Metro Manila" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Zip code</label>
                        <input name="zipCode" value={form.zipCode} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="1000" maxLength={4} />
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Employment Information ── */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Employment information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                        <input name="position" value={form.position} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="e.g. Software Engineer" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                        <input name="department" value={form.department} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="e.g. Engineering" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment type</label>
                        <select name="employmentType" value={form.employmentType} onChange={handleChange}
                            disabled={!isEditing} className={selectClass}>
                            <option value="">Select type</option>
                            {employmentTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment status</label>
                        <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange}
                            disabled={!isEditing} className={selectClass}>
                            {employmentStatusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Government Information (secure) ── */}
            <GovernmentInfoSection
                form={{
                    sssNumber:        form.sssNumber,
                    pagIbigNumber:    form.pagIbigNumber,
                    philHealthNumber: form.philHealthNumber,
                    tinNumber:        form.tinNumber,
                }}
                onChange={handleChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
                isEditing={isEditing}
            />
        </div>
    );
};

// ─── Account & Security Tab ───────────────────────────────────────────────────

const SecurityTab = ({ user }: { user: any }) => {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew,     setShowNew]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwords,   setPasswords]   = useState({ current: '', newPass: '', confirm: '' });
    const [error,       setError]       = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSave = () => {
        if (!passwords.current)                      { setError('Please enter your current password.'); return; }
        if (passwords.newPass !== passwords.confirm) { setError('New passwords do not match.'); return; }
        if (passwords.newPass.length < 8)            { setError('Password must be at least 8 characters.'); return; }

        // TODO: connect to API — changePassword(user.id, passwords.current, passwords.newPass)
        setPasswords({ current: '', newPass: '', confirm: '' });
        setError('');
        toast.success('Password updated successfully.');
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Account information</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employee ID</label>
                        <input value={user?.employeeId ?? '—'} readOnly
                            className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                        <input value={user?.username ?? user?.email ?? '—'} readOnly
                            className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                        <input value={user?.role ?? '—'} readOnly
                            className="pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                        <div className="flex items-center h-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Active
                            </span>
                        </div>
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

// ─── Documents Tab ────────────────────────────────────────────────────────────

type UploadedFile = { id: number; name: string; size: string; };
type AvatarState  = { url: string | null };

const DocumentsTab = () => {
    const [isDragging,    setIsDragging]    = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isSaved,       setIsSaved]       = useState(false);

    const formatSize = (bytes: number): string => {
        if (bytes < 1024)        return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        setUploadedFiles(prev => [
            ...prev,
            ...Array.from(files).map((f, i) => ({ id: Date.now() + i, name: f.name, size: formatSize(f.size) })),
        ]);
    };

    return (
        <div className="space-y-5">
            <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById('file-upload-input')?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                    isDragging ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                }`}
            >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">Drag and drop files here</p>
                    <p className="text-xs text-gray-400 mt-1">or <span className="text-emerald-600 font-medium">browse</span> to upload</p>
                </div>
                <p className="text-[11px] text-gray-400">PDF, JPG, PNG up to 10MB</p>
                <input id="file-upload-input" type="file" multiple className="hidden"
                    onChange={e => addFiles(e.target.files)} />
            </div>

            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500">Uploaded files</p>
                    {uploadedFiles.map(f => (
                        <div key={f.id} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                                    <File className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-700 truncate">{f.name}</p>
                                    <p className="text-xs text-gray-400">{f.size}</p>
                                </div>
                            </div>
                            <button onClick={() => setUploadedFiles(prev => prev.filter(x => x.id !== f.id))}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0" type="button">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 italic">* File upload is not yet functional. This is a placeholder.</p>
                    <button
                        type="button"
                        onClick={() => {
                            // TODO: connect to API — uploadDocuments(uploadedFiles)
                            setIsSaved(true);
                            toast.success('Documents saved successfully.');
                            setTimeout(() => setIsSaved(false), 3000);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        {isSaved ? 'Saved!' : 'Save documents'}
                    </button>
                </div>
            )}

            {uploadedFiles.length === 0 && (
                <p className="text-xs text-gray-400 italic">* Once saved, the file will be available for admin review.</p>
            )}
        </div>
    );
};

// ─── Activity Log Tab ─────────────────────────────────────────────────────────

type LogEntry = { id: number; action: string; description: string; timestamp: string; };

const mockLogs: LogEntry[] = [
    { id: 1, action: 'LOGIN',            description: 'Signed in successfully',                timestamp: 'May 29, 2026 – 9:02 AM'  },
    { id: 2, action: 'EMPLOYEE_UPDATED', description: 'Updated personal profile information',  timestamp: 'May 28, 2026 – 3:15 PM'  },
    { id: 3, action: 'USER_PASSWORD_RESET', description: 'Account password changed successfully', timestamp: 'May 20, 2026 – 11:44 AM' },
    { id: 4, action: 'LOGIN',            description: 'Signed in successfully',                timestamp: 'May 19, 2026 – 8:30 AM'  },
    { id: 5, action: 'LOGOUT',           description: 'Signed out of the account',             timestamp: 'May 18, 2026 – 5:01 PM'  },
    { id: 6, action: 'EMPLOYEE_UPDATED', description: 'Updated employment details',            timestamp: 'May 15, 2026 – 2:20 PM'  },
];

// logTypeBadge removed — now using getBadgeClassName from utils

const ActivityLogTab = () => {
    const [searchTerm,          setSearchTerm]          = useState('');
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);

    const filteredLogs = mockLogs.filter(log => {
        const [datePart, timePart] = log.timestamp.split(' – ');
        const matchesSearch =
            log.action.toLowerCase().includes(searchTerm.toLowerCase())      ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            datePart.toLowerCase().includes(searchTerm.toLowerCase())        ||
            (timePart ?? '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesToday = isTodayFilterActive
            ? log.timestamp.startsWith(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
            : true;

        return matchesSearch && matchesToday;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="pro-input !pl-9 !py-1.5 w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>

                <button
                    onClick={() => setIsTodayFilterActive(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-sm shadow-sm transition-colors ${
                        isTodayFilterActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    <Calendar size={16} className={isTodayFilterActive ? 'text-emerald-500' : 'text-gray-400'} />
                    <span className="font-medium">{isTodayFilterActive ? 'Today Only' : 'All Time'}</span>
                </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="pro-table min-w-full">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Action</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                                    No logs match your search.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map(log => {
                                const [datePart, timePart] = log.timestamp.split(' – ');
                                return (
                                    <tr key={log.id}>
                                        <td className="whitespace-nowrap !font-medium !text-gray-900">{datePart}</td>
                                        <td className="whitespace-nowrap !font-medium !text-gray-900">{timePart}</td>
                                        <td>
                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getBadgeClassName(log.action)}`}>
                                                {formatActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="text-gray-500">{log.description}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const UserSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

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
                                    onClick={() => setActiveTab(tab.id)}
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
                    {activeTab === 'profile'   && <ProfileTab  user={user} />}
                    {activeTab === 'security'  && <SecurityTab user={user} />}
                    {activeTab === 'documents' && <DocumentsTab />}
                    {activeTab === 'logs'      && <ActivityLogTab />}
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
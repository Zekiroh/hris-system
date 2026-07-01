import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    User, Lock, Activity, FileText,
    Eye, EyeOff, Check, AlertCircle,
    Upload, File, X, ShieldCheck, ShieldAlert, Pencil
} from 'lucide-react';
import { useMyDocuments } from '../personal-records/hooks/useMyDocuments';
import { EmployeeDocumentsPanel, DocumentTypeDropdown } from '../../components/personal-records/EmployeeDocumentsPanel';
import { EMPLOYEE_DOCUMENT_TYPES, type EmployeeDocumentType } from '../../lib/employees';
import { useAuth } from '../../context/AuthContext';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Calendar, Search } from 'lucide-react';
import { getBadgeClassName, formatActionLabel, formatDatePart, formatTimePart, formatDateFilterPart } from '../../lib/activityLog.utils';
import { getUserActivityLogs, createActivityLog, type ActivityLogItemDto } from '../../lib/activityLogs';
import { apiRequest } from '../../lib/api';
import { DropdownMenu, PROVINCE_OPTIONS } from '../../components/personal-records/EmployeeFormFields';
import { LOCATION_OPTIONS } from '../../components/personal-records/locationOptions';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';
import { readAvatarFileAsDataUrl, setStoredAvatarUrl } from '../../lib/avatar';



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

// ─── Gov ID format helpers ────────────────────────────────────────────────────

type GovFormat = {
    groups:    number[];
    separator: string;
};

const GOV_FORMATS: Record<string, GovFormat> = {
    sssNumber:        { groups: [2, 7, 1], separator: '-' },
    philHealthNumber: { groups: [2, 9, 1], separator: '-' },
    pagIbigNumber:    { groups: [4, 4, 4], separator: '-' },
    tinNumber:        { groups: [3, 3, 3], separator: '-' },
};

// ─── Phone format helper ──────────────────────────────────────────────────────

function formatContactNumber(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
}

function applyGovFormat(raw: string, format: GovFormat): string {
    const digits = raw.replace(/\D/g, '');
    const { groups, separator } = format;
    let result = '';
    let idx = 0;
    for (let g = 0; g < groups.length; g++) {
        const chunk = digits.slice(idx, idx + groups[g]);
        if (!chunk) break;
        result += (g > 0 ? separator : '') + chunk;
        idx += groups[g];
    }
    return result;
}

function getTotalDigits(format: GovFormat): number {
    return format.groups.reduce((a, b) => a + b, 0);
}

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
    }, [visible, isEditing]);

    return remaining;
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    title:    string;
    message:  React.ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
}

const ConfirmModal = ({ title, message, onConfirm, onCancel }: ConfirmModalProps) => {
    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') onConfirm();
        if (e.key === 'Escape') onCancel();
    };

    return createPortal(
        <div
            className="pro-modal-overlay"
            onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
            onKeyDown={handleKey}
        >
            <div className="pro-modal w-full max-w-sm p-6 space-y-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{title}</p>
                        <p className="text-xs text-gray-400">{message}</p>
                    </div>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onCancel} className="btn btn-secondary text-sm">Cancel</button>
                    <button type="button" onClick={onConfirm} className="btn btn-primary flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" /> Yes, save
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

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

    const fmt            = GOV_FORMATS[name];
    const formattedValue = fmt ? applyGovFormat(value, fmt) : value;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!fmt) { onChange(e); return; }
        const formatted = applyGovFormat(e.target.value, fmt);
        onChange({ ...e, target: { ...e.target, name, value: formatted } });
    };

    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
            <div className="relative flex items-center gap-2">
                <input
                    name={name}
                    value={visible ? formattedValue : maskValue(formattedValue)}
                    onChange={handleChange}
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
    onSaved?: () => void;
}

const SESSION_EXPIRE_MS = 60_000;

const GovernmentInfoSection = ({ onSaved }: GovernmentInfoSectionProps) => {
    const [isVerified,     setIsVerified]     = useState(false);
    const [isEditing,      setIsEditing]      = useState(false);
    const [confirmOpen,    setConfirmOpen]    = useState(false);
    const [modalOpen,      setModalOpen]      = useState(false);
    const [showSSS,        setShowSSS]        = useState(false);
    const [showTIN,        setShowTIN]        = useState(false);
    const [showPagIbig,    setShowPagIbig]    = useState(false);
    const [showPhilHealth, setShowPhilHealth] = useState(false);

    const [form,     setForm]     = useState<GovInfoFields>({ sssNumber: '', pagIbigNumber: '', philHealthNumber: '', tinNumber: '' });
    const [snapshot, setSnapshot] = useState<GovInfoFields>({ sssNumber: '', pagIbigNumber: '', philHealthNumber: '', tinNumber: '' });

    const sessionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const fetchGovInfo = async () => {
            try {
                const data = await apiRequest<any>('/employees/me');
                const loaded: GovInfoFields = {
                    sssNumber:        data.sssNumber        ?? '',
                    pagIbigNumber:    data.pagIbigNumber    ?? '',
                    philHealthNumber: data.philHealthNumber ?? '',
                    tinNumber:        data.tinNumber        ?? '',
                };
                setForm(loaded);
                setSnapshot(loaded);
            } catch {
                // keep empty
            }
        };
        void fetchGovInfo();
    }, []);

    const expireSession = useCallback(() => {
        setIsVerified(false);
        setIsEditing(false);
        setShowSSS(false);
        setShowTIN(false);
        setShowPagIbig(false);
        setShowPhilHealth(false);
    }, []);

    useEffect(() => {
        if (isVerified && !isEditing) {
            sessionTimer.current = setTimeout(expireSession, SESSION_EXPIRE_MS);
        } else {
            if (sessionTimer.current) clearTimeout(sessionTimer.current);
        }
        return () => { if (sessionTimer.current) clearTimeout(sessionTimer.current); };
    }, [isVerified, isEditing, expireSession]);

    useEffect(() => () => { if (sessionTimer.current) clearTimeout(sessionTimer.current); }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
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
        const hasChanges = JSON.stringify(form) !== JSON.stringify(snapshot);
        if (!hasChanges) {
            toast.info('No changes have been made.');
            setIsEditing(false);
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        try {
            const existing = await apiRequest<any>('/employees/me');

            const nameParts = (existing.fullName ?? '').split(' ');
            const firstName = existing.firstName || nameParts[0] || '';
            const lastName  = existing.lastName  || nameParts.slice(-1)[0] || '';

            await apiRequest('/employees/me', {
                method: 'PUT',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    employmentType:   existing.employmentType   || 'Regular',
                    department:       existing.department       || null,
                    position:         existing.position         || null,
                    contactNumber:    existing.contactNumber    || null,
                    addressLine1:     existing.addressLine1     || null,
                    addressLine2:     existing.addressLine2     || null,
                    city:             existing.city             || null,
                    province:         existing.province         || null,
                    zipCode:          existing.zipCode          || null,
                    isActive:         existing.isActive         ?? true,
                    sssNumber:        form.sssNumber        ? form.sssNumber.replace(/\D/g, '')        : null,
                    philHealthNumber: form.philHealthNumber ? form.philHealthNumber.replace(/\D/g, '') : null,
                    pagIbigNumber:    form.pagIbigNumber    ? form.pagIbigNumber.replace(/\D/g, '')    : null,
                    tinNumber:        form.tinNumber        ? form.tinNumber.replace(/\D/g, '')        : null,
                }),
            });
            setSnapshot(form);
            setIsEditing(false);
            toast.success('Government information updated.');
            void createActivityLog({
                action: 'PROFILE_UPDATED',
                module: 'PROFILE',
                summary: 'User updated their government information.',
            });
            onSaved?.();
        } catch (err: any) {
            console.error('Gov save error:', err);
            toast.error(err?.message ?? 'Failed to save. Please try again.');
        }
    };

    const handleVerify = async (password: string): Promise<boolean> => {
        try {
            await apiRequest('/auth/verify-password', {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            setIsVerified(true);
            setModalOpen(false);
            return true;
        } catch {
            return false;
        }
    };

    return (
        <>
            {modalOpen && (
                <VerifyModal onVerify={handleVerify} onClose={() => setModalOpen(false)} />
            )}

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-amber-100 space-y-3">
                    {/* Row 1: lock icon + Edit button (mobile) / lock icon + title + Edit button (desktop) */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-sm font-semibold text-gray-800">Government Information</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Sensitive government information is protected for your privacy and security.
                                </p>
                            </div>
                        </div>
                        {isVerified && (
                            <div className="flex sm:hidden items-center gap-2 shrink-0">
                                {!isEditing ? (
                                    <button onClick={handleEdit} className="btn btn-secondary flex items-center gap-2 text-xs" type="button">
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleCancel} className="btn btn-secondary flex items-center gap-2 text-xs" type="button">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={handleSave} className="btn btn-primary flex items-center gap-2 text-xs" type="button">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                        {isVerified && (
                            <div className="hidden sm:flex items-center gap-2 shrink-0">
                                {!isEditing ? (
                                    <button onClick={handleEdit} className="btn btn-secondary flex items-center gap-2 text-xs" type="button">
                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                    </button>
                                ) : (
                                    <>
                                        <button onClick={handleCancel} className="btn btn-secondary flex items-center gap-2 text-xs" type="button">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={handleSave} className="btn btn-primary flex items-center gap-2 text-xs" type="button">
                                            <Check className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Row 2: title + description (mobile only) */}
                    <div className="sm:hidden">
                        <p className="text-sm font-semibold text-gray-800">Government Information</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Sensitive government information is protected for your privacy and security.
                        </p>
                    </div>
                    {/* Row 3: Session active badge (mobile + desktop) */}
                    {isVerified && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Session active
                        </span>
                    )}
                </div>

                <div className="px-5 py-4 space-y-4">
                    {!isVerified && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-2 px-4 rounded-lg bg-white border border-amber-100">
                            <p className="text-xs text-gray-500">
                                Your government IDs are hidden. Verify your identity to view or edit them.
                            </p>
                            <button
                                type="button"
                                onClick={() => setModalOpen(true)}
                                className="btn btn-primary flex items-center gap-2 text-xs w-full sm:w-auto shrink-0"
                            >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                View Information
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SecureField label="SSS number"        name="sssNumber"        value={form.sssNumber}
                            visible={showSSS}        onShow={() => setShowSSS(true)}        onHide={() => setShowSSS(false)}
                            onChange={handleChange} placeholder="XX-XXXXXXX-X"   maxLength={12} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="Pag-IBIG number"   name="pagIbigNumber"    value={form.pagIbigNumber}
                            visible={showPagIbig}    onShow={() => setShowPagIbig(true)}    onHide={() => setShowPagIbig(false)}
                            onChange={handleChange} placeholder="XXXX-XXXX-XXXX" maxLength={14} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="PhilHealth number" name="philHealthNumber" value={form.philHealthNumber}
                            visible={showPhilHealth} onShow={() => setShowPhilHealth(true)} onHide={() => setShowPhilHealth(false)}
                            onChange={handleChange} placeholder="XX-XXXXXXXXX-X" maxLength={14} isVerified={isVerified} isEditing={isEditing} />
                        <SecureField label="TIN number"        name="tinNumber"        value={form.tinNumber}
                            visible={showTIN}        onShow={() => setShowTIN(true)}        onHide={() => setShowTIN(false)}
                            onChange={handleChange} placeholder="XXX-XXX-XXX"    maxLength={11} isVerified={isVerified} isEditing={isEditing} />
                    </div>

                    {isVerified && !isEditing && (
                        <p className="text-[11px] text-amber-700 flex items-center gap-1.5 pt-1">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                            Verification session expires in 1 minute. Each revealed field hides after 10 seconds.
                        </p>
                    )}
                    {confirmOpen && (
                        <ConfirmModal
                            title="Save changes?"
                            message="Are you sure you want to update your government information?"
                            onConfirm={handleConfirmSave}
                            onCancel={() => setConfirmOpen(false)}
                        />
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
};

const employmentTypeOptions   = ['Regular', 'Probationary', 'Project-based'];
const employmentStatusOptions = ['Active', 'Inactive'];
// const PROFILE_STORAGE_KEY     = 'settings.profileForm';

const ProfileTab = ({ user, onSaved }: { user: any; onSaved?: () => void }) => {
    const emptyForm: ProfileForm = {
        fullName:         '',
        email:            '',
        contactNumber:    '',
        addressLine1:     '',
        addressLine2:     '',
        city:             '',
        province:         '',
        zipCode:          '',
        position:         '',
        employmentType:   '',
        department:       '',
        employmentStatus: 'Active',
    };

    const [form,          setForm]          = useState<ProfileForm>(emptyForm);
    const [snapshot,      setSnapshot]      = useState<ProfileForm>(emptyForm);
    const [isEditing,     setIsEditing]     = useState(false);
    const [isLoading,     setIsLoading]     = useState(true);
    const [confirmOpen,   setConfirmOpen]   = useState(false);
    const avatarUrl = useAvatarUrl(user?.id);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    type ProfileDropdownKey = 'province' | 'city' | null;
    const [openDropdown, setOpenDropdown] = useState<ProfileDropdownKey>(null);

    const cityOptions = useMemo(() => {
        const selected = form.province as keyof typeof LOCATION_OPTIONS;
        if (!selected || !(selected in LOCATION_OPTIONS)) return [];
        return LOCATION_OPTIONS[selected].map(city => ({ label: city, value: city }));
    }, [form.province]);

    const handleProvinceSelect = (value: string) => {
        setForm(prev => ({ ...prev, province: value, city: '' }));
        setOpenDropdown(null);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                const data = await apiRequest<any>('/employees/me');
                const loaded: ProfileForm = {
                    fullName:         data.fullName         ?? '',
                    email:            data.email            ?? '',
                    contactNumber:    data.contactNumber    ?? '',
                    addressLine1:     data.addressLine1     ?? '',
                    addressLine2:     data.addressLine2     ?? '',
                    city:             data.city             ?? '',
                    province:         data.province         ?? '',
                    zipCode:          data.zipCode          ?? '',
                    position:         data.position         ?? '',
                    employmentType:   data.employmentType   ?? '',
                    department:       data.department       ?? '',
                    employmentStatus: data.isActive ? 'Active' : 'Inactive',
                };
                setForm(loaded);
                setSnapshot(loaded);
            } catch {
                // fallback sa user object kung may error
                const fallback: ProfileForm = {
                    fullName:         user?.fullName         ?? '',
                    email:            user?.email            ?? '',
                    contactNumber:    '',
                    addressLine1:     '',
                    addressLine2:     '',
                    city:             '',
                    province:         '',
                    zipCode:          '',
                    position:         '',
                    employmentType:   '',
                    department:       '',
                    employmentStatus: 'Active',
                };
                setForm(fallback);
                setSnapshot(fallback);
            } finally {
                setIsLoading(false);
            }
        };

        void fetchProfile();
    }, [user]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const base64 = await readAvatarFileAsDataUrl(file);
            if (user?.id) {
                setStoredAvatarUrl(user.id, base64);
            }
            toast.success('Profile photo updated.');
        } catch {
            toast.error('Failed to update profile photo.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formatted = name === 'contactNumber' ? formatContactNumber(value) : value;
        setForm(prev => ({ ...prev, [name]: formatted }));
    };

    const handleEdit = () => {
        setSnapshot(form);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setForm(snapshot);
        setIsEditing(false);
    };

    const handleSave = () => {
        const hasChanges = JSON.stringify(form) !== JSON.stringify(snapshot);
        if (!hasChanges) {
            toast.info('No changes have been made.');
            setIsEditing(false);
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);

        // ── Detect which sections changed ──
        const personalFields:   (keyof ProfileForm)[] = ['contactNumber', 'addressLine1', 'addressLine2', 'city', 'province', 'zipCode'];
        const employmentFields: (keyof ProfileForm)[] = ['position', 'department', 'employmentType', 'employmentStatus'];

        const changed: string[] = [];
        if (personalFields.some(f   => form[f] !== snapshot[f])) changed.push('personal');
        if (employmentFields.some(f => form[f] !== snapshot[f])) changed.push('employment');

        // ── Build summary ──
        let summary = 'User updated their profile information.';
        if (changed.length === 1) {
            summary = `User updated their ${changed[0]} information.`;
        } else if (changed.length === 2) {
            summary = `User updated their ${changed[0]} and ${changed[1]} information.`;
        }

        try {
            const existing = await apiRequest<any>('/employees/me');
            await apiRequest('/employees/me', {
                method: 'PUT',
                body: JSON.stringify({
                    firstName:        existing.firstName ?? '',
                    lastName:         existing.lastName ?? '',
                    employmentType:   form.employmentType || 'Regular',
                    department:       form.department     || null,
                    position:         form.position       || null,
                    contactNumber:    form.contactNumber  || null,
                    addressLine1:     form.addressLine1   || null,
                    addressLine2:     form.addressLine2   || null,
                    city:             form.city           || null,
                    province:         form.province       || null,
                    zipCode:          form.zipCode        || null,
                    isActive:         form.employmentStatus === 'Active',
                    sssNumber:        existing.sssNumber        || null,
                    philHealthNumber: existing.philHealthNumber || null,
                    pagIbigNumber:    existing.pagIbigNumber    || null,
                    tinNumber:        existing.tinNumber        || null,
                }),
            });

            setSnapshot(form);
            setIsEditing(false);
            toast.success('Profile updated successfully.');
            void createActivityLog({
                action: 'PROFILE_UPDATED',
                module: 'PROFILE',
                summary,
            });
            onSaved?.();
        } catch {
            toast.error('Failed to save profile. Please try again.');
        }
    };

    const initials = form.fullName
        ? form.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'U';

    const inputClass = isEditing
        ? 'pro-input w-full'
        : 'pro-input w-full bg-gray-50 !text-gray-400 cursor-not-allowed';

    const selectClass = isEditing
        ? 'pro-input w-full'
        : 'pro-input w-full bg-gray-50 text-gray-400 cursor-not-allowed';

    return (
        <div className="space-y-8">
            {confirmOpen && (
                <ConfirmModal
                    title="Save changes?"
                    message="Are you sure you want to save your profile changes?"
                    onConfirm={handleConfirmSave}
                    onCancel={() => setConfirmOpen(false)}
                />
            )}

            {/* Avatar row + Edit / Save / Cancel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Hidden file input */}
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />

                {/* Top row on mobile: avatar + edit button */}
                <div className="flex items-start justify-between sm:items-center gap-4">
                    {/* Avatar */}
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Change profile photo"
                        className="relative w-24 h-24 rounded-2xl shrink-0 group overflow-hidden border border-gray-100"
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Profile"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold rounded-2xl">
                                {initials}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </button>

                    {/* Edit button — only visible on mobile (right of avatar) */}
                    <div className="flex items-center gap-2 sm:hidden">
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

                {/* Name & position — below avatar on mobile */}
                <div className="flex-1">
                    <p className="text-[15px] font-semibold text-gray-800">{form.fullName || '—'}</p>
                    <p className="text-xs text-gray-400">{form.position || 'No position set'}</p>
                    <p className="text-[12px] text-gray-800 mt-0.5">{user?.username ?? user?.email ?? '—'}</p>
                </div>

                {/* Edit button — only visible on desktop (far right) */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact number</label>
                        <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="+63 912 345 6789" maxLength={13} />
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
                        <DropdownMenu
                            value={form.city}
                            options={cityOptions}
                            placeholder={form.province ? 'Select city' : 'Select province first'}
                            disabled={!isEditing}
                            onSelect={value => { setForm(prev => ({ ...prev, city: value })); setOpenDropdown(null); }}
                            open={openDropdown === 'city'}
                            onToggle={() => setOpenDropdown(prev => prev === 'city' ? null : 'city')}
                            onClose={() => setOpenDropdown(null)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Province</label>
                        <DropdownMenu
                            value={form.province}
                            options={PROVINCE_OPTIONS}
                            placeholder="Select province"
                            disabled={!isEditing}
                            onSelect={handleProvinceSelect}
                            open={openDropdown === 'province'}
                            onToggle={() => setOpenDropdown(prev => prev === 'province' ? null : 'province')}
                            onClose={() => setOpenDropdown(null)}
                        />
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
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment status</label>
                        <p className={`py-1.5 font-semibold text-sm ${form.employmentStatus === 'Active' ? 'text-green-500' : 'text-rose-500'}`}>
                            {form.employmentStatus || '—'}
                        </p>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                        <input value={form.department} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-gray-500 text-sm border-0 outline-none cursor-default select-none" placeholder="e.g. Engineering" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment type</label>
                        <input value={form.employmentType} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-gray-500 text-sm border-0 outline-none cursor-default select-none" placeholder="e.g. Regular" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Position</label>
                        <input value={form.position} readOnly
                            className="w-full px-0 py-1.5 bg-transparent text-gray-500 text-sm border-0 outline-none cursor-default select-none" placeholder="e.g. Software Engineer" />
                    </div>
                </div>
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5 italic">
                    <Lock className="w-3 h-3 shrink-0" />
                    Employment information can only be updated by an administrator.
                </p>
            </div>

            
        </div>
    );
};

// ─── Account & Security Tab ───────────────────────────────────────────────────

const SecurityTab = ({ user, onSaved }: { user: any; onSaved?: () => void }) => {
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
                const data = await apiRequest<any>('/employees/me');
                setEmployeeNumber(data.employeeNumber ?? null);
setHiredDate(data.dateHired ? new Date(data.dateHired).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : null);
            } catch {
                setEmployeeNumber(null);
            }
        };
        void fetchEmployeeNumber();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        } catch (err: any) {
            const message = err?.message ?? '';
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

// ─── Filter Dropdown ──────────────────────────────────────────────────────────

type FilterDropdownProps = {
    value: string;
    options: readonly string[];
    onSelect: (value: string) => void;
    disabled?: boolean;
};

function FilterDropdown({ value, options, onSelect, disabled }: FilterDropdownProps) {
    const allOptions = ['All', ...options] as const;
    return (
        <DocumentTypeDropdown
            value={value as any}
            options={allOptions as any}
            onSelect={onSelect as any}
            disabled={disabled}
        />
    );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────

type DocumentPreviewState = {
    url: string;
    contentType?: string | null;
    fileName?: string | null;
} | null;

function formatPendingFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;
}

const DOCUMENTS_PAGE_SIZE = 5;

type UploaderFilter = 'All' | 'Admin' | 'Employee';

const DocumentsTab = ({ onSaved }: { onSaved?: () => void }) => {
    const [uploadConfirmOpen, setUploadConfirmOpen] = useState(false);
    const [drawerPreview, setDrawerPreview] = useState<{ url: string; name: string; type: string } | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [typeSearch, setTypeSearch] = useState('');
    const [uploaderFilter, setUploaderFilter] = useState<UploaderFilter>('All');
    const [docPage, setDocPage] = useState(1);
    const [pendingFileUrl, setPendingFileUrl] = useState<string | null>(null);
    const [showFilePreview, setShowFilePreview] = useState(false);

    const {
        documents,
        documentsLoading,
        documentsError,
        uploading,
        downloadingDocumentId,
        deletingDocumentId,
        selectedDocumentType,
        setSelectedDocumentType,
        upload,
        download,
        remove,
        getPreviewPayload,
    } = useMyDocuments(true, {
        onUploadSuccess: (msg) => {
            toast.success(msg);
            onSaved?.();
        },
        onUploadError:   (msg) => toast.error(msg),
        onDownloadSuccess: (msg) => toast.success(msg),
        onDownloadError:   (msg) => toast.error(msg),
        onDeleteSuccess: (msg) => toast.success(msg),
        onDeleteError:   (msg) => toast.error(msg),
    });

    const handleUploadRequest = (file: File) => {
        setPendingFile(file);
        setPendingFileUrl(URL.createObjectURL(file));
        setShowFilePreview(false);
        setUploadConfirmOpen(true);
    };

    const handleConfirmUpload = () => {
        setUploadConfirmOpen(false);
        if (pendingFile) {
            void upload(pendingFile);
        }
        if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
        setPendingFile(null);
        setPendingFileUrl(null);
        setShowFilePreview(false);
    };

    const handleCancelUpload = () => {
        setUploadConfirmOpen(false);
        if (pendingFileUrl) URL.revokeObjectURL(pendingFileUrl);
        setPendingFile(null);
        setPendingFileUrl(null);
        setShowFilePreview(false);
    };

    const filteredDocuments = documents.filter(doc => {
        if (typeSearch.trim()) {
            const query = typeSearch.trim().toLowerCase();
            const docType = (doc.documentType ?? '').toLowerCase();
            if (!docType.includes(query)) return false;
        }
        if (uploaderFilter !== 'All' && (doc as any).uploadedByRole !== uploaderFilter) return false;
        return true;
    });

    const totalDocPages = Math.max(1, Math.ceil(filteredDocuments.length / DOCUMENTS_PAGE_SIZE));
    const currentDocPage = Math.min(docPage, totalDocPages);
    const paginatedDocuments = filteredDocuments.slice(
        (currentDocPage - 1) * DOCUMENTS_PAGE_SIZE,
        currentDocPage * DOCUMENTS_PAGE_SIZE
    );
    const canGoPrevDoc = currentDocPage > 1;
    const canGoNextDoc = currentDocPage < totalDocPages;

    const handleTypeSearchChange = (value: string) => {
        setTypeSearch(value);
        setDocPage(1);
    };

    const handleUploaderFilterChange = (value: UploaderFilter) => {
        setUploaderFilter(value);
        setDocPage(1);
    };

    const handlePreviewSelect = async (doc: import('../../lib/employees').EmployeeDocumentDto) => {
    try {
        const payload = await getPreviewPayload(doc);
        if (!payload?.url) { toast.error('Preview could not be loaded.'); return; }
        setDrawerPreview({
            url: payload.url,
            name: payload.fileName ?? doc.fileName ?? 'Document',
            type: payload.contentType ?? doc.contentType ?? '',
        });
        setShowFilePreview(true);
    } catch {
        toast.error('Preview could not be loaded.');
    }
};

    return (
        <div className="space-y-5">
            

            <EmployeeDocumentsPanel
                employeeId={null}
                documents={paginatedDocuments}
                documentsLoading={documentsLoading}
                documentsError={documentsError}
                uploading={uploading}
                downloadingDocumentId={downloadingDocumentId}
                deletingDocumentId={deletingDocumentId}
                selectedDocumentType={selectedDocumentType}
                onSelectedDocumentTypeChange={setSelectedDocumentType}
                onUpload={handleUploadRequest}
                onDownload={download}
                onDelete={remove}
                readOnly={false}
                onPreviewSelect={handlePreviewSelect}
                activeDocumentId={null}
                renderBetween={
                    <div className="flex items-center justify-between gap-3">
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search by type..."
                                className="pro-input !pl-9 !h-12 !py-0 w-full"
                                value={typeSearch}
                                onChange={e => handleTypeSearchChange(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>

                        <div className="w-40">
                            <FilterDropdown
                                value={uploaderFilter}
                                options={['Admin', 'Employee']}
                                onSelect={(value) => handleUploaderFilterChange(value as UploaderFilter)}
                            />
                        </div>
                    </div>
                }
            />

            {!documentsLoading && filteredDocuments.length > 0 && totalDocPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <button
                        type="button"
                        onClick={() => canGoPrevDoc && setDocPage(p => p - 1)}
                        disabled={!canGoPrevDoc}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Prev
                    </button>
                    <span className="text-gray-500 text-sm font-medium">
                        Page {currentDocPage} / {totalDocPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => canGoNextDoc && setDocPage(p => p + 1)}
                        disabled={!canGoNextDoc}
                        className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            )}

            {uploadConfirmOpen && pendingFile && (
                <ConfirmModal
                    title="Submit this file?"
                    message={
                        <div className="space-y-2">
                            <p>Are you sure you want to submit this file?</p>
                            <div className="mt-2 w-full rounded-lg bg-gray-50 border border-gray-100 px-3 py-2 text-left">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-gray-700 truncate">{pendingFile.name}</p>
                                        <p className="text-[11px] text-gray-400 mt-0.5">
                                            {pendingFile.type || 'Unknown type'} • {formatPendingFileSize(pendingFile.size)}{selectedDocumentType ? ` • ${selectedDocumentType}` : ''}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowFilePreview(true)}
                                        title="View file"
                                        className="shrink-0 text-gray-400 hover:text-emerald-600 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    }
                    onConfirm={handleConfirmUpload}
                    onCancel={handleCancelUpload}
                />
            )}

            {showFilePreview && (pendingFile || drawerPreview) && createPortal(
                <div className="fixed inset-0 z-[10001] flex justify-end">
                    <div
                        className="absolute inset-0 bg-slate-900/50"
                        onClick={() => {
                            if (drawerPreview?.url) URL.revokeObjectURL(drawerPreview.url);
                            setDrawerPreview(null);
                            setShowFilePreview(false);
                        }}
                    />
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">File Preview</h2>
                            <button
                                type="button"
                                onClick={() => {
                            if (drawerPreview?.url) URL.revokeObjectURL(drawerPreview.url);
                            setDrawerPreview(null);
                            setShowFilePreview(false);
                        }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="px-5 py-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                                {drawerPreview ? drawerPreview.name : (pendingFile?.name ?? '')}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {drawerPreview
                                    ? (drawerPreview.type || 'Unknown type')
                                    : `${pendingFile?.type || 'Unknown type'} • ${formatPendingFileSize(pendingFile?.size ?? 0)}${selectedDocumentType ? ` • ${selectedDocumentType}` : ''}`}
                            </p>
                        </div>

                        <div className="flex-1 overflow-auto p-5">
                            {(() => {
                                const url  = drawerPreview ? drawerPreview.url  : pendingFileUrl;
                                const type = drawerPreview ? drawerPreview.type : (pendingFile?.type ?? '');
                                const name = drawerPreview ? drawerPreview.name : (pendingFile?.name ?? '');
                                if (!url) return null;
                                if (type === 'application/pdf' || name.endsWith('.pdf'))
                                    return <iframe src={url} title={name} className="w-full h-full rounded-lg border border-gray-200" />;
                                if (type.startsWith('image/'))
                                    return <img src={url} alt={name} className="max-w-full h-auto object-contain rounded-lg border border-gray-200" />;
                                return <div className="flex h-full items-center justify-center text-sm text-gray-400">Preview not available for this file type.</div>;
                            })()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

// ─── Activity Log Tab ─────────────────────────────────────────────────────────

const ActivityLogTab = ({ refreshKey }: { refreshKey: number }) => {
    const [searchTerm,          setSearchTerm]          = useState('');
    const [debouncedSearch,     setDebouncedSearch]     = useState('');
    const [isTodayFilterActive, setIsTodayFilterActive] = useState(false);
    const [logs,                setLogs]                = useState<ActivityLogItemDto[]>([]);
    const [page,                setPage]                = useState(1);
    const [totalCount,          setTotalCount]          = useState(0);
    const [isLoading,           setIsLoading]           = useState(true);
    const [error,               setError]               = useState<string | null>(null);

    const PAGE_SIZE = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
            setPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        setPage(1);
    }, [isTodayFilterActive]);

    useEffect(() => {
        let isMounted = true;

        const loadLogs = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await getUserActivityLogs({
                    page,
                    pageSize: PAGE_SIZE,
                    search: debouncedSearch || undefined,
                });

                if (!isMounted) return;

                let data = Array.isArray(response.data) ? response.data : [];

                if (isTodayFilterActive) {
                    const todayStr = new Date().toLocaleDateString('en-CA', {
                        timeZone: 'Asia/Manila',
                    });
                    data = data.filter(
                        log => formatDateFilterPart(log.createdAt) === todayStr
                    );
                }

                setLogs(data);
                setTotalCount(isTodayFilterActive ? data.length : response.totalCount);
            } catch (err) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : 'Failed to load activity logs.');
                setLogs([]);
                setTotalCount(0);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        void loadLogs();
        return () => { isMounted = false; };
    }, [page, debouncedSearch, isTodayFilterActive, refreshKey]);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

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

            <div className="overflow-x-auto rounded-xl border border-gray-100 min-h-[520px]">
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
                        {isLoading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-gray-500 italic">
                                    Loading activity logs...
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-red-500 italic">
                                    {error}
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-400 italic">
                                    No logs match your search.
                                </td>
                            </tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log.id}>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatDatePart(log.createdAt)}
                                    </td>
                                    <td className="whitespace-nowrap !font-medium !text-gray-900">
                                        {formatTimePart(log.createdAt)}
                                    </td>
                                    <td>
                                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getBadgeClassName(log.action)}`}>
                                            {formatActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">
                                        {log.summary ?? '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {!isLoading && !error && totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => canGoPrev && setPage(prev => prev - 1)}
                            disabled={!canGoPrev}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Prev
                        </button>
                        <span className="text-gray-500 font-medium">
                            Page {page} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => canGoNext && setPage(prev => prev + 1)}
                            disabled={!canGoNext}
                            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

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
                    <div className={activeTab === 'profile'   ? '' : 'hidden'}><ProfileTab  user={user} onSaved={triggerLogRefresh} /></div>
                    <div className={activeTab === 'security'  ? '' : 'hidden'}><SecurityTab user={user} onSaved={triggerLogRefresh} /></div>
                    <div className={activeTab === 'documents' ? '' : 'hidden'}><DocumentsTab onSaved={triggerLogRefresh} /></div>
                    <div className={activeTab === 'logs'      ? '' : 'hidden'}><ActivityLogTab refreshKey={logRefreshKey} /></div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;

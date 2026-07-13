import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { AlertCircle, Check, Eye, EyeOff, Lock, Pencil, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { createActivityLog } from '../../../lib/activityLogs';
import { apiRequest } from '../../../lib/api';

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

type EmployeeMeResponse = {
    fullName?:          string | null;
    firstName?:         string | null;
    lastName?:          string | null;
    employmentType?:    string | null;
    department?:        string | null;
    position?:          string | null;
    contactNumber?:     string | null;
    addressLine1?:      string | null;
    addressLine2?:      string | null;
    city?:              string | null;
    province?:          string | null;
    zipCode?:           string | null;
    isActive?:          boolean | null;
    sssNumber?:         string | null;
    pagIbigNumber?:     string | null;
    philHealthNumber?:  string | null;
    tinNumber?:         string | null;
};

interface GovernmentInfoSectionProps {
    onSaved?: () => void;
}

const SESSION_EXPIRE_MS = 60_000;

const getErrorMessage = (err: unknown): string | undefined => {
    if (err instanceof Error) return err.message;
    if (typeof err === 'object' && err !== null && 'message' in err) {
        const message = (err as { message?: unknown }).message;
        return typeof message === 'string' ? message : undefined;
    }
    return undefined;
};

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
                const data = await apiRequest<EmployeeMeResponse>('/employees/me');
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
            const existing = await apiRequest<EmployeeMeResponse>('/employees/me');

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
        } catch (err: unknown) {
            console.error('Gov save error:', err);
            toast.error(getErrorMessage(err) ?? 'Failed to save. Please try again.');
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

export default GovernmentInfoSection;

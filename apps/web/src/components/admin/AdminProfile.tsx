import { useState, useRef, useEffect, useMemo } from 'react';
import { Pencil, X, Check, Upload, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';
import { DropdownMenu } from '../../shared/components/forms/DropdownMenu';
import { LOCATION_OPTIONS, PROVINCE_OPTIONS } from '../../shared/data/locationOptions';
import { useAvatarUrl } from '../../hooks/useAvatarUrl';
import { readAvatarFileAsDataUrl, setStoredAvatarUrl } from '../../lib/avatar';


// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
    title:     string;
    message:   React.ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
}

const ConfirmModal = ({ title, message, onConfirm, onCancel }: ConfirmModalProps) => {
    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter')  onConfirm();
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
                    <button type="button" onClick={onCancel}  className="btn btn-secondary text-sm">Cancel</button>
                    <button type="button" onClick={onConfirm} className="btn btn-primary flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4" /> Yes, save
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminProfileForm = {
    fullName:     string;
    email:        string;
    phone:        string;
    addressLine1: string;
    addressLine2: string;
    city:         string;
    province:     string;
    zipCode:      string;
    jobTitle:     string;
    department:   string;
    role:         string;
    accountStatus: string;
    hiredDate:    string;
};

type AdminDropdownKey = 'province' | 'city' | null;

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminProfile = () => {
    const { user } = useAuth();

    const emptyForm: AdminProfileForm = {
        fullName:     '',
        email:        '',
        phone:        '',
        addressLine1: '',
        addressLine2: '',
        city:         '',
        province:     '',
        zipCode:      '',
        jobTitle:     '',
        department:   '',
        role:         '',
        accountStatus:   '—',
        hiredDate:    '—',
    };

    const [form,        setForm]        = useState<AdminProfileForm>(emptyForm);
    const [snapshot,    setSnapshot]    = useState<AdminProfileForm>(emptyForm);
    const [isEditing,   setIsEditing]   = useState(false);
    const [isLoading,   setIsLoading]   = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const avatarUrl = useAvatarUrl(user?.id);
    const [openDropdown, setOpenDropdown] = useState<AdminDropdownKey>(null);

    const avatarInputRef = useRef<HTMLInputElement>(null);

    // ── City options based on selected province ──
    const cityOptions = useMemo(() => {
        const selected = form.province as keyof typeof LOCATION_OPTIONS;
        if (!selected || !(selected in LOCATION_OPTIONS)) return [];
        return LOCATION_OPTIONS[selected].map(city => ({ label: city, value: city }));
    }, [form.province]);

    const handleProvinceSelect = (value: string) => {
        setForm(prev => ({ ...prev, province: value, city: '' }));
        setOpenDropdown(null);
    };

    // ── Load profile from AuthContext (backend endpoint pending) ──
    useEffect(() => {
        const loaded: AdminProfileForm = {
            fullName:     (user as any)?.fullName ?? '',
            email:        (user as any)?.email    ?? '',
            phone:        '',
            addressLine1: '',
            addressLine2: '',
            city:         '',
            province:     '',
            zipCode:      '',
            jobTitle:     '',
            department:   '',
            role:         (user as any)?.role     ?? 'ADMIN',
            accountStatus:   '—',
            hiredDate:    '—',
        };
        setForm(loaded);
        setSnapshot(loaded);
        setIsLoading(false);
    }, [user]);

    // ── Avatar change ──
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const userId = user?.id;
        if (userId === null || userId === undefined) {
            toast.error('Unable to update profile photo. Please sign in again.');
            return;
        }
        try {
            const base64 = await readAvatarFileAsDataUrl(file);
            setStoredAvatarUrl(userId, base64);
            toast.success('Profile photo updated.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update profile photo.');
        }
    };

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

    const handleConfirmSave = () => {
        // TODO: connect to API — PUT /auth/me (backend pending, for TL)
        setConfirmOpen(false);
        setSnapshot(form);
        setIsEditing(false);
        toast.success('Profile updated successfully.');
    };

    const initials = form.fullName
        ? form.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
        : 'A';

    const roleLabel = (role: string) => {
        if (role === 'SUPER_ADMIN') return 'Super Admin';
        if (role === 'ADMIN')       return 'Admin';
        return role;
    };

    const inputClass = isEditing
        ? 'pro-input w-full'
        : 'pro-input w-full bg-gray-50 !text-gray-400 cursor-not-allowed';

    const readOnlyClass = 'pro-input w-full bg-gray-50 !text-gray-400 cursor-not-allowed';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                Loading profile...
            </div>
        );
    }

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

            {/* ── Avatar row ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                />

                {/* Top row on mobile: avatar + edit button */}
                <div className="flex items-start justify-between sm:items-center gap-4">
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        title="Change profile photo"
                        className="relative w-24 h-24 rounded-2xl shrink-0 group overflow-hidden border border-gray-100"
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            <div className="w-full h-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-lg font-bold rounded-2xl">
                                {initials}
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                        </div>
                    </button>

                    {/* Edit button — mobile only */}
                    <div className="flex items-center gap-2 sm:hidden">
                        {!isEditing ? (
                            <button onClick={handleEdit} className="btn btn-secondary flex items-center gap-2" type="button">
                                <Pencil className="w-4 h-4" /> Edit
                            </button>
                        ) : (
                            <>
                                <button onClick={handleCancel} className="btn btn-secondary" type="button"><X className="w-4 h-4" /></button>
                                <button onClick={handleSave}   className="btn btn-primary"   type="button"><Check className="w-4 h-4" /></button>
                            </>
                        )}
                    </div>
                </div>

                {/* Name + role info */}
                <div className="flex-1">
                    <p className="text-[15px] font-semibold text-gray-800">{form.fullName || '—'}</p>
                    <p className="text-xs text-gray-400">{form.jobTitle || 'No title set'}</p>
                    <p className="text-[12px] text-gray-800 mt-0.5">{(user as any)?.username ?? form.email ?? '—'}</p>
                    <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                        <ShieldCheck className="w-3 h-3" />
                        {roleLabel(form.role)}
                    </span>
                </div>

                {/* Edit button — desktop only */}
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                    {!isEditing ? (
                        <button onClick={handleEdit} className="btn btn-secondary flex items-center gap-2" type="button">
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                    ) : (
                        <>
                            <button onClick={handleCancel} className="btn btn-secondary" type="button"><X className="w-4 h-4" /></button>
                            <button onClick={handleSave}   className="btn btn-primary"   type="button"><Check className="w-4 h-4" /></button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Personal Information ── */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Personal information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Full name</label>
                        <input value={form.fullName} readOnly className={readOnlyClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email address</label>
                        <input value={form.email} readOnly type="email" className={readOnlyClass} />
                    </div> */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Phone number</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="+63 912 345 6789"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Address line 1</label>
                        <input
                            name="addressLine1"
                            value={form.addressLine1}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="House No., Street"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Address line 2</label>
                        <input
                            name="addressLine2"
                            value={form.addressLine2}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="Barangay, Subdivision (optional)"
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
                        <input
                            name="zipCode"
                            value={form.zipCode}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="1000"
                            maxLength={4}
                        />
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
                </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* ── Work Information ── */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Work information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Job title</label>
                        <input
                            name="jobTitle"
                            value={form.jobTitle}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="e.g. HR Administrator"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Department</label>
                        <input
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={inputClass}
                            placeholder="e.g. Human Resources"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hired date</label>
                        <input value={form.hiredDate} readOnly className={readOnlyClass} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Account status</label>
                        <p className={`py-1.5 font-semibold text-sm ${form.accountStatus === 'Active' ? 'text-green-500' : 'text-rose-500'}`}>
                            {form.accountStatus || '—'}
                        </p>
                    </div>
                </div>
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5 italic">
                    <Lock className="w-3 h-3 shrink-0" />
                    Employee ID and hired date are managed by the system and cannot be edited here.
                </p>
            </div>

            <div className="border-t border-gray-100" />

        </div>
    );
};

export default AdminProfile;

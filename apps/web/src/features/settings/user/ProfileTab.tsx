import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType, type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';
import { LOCATION_OPTIONS } from '../../../shared/data/locationOptions';
import { useAvatarUrl } from '../../../shared/hooks/useAvatarUrl';
import { readAvatarFileAsDataUrl, setStoredAvatarUrl } from '../../../shared/utils/avatar';
import { apiRequest } from '../../../services/api/client';
import { createActivityLog } from '../../../services/api/activity-logs/activityLogs';
import ProfileActions from '../profile/ProfileActions';
import ProfileAvatar from '../profile/ProfileAvatar';
import ProfileLocationFields from '../profile/ProfileLocationFields';

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

type UserSettingsUser = {
    id?: string | number | null;
    fullName?: string | null;
    email?: string | null;
    username?: string | null;
};

type EmployeeProfileResponse = {
    fullName?: string | null;
    email?: string | null;
    contactNumber?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    province?: string | null;
    zipCode?: string | null;
    position?: string | null;
    employmentType?: string | null;
    department?: string | null;
    isActive?: boolean | null;
    firstName?: string | null;
    lastName?: string | null;
    sssNumber?: string | null;
    philHealthNumber?: string | null;
    pagIbigNumber?: string | null;
    tinNumber?: string | null;
};

type ConfirmModalProps = {
    title:    string;
    message:  ReactNode;
    onConfirm: () => void;
    onCancel:  () => void;
};

type ProfileTabProps = {
    user: UserSettingsUser | null | undefined;
    onSaved?: () => void;
    ConfirmModal: ComponentType<ConfirmModalProps>;
};

function formatContactNumber(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
}

const ProfileTab = ({ user, onSaved, ConfirmModal }: ProfileTabProps) => {
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

    const handleCitySelect = (value: string) => {
        setForm(prev => ({ ...prev, city: value }));
        setOpenDropdown(null);
    };

    const handleToggleDropdown = (dropdown: Exclude<ProfileDropdownKey, null>) => {
        setOpenDropdown(prev => prev === dropdown ? null : dropdown);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiRequest<EmployeeProfileResponse>('/employees/me');
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
            }
        };

        void fetchProfile();
    }, [user]);

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

        const personalFields:   (keyof ProfileForm)[] = ['contactNumber', 'addressLine1', 'addressLine2', 'city', 'province', 'zipCode'];
        const employmentFields: (keyof ProfileForm)[] = ['position', 'department', 'employmentType', 'employmentStatus'];

        const changed: string[] = [];
        if (personalFields.some(f   => form[f] !== snapshot[f])) changed.push('personal');
        if (employmentFields.some(f => form[f] !== snapshot[f])) changed.push('employment');

        let summary = 'User updated their profile information.';
        if (changed.length === 1) {
            summary = `User updated their ${changed[0]} information.`;
        } else if (changed.length === 2) {
            summary = `User updated their ${changed[0]} and ${changed[1]} information.`;
        }

        try {
            const existing = await apiRequest<EmployeeProfileResponse>('/employees/me');
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
                {/* Top row on mobile: avatar + edit button */}
                <div className="flex items-start justify-between sm:items-center gap-4">
                    {/* Avatar */}
                    <ProfileAvatar
                        inputRef={avatarInputRef}
                        avatarUrl={avatarUrl}
                        initials={initials}
                        onChange={handleAvatarChange}
                        onSelectFile={() => avatarInputRef.current?.click()}
                    />

                    {/* Edit button - only visible on mobile (right of avatar) */}
                    <ProfileActions
                        isEditing={isEditing}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        className="flex items-center gap-2 sm:hidden"
                    />
                </div>

                {/* Name & position - below avatar on mobile */}
                <div className="flex-1">
                    <p className="text-[15px] font-semibold text-gray-800">{form.fullName || '�'}</p>
                    <p className="text-xs text-gray-400">{form.position || 'No position set'}</p>
                    <p className="text-[12px] text-gray-800 mt-0.5">{user?.username ?? user?.email ?? '�'}</p>
                </div>

                {/* Edit button - only visible on desktop (far right) */}
                <ProfileActions
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    className="hidden sm:flex items-center gap-2 shrink-0"
                />
            </div>

            {/* Personal Information */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Personal information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Contact number</label>
                        <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                            readOnly={!isEditing} className={inputClass} placeholder="+63 912 345 6789" maxLength={13} />
                    </div>
                    <ProfileLocationFields
                        values={form}
                        isEditing={isEditing}
                        inputClassName={inputClass}
                        cityOptions={cityOptions}
                        openDropdown={openDropdown}
                        fieldOrder={['addressLine1', 'addressLine2', 'city', 'province', 'zipCode']}
                        onInputChange={handleChange}
                        onProvinceSelect={handleProvinceSelect}
                        onCitySelect={handleCitySelect}
                        onToggleDropdown={handleToggleDropdown}
                        onCloseDropdown={() => setOpenDropdown(null)}
                    />
                </div>
            </div>

            <div className="border-t border-gray-100" />
            {/* Employment Information */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Employment information</h3>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Employment status</label>
                        <p className={`py-1.5 font-semibold text-sm ${form.employmentStatus === 'Active' ? 'text-green-500' : 'text-rose-500'}`}>
                            {form.employmentStatus || '�'}
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

export default ProfileTab;
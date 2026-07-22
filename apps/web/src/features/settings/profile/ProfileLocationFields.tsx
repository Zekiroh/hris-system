import type { ChangeEvent } from 'react';
import { DropdownMenu, type SelectOption } from '../../../shared/components/forms/DropdownMenu';
import { PROVINCE_OPTIONS } from '../../../shared/data/locationOptions';

type ProfileDropdownKey = 'province' | 'city' | null;
type ProfileLocationField =
    | 'addressLine1'
    | 'addressLine2'
    | 'province'
    | 'city'
    | 'zipCode';

type ProfileLocationFieldsProps = {
    values: {
        addressLine1: string;
        addressLine2: string;
        province: string;
        city: string;
        zipCode: string;
    };
    isEditing: boolean;
    inputClassName: string;
    cityOptions: SelectOption[];
    openDropdown: ProfileDropdownKey;
    fieldOrder: ProfileLocationField[];
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onProvinceSelect: (value: string) => void;
    onCitySelect: (value: string) => void;
    onToggleDropdown: (
        dropdown: Exclude<ProfileDropdownKey, null>
    ) => void;
    onCloseDropdown: () => void;
};

const ProfileLocationFields = ({
    values,
    isEditing,
    inputClassName,
    cityOptions,
    openDropdown,
    fieldOrder,
    onInputChange,
    onProvinceSelect,
    onCitySelect,
    onToggleDropdown,
    onCloseDropdown,
}: ProfileLocationFieldsProps) => (
    <>
        {fieldOrder.map((field) => {
            if (field === 'addressLine1') {
                return (
                    <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Address line 1
                        </label>
                        <input
                            name="addressLine1"
                            value={values.addressLine1}
                            onChange={onInputChange}
                            readOnly={!isEditing}
                            className={inputClassName}
                            placeholder="House No., Street"
                        />
                    </div>
                );
            }

            if (field === 'addressLine2') {
                return (
                    <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Address line 2
                        </label>
                        <input
                            name="addressLine2"
                            value={values.addressLine2}
                            onChange={onInputChange}
                            readOnly={!isEditing}
                            className={inputClassName}
                            placeholder="Barangay, Subdivision (optional)"
                        />
                    </div>
                );
            }

            if (field === 'province') {
                return (
                    <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            Province
                        </label>
                        <DropdownMenu
                            value={values.province}
                            options={PROVINCE_OPTIONS}
                            placeholder="Select province"
                            disabled={!isEditing}
                            onSelect={onProvinceSelect}
                            open={openDropdown === 'province'}
                            onToggle={() => onToggleDropdown('province')}
                            onClose={onCloseDropdown}
                        />
                    </div>
                );
            }

            if (field === 'city') {
                return (
                    <div key={field}>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            City / Municipality
                        </label>
                        <DropdownMenu
                            value={values.city}
                            options={cityOptions}
                            placeholder={
                                values.province
                                    ? 'Select city'
                                    : 'Select province first'
                            }
                            disabled={!isEditing}
                            onSelect={onCitySelect}
                            open={openDropdown === 'city'}
                            onToggle={() => onToggleDropdown('city')}
                            onClose={onCloseDropdown}
                        />
                    </div>
                );
            }

            return (
                <div key={field}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                        Zip code
                    </label>
                    <input
                        name="zipCode"
                        value={values.zipCode}
                        onChange={onInputChange}
                        readOnly={!isEditing}
                        className={inputClassName}
                        placeholder="1000"
                        maxLength={4}
                    />
                </div>
            );
        })}
    </>
);

export default ProfileLocationFields;
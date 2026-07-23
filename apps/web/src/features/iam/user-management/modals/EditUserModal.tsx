import { createPortal } from 'react-dom';
import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import type { UserFormState } from '../userManagement.shared';
import { USER_SUFFIX_OPTIONS } from '../userManagement.shared';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  formData: UserFormState;
  roleOptions: readonly { id: number; label: string }[];
  error: string | null;
  onClose: () => void;
  onClearError: () => void;
  onChange: React.Dispatch<React.SetStateAction<UserFormState>>;
  onSubmit: () => void;
};

type DropdownOption = {
  label: string;
  value: string;
};

type DropdownKey = 'role' | 'status' | 'suffix' | null;

type DropdownMenuPosition = {
  top: number;
  left: number;
  width: number;
};

function ModalDropdown({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  triggerRef,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const selected = options.find((option) => option.value === value);
  const [menuPosition, setMenuPosition] = useState<DropdownMenuPosition | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef.current) return;

      const rect = triggerRef.current.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, triggerRef]);

  return (
    <div className="relative">
      <label className="pro-label">{label}</label>

      <button
        ref={triggerRef}
        type="button"
        onClick={onToggle}
        className="pro-input flex w-full items-center justify-between text-left"
      >
        <span className={selected ? 'text-gray-700' : 'text-gray-500'}>
          {selected?.label ?? 'Select'}
        </span>
        <span className="ml-3 shrink-0 text-gray-400">▾</span>
      </button>

      {isOpen &&
        menuPosition &&
        createPortal(
          <div
            className="fixed z-[10000] max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {options.map((option) => (
              <button
                key={option.value || 'none'}
                type="button"
                className={`block w-full rounded-xl px-4 py-2.5 text-left text-sm transition ${
                  option.value === value
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => onSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

const EditUserModal = ({
  isOpen,
  isSubmitting,
  formData,
  roleOptions,
  error,
  onClose,
  onClearError,
  onChange,
  onSubmit,
}: Props) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const roleTriggerRef = useRef<HTMLButtonElement | null>(null);
  const statusTriggerRef = useRef<HTMLButtonElement | null>(null);
  const suffixTriggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedRoleTrigger = roleTriggerRef.current?.contains(target);
      const clickedStatusTrigger = statusTriggerRef.current?.contains(target);
      const clickedSuffixTrigger = suffixTriggerRef.current?.contains(target);
      const clickedInsideDropdownContainer =
        dropdownContainerRef.current?.contains(target);

      if (
        !clickedRoleTrigger &&
        !clickedStatusTrigger &&
        !clickedSuffixTrigger &&
        !clickedInsideDropdownContainer
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOpenDropdown(null);
    onClose();
  };

  const roleDropdownOptions: DropdownOption[] = roleOptions.map((role) => ({
    label: role.label,
    value: String(role.id),
  }));

  const statusDropdownOptions: DropdownOption[] = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];

  const suffixDropdownOptions: DropdownOption[] = USER_SUFFIX_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  }));

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div
        className="pro-modal max-w-[500px] overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Edit User</h3>
          <button
            onClick={handleClose}
            className="btn-ghost btn-icon"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          className="pro-modal-body space-y-4 overflow-visible pt-4"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div
            ref={dropdownContainerRef}
            className="mx-auto w-full max-w-[500px] space-y-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="pro-label">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="admin-edit-first-name"
                  autoComplete="off"
                  className="pro-input"
                  value={formData.firstName}
                  onChange={(e) => {
                    onClearError();
                    onChange((prev) => ({ ...prev, firstName: e.target.value }));
                  }}
                />
              </div>

              <div>
                <label className="pro-label">Middle Name</label>
                <input
                  name="admin-edit-middle-name"
                  autoComplete="off"
                  placeholder="Optional"
                  className="pro-input"
                  value={formData.middleName || ''}
                  onChange={(e) => {
                    onClearError();
                    onChange((prev) => ({ ...prev, middleName: e.target.value }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="pro-label">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="admin-edit-last-name"
                  autoComplete="off"
                  className="pro-input"
                  value={formData.lastName}
                  onChange={(e) => {
                    onClearError();
                    onChange((prev) => ({ ...prev, lastName: e.target.value }));
                  }}
                />
              </div>

              <ModalDropdown
                label="Suffix"
                value={formData.suffix}
                options={suffixDropdownOptions}
                isOpen={openDropdown === 'suffix'}
                triggerRef={suffixTriggerRef}
                onToggle={() =>
                  setOpenDropdown((prev) => (prev === 'suffix' ? null : 'suffix'))
                }
                onSelect={(value) => {
                  onClearError();
                  onChange((prev) => ({
                    ...prev,
                    suffix: value,
                  }));
                  setOpenDropdown(null);
                }}
              />
            </div>

            <div className="w-full">
              <label className="pro-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="admin-edit-email"
                autoComplete="off"
                className="pro-input"
                value={formData.email}
                onChange={(e) => {
                  onClearError();
                  onChange((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ModalDropdown
                label="Role"
                value={String(formData.roleId)}
                options={roleDropdownOptions}
                isOpen={openDropdown === 'role'}
                triggerRef={roleTriggerRef}
                onToggle={() =>
                  setOpenDropdown((prev) => (prev === 'role' ? null : 'role'))
                }
                onSelect={(value) => {
                  onClearError();
                  onChange((prev) => ({
                    ...prev,
                    roleId: Number(value),
                  }));
                  setOpenDropdown(null);
                }}
              />

              <ModalDropdown
                label="Status"
                value={formData.isActive ? 'active' : 'inactive'}
                options={statusDropdownOptions}
                isOpen={openDropdown === 'status'}
                triggerRef={statusTriggerRef}
                onToggle={() =>
                  setOpenDropdown((prev) => (prev === 'status' ? null : 'status'))
                }
                onSelect={(value) => {
                  onClearError();
                  onChange((prev) => ({
                    ...prev,
                    isActive: value === 'active',
                  }));
                  setOpenDropdown(null);
                }}
              />
            </div>
          </div>
        </form>

        <div className="pro-modal-footer">
          <button
            onClick={handleClose}
            className="btn btn-secondary"
            type="button"
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            className="btn btn-primary flex items-center gap-2"
            type="button"
            disabled={isSubmitting}
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EditUserModal;
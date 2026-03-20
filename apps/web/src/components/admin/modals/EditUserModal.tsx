import { createPortal } from 'react-dom';
import { X, Check } from 'lucide-react';
import type { UserFormState } from '../userManagement.shared';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  formData: UserFormState;
  roleOptions: readonly { id: number; label: string }[];
  onClose: () => void;
  onChange: React.Dispatch<React.SetStateAction<UserFormState>>;
  onSubmit: () => void;
};

const EditUserModal = ({
  isOpen,
  isSubmitting,
  formData,
  roleOptions,
  onClose,
  onChange,
  onSubmit,
}: Props) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Edit User</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" type="button" disabled={isSubmitting}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body space-y-4 pt-4">
          <div>
            <label className="pro-label">Full Name</label>
            <input
              type="text"
              name="edit-user-full-name"
              autoComplete="off"
              className="pro-input"
              value={formData.fullName}
              onChange={(e) => onChange((prev) => ({ ...prev, fullName: e.target.value }))}
            />
          </div>

          <div>
            <label className="pro-label">Email Address</label>
            <input
              type="email"
              name="edit-user-email"
              autoComplete="off"
              className="pro-input"
              value={formData.email}
              onChange={(e) => onChange((prev) => ({ ...prev, email: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="pro-label">Role</label>
              <select
                className="pro-select"
                value={formData.roleId}
                onChange={(e) => onChange((prev) => ({ ...prev, roleId: Number(e.target.value) }))}
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pro-label">Status</label>
              <select
                className="pro-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) =>
                  onChange((prev) => ({
                    ...prev,
                    isActive: e.target.value === 'active',
                  }))
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pro-modal-footer">
          <button onClick={onClose} className="btn btn-secondary" type="button" disabled={isSubmitting}>
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
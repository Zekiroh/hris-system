import { createPortal } from 'react-dom';
import { X, UserPlus } from 'lucide-react';
import type { UserFormState } from '../userManagement.shared';

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

const AddUserModal = ({
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
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Add New User</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" type="button" disabled={isSubmitting}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form
          autoComplete="off"
          onSubmit={handleSubmit}
          className="pro-modal-body space-y-4 pt-4"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="pro-label">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              name="admin-create-first-name"
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
              name="admin-create-middle-name"
              autoComplete="off"
              className="pro-input"
              value={formData.middleName || ''}
              onChange={(e) => {
                onClearError();
                onChange((prev) => ({ ...prev, middleName: e.target.value }));
              }}
            />
          </div>

          <div>
            <label className="pro-label">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              name="admin-create-last-name"
              autoComplete="off"
              className="pro-input"
              value={formData.lastName}
              onChange={(e) => {
                onClearError();
                onChange((prev) => ({ ...prev, lastName: e.target.value }));
              }}
            />
          </div>

          <div>
            <label className="pro-label">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="admin-create-email"
              autoComplete="off"
              className="pro-input"
              value={formData.email}
              onChange={(e) => {
                onClearError();
                onChange((prev) => ({ ...prev, email: e.target.value }));
              }}
            />
          </div>

          <div>
            <label className="pro-label">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="admin-create-password"
              autoComplete="new-password"
              className="pro-input"
              value={formData.password}
              onChange={(e) => {
                onClearError();
                onChange((prev) => ({ ...prev, password: e.target.value }));
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="pro-label">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="pro-select"
                value={formData.roleId}
                onChange={(e) => {
                  onClearError();
                  onChange((prev) => ({ ...prev, roleId: Number(e.target.value) }));
                }}
              >
                {roleOptions.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="pro-label">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="pro-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => {
                  onClearError();
                  onChange((prev) => ({
                    ...prev,
                    isActive: e.target.value === 'active',
                  }));
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pro-modal-footer">
            <button onClick={onClose} className="btn btn-secondary" type="button" disabled={isSubmitting}>
              Cancel
            </button>
            <button
              className="btn btn-primary flex items-center gap-2"
              type="submit"
              disabled={isSubmitting}
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AddUserModal;
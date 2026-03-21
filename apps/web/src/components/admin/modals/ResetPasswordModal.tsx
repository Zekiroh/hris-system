import { createPortal } from 'react-dom';
import { X, KeyRound } from 'lucide-react';
import type { PasswordResetState } from '../userManagement.shared';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  data: PasswordResetState;
  error: string | null;
  onClose: () => void;
  onClearError: () => void;
  onChange: React.Dispatch<React.SetStateAction<PasswordResetState>>;
  onSubmit: () => void;
};

const ResetPasswordModal = ({
  isOpen,
  isSubmitting,
  data,
  error,
  onClose,
  onClearError,
  onChange,
  onSubmit,
}: Props) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Reset Password</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" type="button" disabled={isSubmitting}>
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form
          autoComplete="off"
          onSubmit={(e) => e.preventDefault()}
          className="pro-modal-body space-y-4 pt-4"
        >
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Reset password for <span className="font-semibold text-gray-800">{data.fullName}</span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="pro-label">New Password</label>
            <input
              type="password"
              name="admin-reset-password"
              autoComplete="new-password"
              className="pro-input"
              placeholder="Minimum 8 characters"
              value={data.newPassword}
              onChange={(e) => {
                onClearError();
                onChange((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }));
              }}
            />
          </div>
        </form>

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
            <KeyRound className="w-4 h-4" />
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ResetPasswordModal;
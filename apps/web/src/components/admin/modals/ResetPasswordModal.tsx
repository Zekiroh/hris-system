import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, EyeOff, X, KeyRound } from 'lucide-react';
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
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setShowPassword(false);
    onClose();
  };

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>Reset Password</h3>

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
          className="pro-modal-body space-y-4 pt-4"
        >
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Reset password for{' '}
            <span className="font-semibold text-gray-800">
              {data.fullName}
            </span>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="pro-label">New Password</label>

            <div className="relative">
              <input
                type="text"
                name="reset-user-access-code"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                inputMode="text"
                className="pro-input pr-11"
                style={
                  showPassword
                    ? undefined
                    : ({
                        WebkitTextSecurity: 'disc',
                      } as React.CSSProperties)
                }
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

              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
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
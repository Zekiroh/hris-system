import { createPortal } from 'react-dom';
import { X, Ban, CheckCircle } from 'lucide-react';
import type { StatusConfirmState } from '../../../../components/admin/userManagement.shared';

type Props = {
  isOpen: boolean;
  isSubmitting: boolean;
  data: StatusConfirmState;
  onClose: () => void;
  onSubmit: () => void;
};

const UserStatusModal = ({
  isOpen,
  isSubmitting,
  data,
  onClose,
  onSubmit,
}: Props) => {
  if (!isOpen) return null;

  const nextIsActive = !data.isActive;
  const title = nextIsActive ? 'Activate User' : 'Deactivate User';
  const actionLabel = nextIsActive ? 'Activate User' : 'Deactivate User';
  const Icon = nextIsActive ? CheckCircle : Ban;

  return createPortal(
    <div className="pro-modal-overlay z-[200]">
      <div className="pro-modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header border-b border-gray-100 pb-4">
          <h3>{title}</h3>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body space-y-4 pt-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Are you sure you want to {nextIsActive ? 'activate' : 'deactivate'}{' '}
            <span className="font-semibold text-gray-800">{data.fullName}</span>?
          </div>
        </div>

        <div className="pro-modal-footer">
          <button
            onClick={onClose}
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
            <Icon className="w-4 h-4" />
            {isSubmitting
              ? nextIsActive
                ? 'Activating...'
                : 'Deactivating...'
              : actionLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserStatusModal;

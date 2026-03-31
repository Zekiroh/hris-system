import type { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import {
  EmployeeFormFields,
  type FormData,
  type UserOption,
  type FieldErrors,
  type FormFieldName,
} from "./EmployeeFormFields";

type Props = {
  open: boolean;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  apiError: string | null;
  fieldErrors: FieldErrors;
  onClearFieldError: (field: FormFieldName) => void;
  loading: boolean;
  loadingUsers: boolean;
  userOptions: UserOption[];
  onClose: () => void;
  onSubmit: () => void;
  onLinkedUserChange: (userId: string) => void | Promise<void>;
};

export function EmployeeAddModal({
  open,
  formData,
  setFormData,
  apiError,
  fieldErrors,
  onClearFieldError,
  loading,
  loadingUsers,
  userOptions,
  onClose,
  onSubmit,
  onLinkedUserChange,
}: Props) {
  if (!open) return null;

  return createPortal(
    <div
      className="pro-modal-overlay"
      onClick={() => {
        if (!loading) onClose();
      }}
    >
      <div className="pro-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Add New Employee</h3>
          <button
            onClick={onClose}
            className="btn-ghost btn-icon"
            type="button"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body">
          <EmployeeFormFields
            mode="add"
            formData={formData}
            setFormData={setFormData}
            apiError={apiError}
            fieldErrors={fieldErrors}
            onClearFieldError={onClearFieldError}
            loading={loading}
            isSubmitDisabled={loading}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel={loading ? "Adding..." : "Add Employee"}
            userOptions={userOptions}
            loadingUsers={loadingUsers}
            onLinkedUserChange={onLinkedUserChange}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
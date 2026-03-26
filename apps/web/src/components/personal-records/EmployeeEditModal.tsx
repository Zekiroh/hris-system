import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import { EmployeeFormFields, type FormData } from "./EmployeeFormFields";

type Props = {
  open: boolean;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  apiError: string | null;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function EmployeeEditModal({
  open,
  formData,
  setFormData,
  apiError,
  loading,
  onClose,
  onSubmit,
}: Props) {
  if (!open) return null;

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Edit Employee</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" type="button">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body">
          <EmployeeFormFields
            mode="edit"
            formData={formData}
            setFormData={setFormData}
            apiError={apiError}
            loading={loading}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel="Save Changes"
          />
        </div>
      </div>
    </div>
  );
}
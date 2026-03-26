import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";
import {
  EmployeeFormFields,
  type FormData,
  type UserOption,
} from "./EmployeeFormFields";

type Props = {
  open: boolean;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  apiError: string | null;
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
  loading,
  loadingUsers,
  userOptions,
  onClose,
  onSubmit,
  onLinkedUserChange,
}: Props) {
  if (!open) return null;

  return (
    <div className="pro-modal-overlay">
      <div className="pro-modal max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="pro-modal-header">
          <h3>Add New Employee</h3>
          <button onClick={onClose} className="btn-ghost btn-icon" type="button">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="pro-modal-body">
          <EmployeeFormFields
            mode="add"
            formData={formData}
            setFormData={setFormData}
            apiError={apiError}
            loading={loading}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLabel="Add Employee"
            userOptions={userOptions}
            loadingUsers={loadingUsers}
            onLinkedUserChange={onLinkedUserChange}
          />
        </div>
      </div>
    </div>
  );
}
import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { toast } from "sonner";

import {
  EmployeeFormFields,
  type FormData,
  type EmployeeFormSection,
  type FieldErrors,
  type FormFieldName,
} from "./EmployeeFormFields";
import { EmployeeDocumentsPanel } from "./EmployeeDocumentsPanel";
import { EMPLOYEE_TABS, type EmployeeTabKey } from "./employeeTabs";
import { useEmployeeDocuments } from "../../pages/personal-records/hooks/useEmployeeDocuments";

type Props = {
  open: boolean;
  employeeId: string | null;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  apiError: string | null;
  fieldErrors: FieldErrors;
  onClearFieldError: (field: FormFieldName) => void;
  loading: boolean;
  isSubmitDisabled?: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function EmployeeEditModal({
  open,
  employeeId,
  formData,
  setFormData,
  apiError,
  fieldErrors,
  onClearFieldError,
  loading,
  isSubmitDisabled,
  onClose,
  onSubmit,
}: Props) {
  const [activeTabState, setActiveTabState] =
    useState<EmployeeTabKey>("personal");

  const isGovernmentApiError = useMemo(() => {
    return (
      apiError === "DUPLICATE_SSS" ||
      apiError === "DUPLICATE_PHILHEALTH" ||
      apiError === "DUPLICATE_PAGIBIG" ||
      apiError === "DUPLICATE_TIN" ||
      apiError === "SSS number already exists." ||
      apiError === "PhilHealth number already exists." ||
      apiError === "Pag-IBIG number already exists." ||
      apiError === "TIN already exists."
    );
  }, [apiError]);

  const hasGovernmentFieldError = useMemo(() => {
    return Boolean(
      fieldErrors.sssNumber ||
        fieldErrors.philHealthNumber ||
        fieldErrors.pagIbigNumber ||
        fieldErrors.tinNumber
    );
  }, [fieldErrors]);

  const activeTab: EmployeeTabKey = !open
    ? "personal"
    : isGovernmentApiError || hasGovernmentFieldError
      ? "government"
      : activeTabState;

  const {
    documents,
    documentsLoading,
    documentsError,
    uploading,
    deletingDocumentId,
    downloadingDocumentId,
    selectedDocumentType,
    setSelectedDocumentType,
    upload,
    download,
    remove,
  } = useEmployeeDocuments(employeeId, open && activeTab === "documents", {
    onUploadSuccess: (message) => toast.success(message),
    onUploadError: (message) => toast.error(message),
    onDownloadSuccess: (message) => toast.success(message),
    onDownloadError: (message) => toast.error(message),
    onDeleteSuccess: (message) => toast.success(message),
    onDeleteError: (message) => toast.error(message),
  });

  if (!open) return null;

  const handleClose = () => {
    setActiveTabState("personal");
    onClose();
  };

  const handleTabChange = (tab: EmployeeTabKey) => {
    setActiveTabState(tab);
  };

  const sectionMap: Record<
    Exclude<EmployeeTabKey, "documents">,
    EmployeeFormSection
  > = {
    personal: "personal",
    employment: "employment",
    government: "government",
  };

  return createPortal(
    <div className="pro-modal-overlay">
      <div
        className="pro-modal max-w-2xl h-[580px] max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pro-modal-header shrink-0">
          <h3>Edit Employee</h3>
          <button
            onClick={handleClose}
            className="btn-ghost btn-icon"
            type="button"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="border-b px-6 pt-2 shrink-0">
          <div className="flex gap-6 text-sm font-medium">
            {EMPLOYEE_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`pb-2 ${
                  activeTab === tab.key
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500"
                }`}
                onClick={() => handleTabChange(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pro-modal-body flex-1 min-h-0">
          {activeTab !== "documents" && (
            <div className="h-full">
              <EmployeeFormFields
                mode="edit"
                formData={formData}
                setFormData={setFormData}
                apiError={apiError}
                fieldErrors={fieldErrors}
                onClearFieldError={onClearFieldError}
                loading={loading}
                isSubmitDisabled={isSubmitDisabled}
                onCancel={handleClose}
                onSubmit={onSubmit}
                submitLabel="Save Changes"
                section={sectionMap[activeTab]}
              />
            </div>
          )}

          {activeTab === "documents" && (
            <div className="h-full overflow-y-auto pr-1">
              <EmployeeDocumentsPanel
                employeeId={employeeId}
                documents={documents}
                documentsLoading={documentsLoading}
                documentsError={documentsError}
                uploading={uploading}
                downloadingDocumentId={downloadingDocumentId}
                deletingDocumentId={deletingDocumentId}
                selectedDocumentType={selectedDocumentType}
                onSelectedDocumentTypeChange={setSelectedDocumentType}
                onUpload={upload}
                onDownload={download}
                onDelete={remove}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
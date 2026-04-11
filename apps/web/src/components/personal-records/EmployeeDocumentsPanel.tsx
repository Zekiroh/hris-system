import { useRef, useState } from "react";
import {
  Download,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import type {
  EmployeeDocumentDto,
  EmployeeDocumentType,
} from "../../lib/employees";
import { EMPLOYEE_DOCUMENT_TYPES } from "../../lib/employees";
import { DropdownMenu } from "./EmployeeFormFields";
import { useAuth } from "../../context/AuthContext";

type Props = {
  employeeId: string | null;
  documents: EmployeeDocumentDto[];
  documentsLoading: boolean;
  documentsError: string | null;
  uploading: boolean;
  downloadingDocumentId: string | null;
  deletingDocumentId: string | null;
  selectedDocumentType: EmployeeDocumentType;
  onSelectedDocumentTypeChange: (value: EmployeeDocumentType) => void;
  onUpload: (file: File) => void | Promise<void>;
  onDownload: (doc: EmployeeDocumentDto) => void | Promise<void>;
  onDelete: (documentId: string) => void | Promise<void>;
  readOnly?: boolean;
  onPreviewSelect?: (doc: EmployeeDocumentDto) => void | Promise<void>;
  activeDocumentId?: string | null;
};

function getDocumentTypeLabel(doc: EmployeeDocumentDto): string {
  return doc.documentType?.trim() || "Document";
}

function parseUtcDate(value?: string | null): Date | null {
  if (!value?.trim()) return null;

  const raw = value.trim();

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(raw)) {
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const assumedUtc = raw.includes("T")
    ? `${raw}Z`
    : raw.replace(" ", "T") + "Z";

  const parsed = new Date(assumedUtc);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatUploadedDate(date?: string | null): string {
  const parsed = parseUtcDate(date);
  if (!parsed) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Manila",
  }).format(parsed);
}

function formatFileSize(bytes?: number | null): string | null {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes < 0) {
    return null;
  }

  if (bytes < 1024) return `${bytes} B`;

  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb >= 100 ? 0 : 1)} KB`;

  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb >= 100 ? 0 : 1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(gb >= 100 ? 0 : 1)} GB`;
}

function getFriendlyFileType(
  contentType?: string | null,
  fileName?: string | null
): string {
  const normalizedContentType = contentType?.trim().toLowerCase() ?? "";
  const normalizedFileName = fileName?.trim().toLowerCase() ?? "";

  if (
    normalizedContentType === "application/pdf" ||
    normalizedFileName.endsWith(".pdf")
  ) {
    return "PDF Document";
  }

  if (
    normalizedContentType === "image/png" ||
    normalizedFileName.endsWith(".png")
  ) {
    return "PNG Image";
  }

  if (
    normalizedContentType === "image/jpeg" ||
    normalizedContentType === "image/jpg" ||
    normalizedFileName.endsWith(".jpg") ||
    normalizedFileName.endsWith(".jpeg")
  ) {
    return "JPG Image";
  }

  if (
    normalizedContentType === "image/webp" ||
    normalizedFileName.endsWith(".webp")
  ) {
    return "WEBP Image";
  }

  if (
    normalizedContentType === "image/gif" ||
    normalizedFileName.endsWith(".gif")
  ) {
    return "GIF Image";
  }

  if (
    normalizedContentType === "application/msword" ||
    normalizedFileName.endsWith(".doc")
  ) {
    return "Word Document";
  }

  if (
    normalizedContentType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    normalizedFileName.endsWith(".docx")
  ) {
    return "Word Document";
  }

  if (
    normalizedContentType === "application/vnd.ms-excel" ||
    normalizedFileName.endsWith(".xls")
  ) {
    return "Excel Spreadsheet";
  }

  if (
    normalizedContentType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    normalizedFileName.endsWith(".xlsx")
  ) {
    return "Excel Spreadsheet";
  }

  if (
    normalizedContentType === "text/plain" ||
    normalizedFileName.endsWith(".txt")
  ) {
    return "Text File";
  }

  if (!normalizedContentType) {
    return "Document";
  }

  return (
    normalizedContentType
      .split("/")
      .pop()
      ?.replace(/[-_]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()) || "Document"
  );
}

function getDocumentMeta(doc: EmployeeDocumentDto): string {
  const friendlyType = getFriendlyFileType(doc.contentType, doc.fileName);
  const formattedSize = formatFileSize(doc.fileSizeBytes);

  return formattedSize ? `${friendlyType} • ${formattedSize}` : friendlyType;
}

export function EmployeeDocumentsPanel({
  documents,
  documentsLoading,
  documentsError,
  uploading,
  downloadingDocumentId,
  deletingDocumentId,
  selectedDocumentType,
  onSelectedDocumentTypeChange,
  onUpload,
  onDownload,
  onDelete,
  readOnly = false,
  onPreviewSelect,
  activeDocumentId = null,
}: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] =
    useState<EmployeeDocumentDto | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const canDeleteDocuments = !readOnly && user?.role === "SUPER_ADMIN";

  const documentTypeOptions = EMPLOYEE_DOCUMENT_TYPES.map((type) => ({
    label: type,
    value: type,
  }));

  const handleChooseFile = () => {
    if (readOnly || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await onUpload(file);
    e.target.value = "";
  };

  const handleDeleteClick = (doc: EmployeeDocumentDto) => {
    if (!canDeleteDocuments) return;
    setPendingDeleteDoc(doc);
  };

  const handleCancelDelete = () => {
    if (deletingDocumentId) return;
    setPendingDeleteDoc(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDeleteDoc || !canDeleteDocuments) return;

    try {
      await onDelete(pendingDeleteDoc.id);
      setPendingDeleteDoc(null);
    } catch {
      // parent hook already handles error toast
    }
  };

  const isConfirmDeleting =
    !!pendingDeleteDoc && deletingDocumentId === pendingDeleteDoc.id;

  return (
    <>
      <div className="space-y-4">
        {!readOnly && (
          <>
            <div className="overflow-visible">
              <DropdownMenu
                value={selectedDocumentType}
                options={documentTypeOptions}
                placeholder="Select document type"
                disabled={uploading}
                onSelect={(value) =>
                  onSelectedDocumentTypeChange(value as EmployeeDocumentType)
                }
              />
            </div>

            <div className="flex justify-center">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
              />

              <div
                onClick={handleChooseFile}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (readOnly || uploading) return;
                  setIsDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (readOnly || uploading) return;
                  setIsDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setIsDragActive(false);
                  }
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragActive(false);

                  if (readOnly || uploading) return;

                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;

                  await onUpload(file);
                }}
                className={`w-full max-w-xl rounded-xl border-2 border-dashed px-6 py-8 text-center transition ${
                  uploading
                    ? "cursor-not-allowed border-gray-200 bg-gray-50"
                    : isDragActive
                      ? "cursor-pointer border-green-400 bg-green-50"
                      : "cursor-pointer border-gray-300 bg-white hover:border-green-400 hover:bg-green-50"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    Uploading...
                  </div>
                ) : (
                  <>
                    <div className="mb-3 flex justify-center">
                      <Upload
                        className={`h-6 w-6 ${
                          isDragActive ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>

                    <p className="text-sm text-gray-600">
                      Drag and drop file here or{" "}
                      <span className="font-medium text-green-600">browse</span>
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Supports PDF, PNG, JPG
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {documentsError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {documentsError}
          </div>
        )}

        {documentsLoading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            Loading documents...
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No documents uploaded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const isDownloading = downloadingDocumentId === doc.id;
              const isDeleting = deletingDocumentId === doc.id;
              const isActive = activeDocumentId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                    isActive
                      ? "bg-green-50 ring-1 ring-green-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                        {getDocumentTypeLabel(doc)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-start gap-2">
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {doc.fileName}
                        </p>

                        <p className="text-xs text-gray-400">
                          {getDocumentMeta(doc)}
                        </p>

                        <p className="text-xs text-gray-400">
                          Uploaded {formatUploadedDate(doc.uploadedAtUtc)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center gap-3">
                    {readOnly && onPreviewSelect && (
                      <button
                        type="button"
                        className="btn-ghost btn-icon"
                        onClick={() => void onPreviewSelect(doc)}
                        title={isActive ? "Hide Preview" : "Preview"}
                      >
                        {isActive ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    )}

                    {!readOnly && (
                      <button
                        type="button"
                        className="btn-ghost btn-icon"
                        onClick={() => onDownload(doc)}
                        disabled={isDownloading}
                        title="Download"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : (
                          <Download className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    )}

                    {canDeleteDocuments && (
                      <button
                        type="button"
                        className="btn-ghost btn-icon"
                        onClick={() => handleDeleteClick(doc)}
                        disabled={isDeleting}
                        title="Delete"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingDeleteDoc && canDeleteDocuments && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
            <div className="border-b px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                Delete Document
              </h3>
            </div>

            <div className="px-6 py-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this document? This action
                cannot be undone.
              </p>

              <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                <p className="truncate text-sm font-medium text-gray-800">
                  {pendingDeleteDoc.fileName}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {getDocumentTypeLabel(pendingDeleteDoc)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelDelete}
                disabled={isConfirmDeleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void handleConfirmDelete()}
                disabled={isConfirmDeleting}
              >
                {isConfirmDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Download,
  Eye,
  Trash2,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";
import type {
  EmployeeDocumentDto,
  EmployeeDocumentType,
} from "../../../services/api/employees/employees";
import { EMPLOYEE_DOCUMENT_TYPES } from "../../../services/api/employees/employees";

type Props = {


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
  renderBetween?: React.ReactNode;
};

type DocumentTypeDropdownProps = {
  value: EmployeeDocumentType;
  options: readonly EmployeeDocumentType[];
  disabled?: boolean;
  onSelect: (value: EmployeeDocumentType) => void;
};

export function DocumentTypeDropdown({
  value,
  options,
  disabled,
  onSelect,
}: DocumentTypeDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    Math.max(0, options.indexOf(value))
  );
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const listboxId = "employee-document-type-listbox";

  const getSelectedIndex = () => {
    const selectedIndex = options.indexOf(value);
    return selectedIndex >= 0 ? selectedIndex : 0;
  };

  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setMenuPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  };

  const focusHighlightedOption = (index: number) => {
    window.requestAnimationFrame(() => {
      optionRefs.current[index]?.focus();
    });
  };

  const openMenu = (index = getSelectedIndex()) => {
    if (disabled) return;

    updateMenuPosition();
    setHighlightedIndex(index);
    setOpen(true);
    focusHighlightedOption(index);
  };

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  };

  const handleToggle = () => {
    if (disabled) return;

    if (open) {
      closeMenu();
      return;
    }

    openMenu();
  };

  const handleSelect = useCallback(
    (selectedValue: EmployeeDocumentType) => {
      onSelect(selectedValue);
      closeMenu(true);
    },
    [onSelect]
  );

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>
  ) => {
    if (disabled) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(getSelectedIndex());
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(options.length - 1);
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleToggle();
    }
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setHighlightedIndex((current) => {
          const nextIndex = current >= options.length - 1 ? 0 : current + 1;
          focusHighlightedOption(nextIndex);
          return nextIndex;
        });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setHighlightedIndex((current) => {
          const nextIndex = current <= 0 ? options.length - 1 : current - 1;
          focusHighlightedOption(nextIndex);
          return nextIndex;
        });
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        setHighlightedIndex(0);
        focusHighlightedOption(0);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        const lastIndex = options.length - 1;
        setHighlightedIndex(lastIndex);
        focusHighlightedOption(lastIndex);
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const selectedOption = options[highlightedIndex];

        if (selectedOption) {
          handleSelect(selectedOption);
        }
      }
    };

    const handleWindowChange = () => {
      updateMenuPosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [highlightedIndex, open, options, handleSelect]);

  useEffect(() => {
    if (!open) {
      optionRefs.current = [];
    }
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left text-sm transition ${
          open
            ? "border-green-500 ring-2 ring-green-500/10"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span className="truncate text-gray-700">{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            aria-label="Document type options"
            className="fixed z-[9999] overflow-hidden rounded-xl border border-gray-200 bg-white py-2 shadow-xl"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option}
                  ref={(element) => {
                    optionRefs.current[index] = element;
                  }}
                  type="button"
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={isHighlighted ? 0 : -1}
                  className={`block w-full px-4 py-3 text-left text-sm transition ${
                    isSelected
                      ? "bg-green-50 font-medium text-green-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(option)}
                >
                  {option}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

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
  renderBetween,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingDeleteDoc, setPendingDeleteDoc] =
    useState<EmployeeDocumentDto | null>(null);

  const canModify = !readOnly;

  const handleFileSelect = (file: File | null | undefined) => {
    if (!file || !canModify || uploading) return;
    void onUpload(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    handleFileSelect(event.dataTransfer.files?.[0]);
  };

  const handleDownload = (doc: EmployeeDocumentDto) => {
    void onDownload(doc);
  };

  const handlePreview = (doc: EmployeeDocumentDto) => {
    if (onPreviewSelect) {
      void onPreviewSelect(doc);
      return;
    }

    void onDownload(doc);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteDoc) return;
    void onDelete(pendingDeleteDoc.id);
    setPendingDeleteDoc(null);
  };

  return (
    <>
      <div className="space-y-4">
        {documentsError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {documentsError}
          </div>
        ) : null}

        {canModify ? (
          <div className="space-y-4">
            <DocumentTypeDropdown
              value={selectedDocumentType}
              options={EMPLOYEE_DOCUMENT_TYPES}
              disabled={uploading}
              onSelect={onSelectedDocumentTypeChange}
            />

            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
                uploading
                  ? "cursor-wait border-gray-200 bg-gray-50 text-gray-400"
                  : "border-gray-300 bg-white text-gray-500 hover:border-green-500 hover:bg-green-50"
              }`}
            >
              {uploading ? (
                <Loader2 className="mb-3 h-6 w-6 animate-spin text-green-600" />
              ) : (
                <Upload className="mb-3 h-6 w-6 text-gray-400" />
              )}

              <span className="text-sm">
                {uploading ? (
                  "Uploading document..."
                ) : (
                  <>
                    Drag and drop file here or{" "}
                    <span className="font-semibold text-green-600">
                      browse
                    </span>
                  </>
                )}
              </span>
              <span className="mt-1 text-xs text-gray-400">
                Supports PDF, PNG, JPG
              </span>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg"
                disabled={uploading}
                onChange={(event) => handleFileSelect(event.target.files?.[0])}
              />
            </label>
          </div>
        ) : null}

        {renderBetween ?? null}

        {documentsLoading ? ( 
          <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              const typeLabel = getDocumentTypeLabel(doc);
              const meta = getDocumentMeta(doc);

              return (
                <div
                  key={doc.id}
                  className={`rounded-xl border bg-white p-4 transition ${
                    isActive
                      ? "border-green-300 ring-2 ring-green-500/10"
                      : "border-gray-100 hover:border-green-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {doc.fileName || typeLabel}
                        </p>
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          {typeLabel}
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-gray-500">{meta}</p>
                      <p className="mt-1 text-xs text-gray-400">
                        Uploaded {formatUploadedDate(doc.uploadedAtUtc)}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePreview(doc)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                        title="Preview document"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        disabled={isDownloading}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-wait disabled:opacity-60"
                        title="Download document"
                      >
                        {isDownloading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>

                      {canModify ? (
                        <button
                          type="button"
                          onClick={() => setPendingDeleteDoc(doc)}
                          disabled={isDeleting}
                          className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-wait disabled:opacity-60"
                          title="Delete document"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pendingDeleteDoc ? (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900">
              Delete Document
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">
                {pendingDeleteDoc.fileName ||
                  getDocumentTypeLabel(pendingDeleteDoc)}
              </span>
              ?
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDeleteDoc(null)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingDocumentId === pendingDeleteDoc.id}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                {deletingDocumentId === pendingDeleteDoc.id ? (
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
      ) : null}
    </>
  );
}
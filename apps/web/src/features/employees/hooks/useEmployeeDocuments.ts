import { useEffect, useRef, useState } from "react";
import type {
  EmployeeDocumentDto,
  EmployeeDocumentType,
} from "../../../services/api/employees/employees";
import {
  getEmployeeDocuments,
  uploadEmployeeDocument,
  downloadEmployeeDocument,
  deleteEmployeeDocument,
} from "../../../services/api/employees/employeeDocuments";
import { normalizeDocumentError } from "../../../lib/employeeErrorHelpers";
import { validateDocumentFile } from "../../../lib/documentValidation";

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

type UseEmployeeDocumentsOptions = {
  onUploadSuccess?: (message: string) => void;
  onUploadError?: (message: string) => void;
  onDownloadSuccess?: (message: string) => void;
  onDownloadError?: (message: string) => void;
  onDeleteSuccess?: (message: string) => void;
  onDeleteError?: (message: string) => void;
};

type DocumentPreviewPayload = {
  url: string;
  contentType: string;
  fileName: string;
};

export function useEmployeeDocuments(
  employeeId: string | null,
  enabled: boolean,
  options?: UseEmployeeDocumentsOptions
) {
  const [documents, setDocuments] = useState<EmployeeDocumentDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(
    null
  );
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<
    string | null
  >(null);
  const [selectedDocumentType, setSelectedDocumentType] =
    useState<EmployeeDocumentType>("Contract");

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setDocuments([]);
      setDocumentsError(null);
      setDocumentsLoading(false);
      setUploading(false);
      setDeletingDocumentId(null);
      setDownloadingDocumentId(null);
      setSelectedDocumentType("Contract");
    }
  }, [enabled]);

  async function refreshDocuments() {
    if (!employeeId) return;

    const requestId = ++requestIdRef.current;
    setDocumentsLoading(true);
    setDocumentsError(null);

    try {
      const res = await getEmployeeDocuments(employeeId);
      const payload = unwrapData<EmployeeDocumentDto[]>(res);

      if (requestId !== requestIdRef.current) return;

      setDocuments(Array.isArray(payload) ? payload : []);
    } catch (e) {
      if (requestId !== requestIdRef.current) return;

      const rawMessage =
        e instanceof Error ? e.message : "Failed to load documents";
      setDocuments([]);
      setDocumentsError(normalizeDocumentError(rawMessage, "list"));
    } finally {
      if (requestId === requestIdRef.current) {
        setDocumentsLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!enabled || !employeeId) return;

    void refreshDocuments();
  }, [enabled, employeeId]);

  async function handleUpload(file: File) {
    if (!employeeId) return;

    const validationError = validateDocumentFile(file);
    if (validationError) {
      setDocumentsError(validationError);
      options?.onUploadError?.(validationError);
      return;
    }

    setUploading(true);
    setDocumentsError(null);

    try {
      await uploadEmployeeDocument(employeeId, file, selectedDocumentType);
      await refreshDocuments();

      const successMessage = "Document uploaded.";
      options?.onUploadSuccess?.(successMessage);
    } catch (e) {
      const rawMessage =
        e instanceof Error ? e.message : "Failed to upload document";
      const normalized = normalizeDocumentError(rawMessage, "upload");

      setDocumentsError(normalized);
      options?.onUploadError?.(normalized);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(doc: EmployeeDocumentDto) {
    if (!employeeId) return;

    setDownloadingDocumentId(doc.id);
    setDocumentsError(null);

    try {
      const response = await downloadEmployeeDocument(employeeId, doc.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.URL.revokeObjectURL(url);

      const successMessage = "Download started.";
      options?.onDownloadSuccess?.(successMessage);
    } catch (e) {
      const rawMessage =
        e instanceof Error ? e.message : "Failed to download document";
      const normalized = normalizeDocumentError(rawMessage, "download");

      setDocumentsError(normalized);
      options?.onDownloadError?.(normalized);
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  async function getPreviewPayload(
    doc: EmployeeDocumentDto
  ): Promise<DocumentPreviewPayload | null> {
    if (!employeeId) return null;

    try {
      const response = await downloadEmployeeDocument(employeeId, doc.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      return {
        url,
        contentType: doc.contentType || blob.type || "",
        fileName: doc.fileName,
      };
    } catch {
      return null;
    }
  }

  async function handleDelete(documentId: string) {
    if (!employeeId) return;

    setDeletingDocumentId(documentId);
    setDocumentsError(null);

    try {
      await deleteEmployeeDocument(employeeId, documentId);
      await refreshDocuments();

      const successMessage = "Document deleted.";
      options?.onDeleteSuccess?.(successMessage);
    } catch (e) {
      const rawMessage =
        e instanceof Error ? e.message : "Failed to delete document";
      const normalized = normalizeDocumentError(rawMessage, "delete");

      setDocumentsError(normalized);
      options?.onDeleteError?.(normalized);
    } finally {
      setDeletingDocumentId(null);
    }
  }

  return {
    documents,
    documentsLoading,
    documentsError,
    uploading,
    deletingDocumentId,
    downloadingDocumentId,
    selectedDocumentType,
    setSelectedDocumentType,
    refreshDocuments,
    upload: handleUpload,
    download: handleDownload,
    remove: handleDelete,
    getPreviewPayload,
  };
}
import { useState, useEffect } from "react";
import { API_BASE_URL, apiRequest } from "../../../services/api/client";
import { getAuthToken } from "../../../services/api/employees/employeeDocuments";
import { normalizeDocumentError } from "../utils/employeeErrorHelpers";
import { validateDocumentFile } from "../utils/documentValidation";
import type {
  EmployeeDocumentDto,
  EmployeeDocumentType,
} from "../../../services/api/employees/employees";

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

type UseMyDocumentsOptions = {
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

async function fetchMyDocuments(): Promise<EmployeeDocumentDto[]> {
  const res = await apiRequest<EmployeeDocumentDto[]>("/employees/me/documents");
  return unwrapData<EmployeeDocumentDto[]>(res);
}

async function uploadMyDocument(file: File, documentType: EmployeeDocumentType): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);
  await apiRequest<void>("/employees/me/documents", {
    method: "POST",
    body: formData,
  });
}

async function downloadMyDocument(documentId: string): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(
    `${API_BASE_URL}/employees/me/documents/${documentId}`,
    { method: "GET", headers }
  );

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response;
}

async function deleteMyDocument(documentId: string): Promise<void> {
  await apiRequest<void>(`/employees/me/documents/${documentId}`, {
    method: "DELETE",
  });
}

export function useMyDocuments(
  enabled: boolean,
  options?: UseMyDocumentsOptions
) {
  const [documents, setDocuments] = useState<EmployeeDocumentDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [downloadingDocumentId, setDownloadingDocumentId] = useState<string | null>(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState<EmployeeDocumentType>("Contract");

  useEffect(() => {
    if (!enabled) return;
    void refreshDocuments();
  }, [enabled]);

  async function refreshDocuments() {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const data = await fetchMyDocuments();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to load documents";
      setDocuments([]);
      setDocumentsError(normalizeDocumentError(raw, "list"));
    } finally {
      setDocumentsLoading(false);
    }
  }

  async function handleUpload(file: File) {
    const validationError = validateDocumentFile(file);
    if (validationError) {
      setDocumentsError(validationError);
      options?.onUploadError?.(validationError);
      return;
    }
    setUploading(true);
    setDocumentsError(null);
    try {
      await uploadMyDocument(file, selectedDocumentType);
      await refreshDocuments();
      options?.onUploadSuccess?.("Document uploaded.");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to upload document";
      const normalized = normalizeDocumentError(raw, "upload");
      setDocumentsError(normalized);
      options?.onUploadError?.(normalized);
    } finally {
      setUploading(false);
    }
  }

  async function handleDownload(doc: EmployeeDocumentDto) {
    setDownloadingDocumentId(doc.id);
    setDocumentsError(null);
    try {
      const response = await downloadMyDocument(doc.id);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = doc.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      options?.onDownloadSuccess?.("Download started.");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to download document";
      const normalized = normalizeDocumentError(raw, "download");
      setDocumentsError(normalized);
      options?.onDownloadError?.(normalized);
    } finally {
      setDownloadingDocumentId(null);
    }
  }

  async function getPreviewPayload(
    doc: EmployeeDocumentDto
  ): Promise<DocumentPreviewPayload | null> {
    try {
      const response = await downloadMyDocument(doc.id);
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
    setDeletingDocumentId(documentId);
    setDocumentsError(null);
    try {
      await deleteMyDocument(documentId);
      await refreshDocuments();
      options?.onDeleteSuccess?.("Document deleted.");
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Failed to delete document";
      const normalized = normalizeDocumentError(raw, "delete");
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

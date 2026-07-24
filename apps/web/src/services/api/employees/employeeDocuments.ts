import { API_BASE_URL, apiRequest } from "../client";
import {
  extractApiError,
  type EmployeeDocumentDto,
  type EmployeeDocumentType,
} from "./employees";

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

export function getAuthToken(): string | null {
  const directLocalToken = localStorage.getItem("auth.token");
  if (directLocalToken) return directLocalToken;

  const directSessionToken = sessionStorage.getItem("auth.token");
  if (directSessionToken) return directSessionToken;

  const localAuthRaw = localStorage.getItem("auth");
  if (localAuthRaw) {
    try {
      const parsed = JSON.parse(localAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed local auth payload
    }
  }

  const sessionAuthRaw = sessionStorage.getItem("auth");
  if (sessionAuthRaw) {
    try {
      const parsed = JSON.parse(sessionAuthRaw) as { token?: string };
      if (parsed?.token) return parsed.token;
    } catch {
      // ignore malformed session auth payload
    }
  }

  return null;
}

function extractMessageFromResponseText(text: string, status: number): string {
  const message = `Request failed (${status})`;

  try {
    const json = JSON.parse(text) as {
      message?: string;
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    if (typeof json?.message === "string" && json.message.trim()) {
      return json.message.trim();
    }

    if (json?.errors && typeof json.errors === "object") {
      const firstErrorGroup = Object.values(json.errors).find(
        (value) => Array.isArray(value) && value.length > 0
      );

      if (firstErrorGroup?.[0]?.trim()) {
        return firstErrorGroup[0].trim();
      }
    }

    if (typeof json?.detail === "string" && json.detail.trim()) {
      return json.detail.trim();
    }

    if (typeof json?.title === "string" && json.title.trim()) {
      return json.title.trim();
    }
  } catch {
    if (text.trim()) {
      return text.trim();
    }
  }

  return message;
}

function preserveApiError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }

  throw new Error(extractApiError(error));
}

async function withApiErrorHandling<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    preserveApiError(error);
  }
}

export function getEmployeeDocuments(employeeId: string) {
  return apiRequest<EmployeeDocumentDto[] | ApiEnvelope<EmployeeDocumentDto[]>>(
    `/employees/${employeeId}/documents`
  );
}

export async function uploadEmployeeDocument(
  employeeId: string,
  file: File,
  documentType: EmployeeDocumentType
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  return withApiErrorHandling(
    apiRequest<void>(`/employees/${employeeId}/documents`, {
      method: "POST",
      body: formData,
    })
  );
}

export async function downloadEmployeeDocument(
  employeeId: string,
  documentId: string
) {
  const token = getAuthToken();

  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(
    `${API_BASE_URL}/employees/${employeeId}/documents/${documentId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(extractMessageFromResponseText(text, response.status));
  }

  return response;
}

export async function deleteEmployeeDocument(
  employeeId: string,
  documentId: string
) {
  return withApiErrorHandling(
    apiRequest<void>(`/employees/${employeeId}/documents/${documentId}`, {
      method: "DELETE",
    })
  );
}

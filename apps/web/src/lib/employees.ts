import { apiRequest } from "./api";
import { emitEmployeeStatsChanged } from "./events/employeeEvents";

export type EmployeeStatus = "Active" | "Inactive";
export type EmploymentType = "Regular" | "Probationary" | "Project-based";
export type EmployeeSortBy = "latest" | "oldest" | "name";

export const EMPLOYEE_DOCUMENT_TYPES = [
  "SSS",
  "PhilHealth",
  "Pag-IBIG",
  "TIN",
  "Contract",
  "Government ID",
  "Resume",
  "Other",
] as const;

export type EmployeeDocumentType = (typeof EMPLOYEE_DOCUMENT_TYPES)[number];

export type EmployeeDocumentDto = {
  id: string;
  fileName: string;
  contentType: string;
  uploadedAtUtc: string;
  documentType?: string | null;
  fileSizeBytes?: number | null;
};

export type EmployeeDto = {
  id: string;
  employeeNumber: string;

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  suffix: string | null;

  birthDate: string | null;
  sex: string | null;
  civilStatus: string | null;

  dateHired: string | null;
  employmentType: string | null;

  department: string | null;
  position: string | null;

  contactNumber: string | null;
  email: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;

  sssNumber: string | null;
  philHealthNumber: string | null;
  pagIbigNumber: string | null;
  tinNumber: string | null;

  isActive: boolean;
  isNewHire: boolean;

  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  contact: string;
  email: string;
  hireDate: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  province: string;
  zipCode: string;
};

export type EmployeeSummaryDto = {
  total: number;
  active: number;
  inactive: number;
  newHires: number;
};

export type EmploymentTypeSummary = {
  regular: number;
  probationary: number;
  contract: number;
};

export type PagedEmployeesResponse = {
  items: EmployeeDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  summary: EmployeeSummaryDto;
};

export type GetEmployeesQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  isNewHire?: boolean;
  sortBy?: EmployeeSortBy;
  employmentType?: EmploymentType;
};

export type NextEmployeeNumberResponse = {
  employeeNumber: string;
};

export type CreateEmployeeRequest = {
  userId: number;
  employmentType: EmploymentType;

  department?: string;
  position?: string;
};

export type UpdateEmployeeRequest = {
  firstName: string;
  middleName?: string;
  lastName: string;

  birthDate?: string;
  sex?: string;
  civilStatus?: string;

  department?: string;
  position?: string;
  employmentType: EmploymentType;

  contactNumber?: string;
  email?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  zipCode?: string;

  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  tinNumber?: string;

  isActive: boolean;
};

type ApiEnvelope<T> = {
  data?: T;
  message?: string;
};

function unwrapApiData<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in (payload as Record<string, unknown>)
  ) {
    const data = (payload as ApiEnvelope<T>).data;
    return (data ?? payload) as T;
  }

  return payload as T;
}

function toDateOnly(value: string | undefined | null): string | undefined {
  if (!value) return undefined;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function normalizeOptional(v: string | undefined): string | undefined {
  const s = v?.trim();
  return s ? s : undefined;
}

function normalizeEmail(v: string | undefined): string | undefined {
  const s = v?.trim();
  return s ? s : undefined;
}

function normalizeStatus(v: unknown): EmployeeStatus {
  if (v === "Active" || v === "Inactive") return v;
  return "Active";
}

export function extractApiError(error: unknown): string {
  if (!error) return "Unexpected error";

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  const err = error as {
    response?: {
      data?: {
        message?: string;
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
      status?: number;
      statusText?: string;
    };
    message?: string;
  };

  const data = err.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const firstKey = Object.keys(data.errors)[0];
    const firstMessage = firstKey ? data.errors[firstKey]?.[0] : undefined;

    if (firstMessage?.trim()) {
      return firstMessage.trim();
    }
  }

  if (typeof data?.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (typeof data?.detail === "string" && data.detail.trim()) {
    return data.detail.trim();
  }

  if (typeof data?.title === "string" && data.title.trim()) {
    return data.title.trim();
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message.trim();
  }

  if (typeof err.response?.status === "number") {
    return `Request failed (${err.response.status})`;
  }

  return "Unknown error";
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

export type EmployeeWriteExtras = {
  status?: EmployeeStatus;
};

export function getEmployees(q: GetEmployeesQuery) {
  const params = new URLSearchParams();

  if (typeof q.page === "number") params.set("page", String(q.page));
  if (typeof q.pageSize === "number") {
    params.set("pageSize", String(q.pageSize));
  }
  if (q.search && q.search.trim()) params.set("search", q.search.trim());
  if (typeof q.isActive === "boolean") {
    params.set("isActive", String(q.isActive));
  }
  if (typeof q.isNewHire === "boolean") {
    params.set("isNewHire", String(q.isNewHire));
  }
  if (q.sortBy) params.set("sortBy", q.sortBy);
  if (q.employmentType) params.set("employmentType", q.employmentType);

  const qs = params.toString();

  return apiRequest<PagedEmployeesResponse | ApiEnvelope<PagedEmployeesResponse>>(
    `/employees${qs ? `?${qs}` : ""}`
  );
}

export function getEmploymentTypeSummary() {
  return apiRequest<EmploymentTypeSummary>(
    "/employees/summary/employment-type"
  );
}

export function getEmployeeById(id: string) {
  return apiRequest<EmployeeDto | ApiEnvelope<EmployeeDto>>(`/employees/${id}`);
}

export async function getCurrentEmployee() {
  const response = await withApiErrorHandling(
    apiRequest<EmployeeDto | ApiEnvelope<EmployeeDto>>("/employees/me")
  );

  return unwrapApiData(response);
}

export function getNextEmployeeNumber() {
  return apiRequest<
    NextEmployeeNumberResponse | ApiEnvelope<NextEmployeeNumberResponse>
  >("/employees/next-number");
}

export async function createEmployee(data: CreateEmployeeRequest) {
  const payload = {
    userId: data.userId,
    employmentType: data.employmentType,
    department: normalizeOptional(data.department),
    position: normalizeOptional(data.position),
  };

  const response = await withApiErrorHandling(
    apiRequest<EmployeeDto | ApiEnvelope<EmployeeDto>>("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );

  const result = unwrapApiData(response);

  emitEmployeeStatsChanged();

  return result;
}

export async function updateEmployee(
  id: string,
  data: UpdateEmployeeRequest & EmployeeWriteExtras
) {
  const status = normalizeStatus((data as EmployeeWriteExtras).status);

  const payload = {
    firstName: data.firstName.trim(),
    middleName: normalizeOptional(data.middleName),
    lastName: data.lastName.trim(),

    birthDate: toDateOnly(data.birthDate),
    sex: normalizeOptional(data.sex),
    civilStatus: normalizeOptional(data.civilStatus),

    department: normalizeOptional(data.department),
    position: normalizeOptional(data.position),
    employmentType: data.employmentType,

    contactNumber: normalizeOptional(data.contactNumber),
    email: normalizeEmail(data.email),

    addressLine1: normalizeOptional(data.addressLine1),
    addressLine2: normalizeOptional(data.addressLine2),
    city: normalizeOptional(data.city),
    province: normalizeOptional(data.province),
    zipCode: normalizeOptional(data.zipCode),

    sssNumber: normalizeOptional(data.sssNumber),
    philHealthNumber: normalizeOptional(data.philHealthNumber),
    pagIbigNumber: normalizeOptional(data.pagIbigNumber),
    tinNumber: normalizeOptional(data.tinNumber),

    isActive: data.isActive,
    status,
  };

  const response = await withApiErrorHandling(
    apiRequest<EmployeeDto | ApiEnvelope<EmployeeDto>>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  );

  const result = unwrapApiData(response);

  emitEmployeeStatsChanged();

  return result;
}

export async function updateEmployeeStatus(id: string, isActive: boolean) {
  const response = await withApiErrorHandling(
    apiRequest<EmployeeDto | ApiEnvelope<EmployeeDto>>(
      `/employees/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }
    )
  );

  const result = unwrapApiData(response);

  emitEmployeeStatsChanged();

  return result;
}

export async function deleteEmployee(id: string) {
  const result = await withApiErrorHandling(
    apiRequest<void>(`/employees/${id}`, {
      method: "DELETE",
    })
  );

  emitEmployeeStatsChanged();

  return result;
}
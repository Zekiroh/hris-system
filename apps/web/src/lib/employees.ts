import { apiRequest } from "./api";

export type EmployeeStatus = "Active" | "On Leave" | "Inactive";

export type EmployeeDto = {
  id: string;
  employeeNumber: string;

  firstName: string | null;
  middleName: string | null;
  lastName: string | null;

  birthDate: string | null;
  sex: string | null;
  civilStatus: string | null;

  dateHired: string | null;

  department: string | null;
  position: string | null;

  contactNumber: string | null;
  email: string | null;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  province: string | null;
  zipCode: string | null;

  isActive: boolean;

  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type PagedEmployeesResponse = {
  items: EmployeeDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type GetEmployeesQuery = {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
};

export type CreateEmployeeRequest = {
  employeeNumber: string;

  firstName: string;
  middleName?: string;
  lastName: string;

  birthDate?: string;
  sex?: string;
  civilStatus?: string;

  dateHired?: string;

  department?: string;
  position?: string;

  contactNumber?: string;
  email?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  zipCode?: string;
};

export type UpdateEmployeeRequest = {
  firstName: string;
  middleName?: string;
  lastName: string;

  birthDate?: string;
  sex?: string;
  civilStatus?: string;

  dateHired?: string;

  department?: string;
  position?: string;

  contactNumber?: string;
  email?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  zipCode?: string;

  isActive: boolean;
};

// ---- helpers (integration fixes) ----

function toDateOnly(value: string | undefined | null): string | undefined {
  if (!value) return undefined;

  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // try ISO -> YYYY-MM-DD
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
  if (v === "Active" || v === "Inactive" || v === "On Leave") return v;
  return "Active";
}

// Backend 400 shows "status required". It’s not in your DTOs yet, so we
// accept it optionally from callers and always send it if present/needed.
export type EmployeeWriteExtras = {
  status?: EmployeeStatus;
};

// ---- API ----

export function getEmployees(q: GetEmployeesQuery) {
  const params = new URLSearchParams();

  if (typeof q.page === "number") params.set("page", String(q.page));
  if (typeof q.pageSize === "number") params.set("pageSize", String(q.pageSize));
  if (q.search && q.search.trim()) params.set("search", q.search.trim());
  if (typeof q.isActive === "boolean") params.set("isActive", String(q.isActive));

  const qs = params.toString();

  return apiRequest<PagedEmployeesResponse>(`/employees${qs ? `?${qs}` : ""}`);
}

export function getEmployeeById(id: string) {
  return apiRequest<EmployeeDto>(`/employees/${id}`);
}

export function createEmployee(data: CreateEmployeeRequest & EmployeeWriteExtras) {
  // Force DateOnly + required status
  const dateOnly = toDateOnly(data.dateHired) ?? toDateOnly(new Date().toISOString());
  const status = normalizeStatus((data as EmployeeWriteExtras).status);

  const payload = {
    employeeNumber: data.employeeNumber.trim(),

    firstName: data.firstName.trim(),
    middleName: normalizeOptional(data.middleName),
    lastName: data.lastName.trim(),

    birthDate: toDateOnly(data.birthDate), // DateOnly if provided
    sex: normalizeOptional(data.sex),
    civilStatus: normalizeOptional(data.civilStatus),

    dateHired: dateOnly, // YYYY-MM-DD

    department: normalizeOptional(data.department),
    position: normalizeOptional(data.position),

    contactNumber: normalizeOptional(data.contactNumber),
    email: normalizeEmail(data.email),

    addressLine1: normalizeOptional(data.addressLine1),
    addressLine2: normalizeOptional(data.addressLine2),
    city: normalizeOptional(data.city),
    province: normalizeOptional(data.province),
    zipCode: normalizeOptional(data.zipCode),

    status, // required by backend
  };

  return apiRequest<EmployeeDto>("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(id: string, data: UpdateEmployeeRequest & EmployeeWriteExtras) {
  const dateOnly = toDateOnly(data.dateHired); // allow unchanged if omitted
  const status = normalizeStatus((data as EmployeeWriteExtras).status);

  const payload = {
    firstName: data.firstName.trim(),
    middleName: normalizeOptional(data.middleName),
    lastName: data.lastName.trim(),

    birthDate: toDateOnly(data.birthDate),
    sex: normalizeOptional(data.sex),
    civilStatus: normalizeOptional(data.civilStatus),

    dateHired: dateOnly, // YYYY-MM-DD when present

    department: normalizeOptional(data.department),
    position: normalizeOptional(data.position),

    contactNumber: normalizeOptional(data.contactNumber),
    email: normalizeEmail(data.email),

    addressLine1: normalizeOptional(data.addressLine1),
    addressLine2: normalizeOptional(data.addressLine2),
    city: normalizeOptional(data.city),
    province: normalizeOptional(data.province),
    zipCode: normalizeOptional(data.zipCode),

    isActive: data.isActive,

    status, // keep backend happy if it enforces status on update too
  };

  return apiRequest<EmployeeDto>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function updateEmployeeStatus(id: string, isActive: boolean) {
  return apiRequest<EmployeeDto>(`/employees/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function deleteEmployee(id: string) {
  return apiRequest<void>(`/employees/${id}`, {
    method: "DELETE",
  });
}
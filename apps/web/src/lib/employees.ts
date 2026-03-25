import { apiRequest } from "./api";

export type EmployeeStatus = "Active" | "On Leave" | "Inactive";
export type EmploymentType = "Regular" | "Probationary" | "Project-based";

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

  isActive: boolean;

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

export type NextEmployeeNumberResponse = {
  employeeNumber: string;
};

export type CreateEmployeeRequest = {
  userId: number;
  employmentType: EmploymentType;

  department?: string;
  position?: string;

  contactNumber?: string;

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

  department?: string;
  position?: string;
  employmentType?: EmploymentType;

  contactNumber?: string;
  email?: string;

  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  zipCode?: string;

  isActive: boolean;
};

// ---- helpers ----

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
  if (v === "Active" || v === "Inactive" || v === "On Leave") return v;
  return "Active";
}

function normalizeEmploymentType(v: unknown): EmploymentType {
  if (v === "Regular" || v === "Probationary" || v === "Project-based") {
    return v;
  }
  return "Regular";
}

function buildEmployeeName(dto: EmployeeDto): string {
  const last = dto.lastName?.trim() ?? "";
  const first = dto.firstName?.trim() ?? "";
  const middle = dto.middleName?.trim() ?? "";

  if (last && first && middle) return `${last}, ${first} ${middle}`;
  if (last && first) return `${last}, ${first}`;
  return [first, middle, last].filter(Boolean).join(" ") || "—";
}

export function mapEmployeeDtoToEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto.id,
    employeeId: dto.employeeNumber,
    name: buildEmployeeName(dto),
    position: dto.position ?? "",
    department: dto.department ?? "",
    status: dto.isActive ? "Active" : "Inactive",
    employmentType: normalizeEmploymentType(dto.employmentType),
    contact: dto.contactNumber ?? "",
    email: dto.email ?? "",
    hireDate: dto.dateHired ?? "",
    addressLine1: dto.addressLine1 ?? "",
    addressLine2: dto.addressLine2 ?? "",
    city: dto.city ?? "",
    province: dto.province ?? "",
    zipCode: dto.zipCode ?? "",
  };
}

export type EmployeeWriteExtras = {
  status?: EmployeeStatus;
};

// ---- API ----

export function getEmployees(q: GetEmployeesQuery) {
  const params = new URLSearchParams();

  if (typeof q.page === "number") params.set("page", String(q.page));
  if (typeof q.pageSize === "number")
    params.set("pageSize", String(q.pageSize));
  if (q.search && q.search.trim()) params.set("search", q.search.trim());
  if (typeof q.isActive === "boolean")
    params.set("isActive", String(q.isActive));

  const qs = params.toString();

  return apiRequest<PagedEmployeesResponse>(`/employees${qs ? `?${qs}` : ""}`);
}

export function getEmployeeById(id: string) {
  return apiRequest<EmployeeDto>(`/employees/${id}`);
}

export function getNextEmployeeNumber() {
  return apiRequest<NextEmployeeNumberResponse>("/employees/next-number");
}

export function createEmployee(data: CreateEmployeeRequest) {
  const payload = {
    userId: data.userId,
    employmentType: data.employmentType,

    department: normalizeOptional(data.department),
    position: normalizeOptional(data.position),

    contactNumber: normalizeOptional(data.contactNumber),

    addressLine1: normalizeOptional(data.addressLine1),
    addressLine2: normalizeOptional(data.addressLine2),
    city: normalizeOptional(data.city),
    province: normalizeOptional(data.province),
    zipCode: normalizeOptional(data.zipCode),
  };

  return apiRequest<EmployeeDto>("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateEmployee(
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

    isActive: data.isActive,
    status,
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
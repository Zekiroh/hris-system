import type { EmployeeDto, EmployeeStatus } from "../../lib/employees";
import type { EmploymentType, FormData } from "./EmployeeFormFields";

export interface Employee {
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
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  tinNumber: string;
}

export type Paged<T> = {
  items: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};

export const DEFAULT_PAGE_SIZE = 10;

export function safeTrim(v: string | null | undefined) {
  return typeof v === "string" ? v.trim() : "";
}

export function normalizeNullString(v: string | null | undefined) {
  const s = safeTrim(v);
  if (!s) return "";
  if (s.toLowerCase() === "null") return "";
  return s;
}

export function buildName(dto: EmployeeDto) {
  const last = safeTrim(dto.lastName);
  const first = safeTrim(dto.firstName);
  const middle = normalizeNullString(dto.middleName);
  const base = [last, first].filter(Boolean).join(", ");
  return [base, middle].filter(Boolean).join(" ").trim() || "(No name)";
}

export function mapDtoToEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto.id,
    employeeId: safeTrim(dto.employeeNumber) || `EMP-${dto.id}`,
    name: buildName(dto),
    position: safeTrim(dto.position) || "",
    department: safeTrim(dto.department) || "",
    status: dto.isActive ? "Active" : "Inactive",
    employmentType:
      dto.employmentType === "Probationary" ||
      dto.employmentType === "Project-based"
        ? dto.employmentType
        : "Regular",
    contact: safeTrim(dto.contactNumber) || "",
    email: safeTrim(dto.email) || "",
    hireDate: safeTrim(dto.dateHired) || "",
    addressLine1: safeTrim(dto.addressLine1) || "",
    addressLine2: safeTrim(dto.addressLine2) || "",
    city: safeTrim(dto.city) || "",
    province: safeTrim(dto.province) || "",
    zipCode: safeTrim(dto.zipCode) || "",
    sssNumber: safeTrim(dto.sssNumber) || "",
    philHealthNumber: safeTrim(dto.philHealthNumber) || "",
    pagIbigNumber: safeTrim(dto.pagIbigNumber) || "",
    tinNumber: safeTrim(dto.tinNumber) || "",
  };
}

export function parseNameToParts(fullName: string) {
  const raw = fullName.trim();

  if (raw.includes(",")) {
    const [last, rest] = raw.split(",", 2);
    const lastName = (last ?? "").trim();
    const parts = (rest ?? "").trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const middleName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
    return { firstName, middleName, lastName };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || "Unknown";
  return { firstName, middleName: undefined, lastName };
}

export function unwrapData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

export const emptyFormData = (): FormData => ({
  userId: "",
  employeeId: "",
  name: "",
  position: "",
  department: "",
  status: "Active",
  employmentType: "Regular",
  contact: "",
  email: "",
  hireDate: new Date().toISOString().slice(0, 10),
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  zipCode: "",
  sssNumber: "",
  philHealthNumber: "",
  pagIbigNumber: "",
  tinNumber: "",
});
import type {
  EmployeeDto,
  EmployeeStatus,
  EmploymentType,
} from "../../../services/api/employees/employees";
import type { FormData } from "./forms/EmployeeFormFields";
import { formatPersonName } from "../../../lib/nameFormatter";

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
  isNewHire: boolean;
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
  const firstName = safeTrim(dto.firstName);
  const middleName = normalizeNullString(dto.middleName);
  const lastName = safeTrim(dto.lastName);
  const suffix = safeTrim(dto.suffix);

  return (
    formatPersonName(
      {
        firstName,
        middleName,
        lastName,
        suffix,
      },
      "LN_FIRST"
    ) || "(No name)"
  );
}

export function normalizeEmploymentType(
  value: string | null | undefined
): EmploymentType {
  const normalized = safeTrim(value).toLowerCase();

  if (normalized === "probationary") return "Probationary";
  if (normalized === "project-based" || normalized === "contract") {
    return "Project-based";
  }

  return "Regular";
}

export function formatEmploymentTypeLabel(
  value: EmploymentType | string | null | undefined
): string {
  const normalized = safeTrim(value).toLowerCase();

  if (!normalized) return "—";
  if (normalized === "project-based" || normalized === "contract") {
    return "Project-based";
  }
  if (normalized === "probationary") return "Probationary";
  if (normalized === "regular") return "Regular";

  return safeTrim(value);
}

export function mapDtoToEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto.id,
    employeeId: safeTrim(dto.employeeNumber) || `EMP-${dto.id}`,
    name: buildName(dto),
    position: safeTrim(dto.position) || "",
    department: safeTrim(dto.department) || "",
    status: dto.isActive ? "Active" : "Inactive",
    employmentType: normalizeEmploymentType(dto.employmentType),
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
    isNewHire: dto.isNewHire ?? false,
  };
}

export function mapDtoToFormData(dto: EmployeeDto): FormData {
  return {
    userId: "",
    employeeId: safeTrim(dto.employeeNumber) || "",
    name: buildName(dto),
    position: safeTrim(dto.position) || "",
    department: safeTrim(dto.department) || "",
    status: dto.isActive ? "Active" : "Inactive",
    employmentType: normalizeEmploymentType(dto.employmentType),
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
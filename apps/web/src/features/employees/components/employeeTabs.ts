export type EmployeeTabKey =
  | "personal"
  | "employment"
  | "government"
  | "documents";

export const EMPLOYEE_TABS: Array<{
  key: EmployeeTabKey;
  label: string;
}> = [
  { key: "personal", label: "Personal" },
  { key: "employment", label: "Employment" },
  { key: "government", label: "Government" },
  { key: "documents", label: "Documents" },
];
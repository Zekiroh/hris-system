import { X } from "lucide-react";
import type { EmployeeStatus } from "../../lib/employees";
import type { EmploymentType } from "./EmployeeFormFields";

export type EmployeeView = {
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
  sssNumber?: string;
  philHealthNumber?: string;
  pagIbigNumber?: string;
  tinNumber?: string;
};

const statusBadge: Record<EmployeeStatus, string> = {
  Active: "badge-success",
  "On Leave": "badge-warning",
  Inactive: "badge-danger",
};

export function EmployeeViewPanel({
  open,
  employee,
  onClose,
}: {
  open: boolean;
  employee: EmployeeView | null;
  onClose: () => void;
}) {
  if (!open || !employee) return null;

  const fullAddress = [
    employee.addressLine1,
    employee.addressLine2,
    employee.city,
    employee.province,
    employee.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="pro-modal-overlay !justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl animate-slide-in-right">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Employee Details</h3>
            <button onClick={onClose} className="btn-ghost btn-icon" type="button">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-3xl font-bold text-white shadow-lg">
              {employee.name.charAt(0)}
            </div>
            <h4 className="text-lg font-bold text-gray-900">{employee.name}</h4>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <span className={`badge mt-2 ${statusBadge[employee.status]}`}>
              <span className="badge-dot" />
              {employee.status}
            </span>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            {[
              ["Employee ID", employee.employeeId],
              ["Department", employee.department],
              ["Employment Type", employee.employmentType],
              ["Contact", employee.contact],
              ["Email", employee.email],
              ["Hire Date", employee.hireDate],
              ["Address", fullAddress || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {label}
                </span>
                <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] break-words">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Government Information
            </h4>

            {[
              ["SSS Number", employee.sssNumber || "—"],
              ["PhilHealth", employee.philHealthNumber || "—"],
              ["Pag-IBIG", employee.pagIbigNumber || "—"],
              ["TIN", employee.tinNumber || "—"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-xl bg-gray-50 p-3"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  {label}
                </span>
                <span className="text-sm font-semibold text-gray-800 text-right max-w-[60%] break-words">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
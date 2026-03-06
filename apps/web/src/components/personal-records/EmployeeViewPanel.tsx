import { X } from "lucide-react";
import type { EmployeeStatus } from "../../lib/employees";

export type EmployeeView = {
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  contact: string;
  email: string;
  hireDate: string;
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

  return (
    <div className="pro-modal-overlay !justify-end">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl animate-slide-in-right z-10">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Employee Details</h3>
            <button onClick={onClose} className="btn-ghost btn-icon" type="button">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
              {employee.name.charAt(0)}
            </div>
            <h4 className="text-lg font-bold text-gray-900">{employee.name}</h4>
            <p className="text-sm text-gray-500">{employee.position}</p>
            <span className={`mt-2 badge ${statusBadge[employee.status]}`}>
              <span className="badge-dot" />
              {employee.status}
            </span>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-6">
            {[
              ["Employee ID", employee.employeeId],
              ["Department", employee.department],
              ["Contact", employee.contact],
              ["Email", employee.email],
              ["Hire Date", employee.hireDate],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-medium">{label}</span>
                <span className="text-sm font-semibold text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
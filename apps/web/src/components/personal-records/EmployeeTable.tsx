import { Eye, Edit } from "lucide-react";
import type { EmployeeStatus } from "../../lib/employees";

export type EmployeeRow = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
};

const statusBadge: Record<EmployeeStatus, string> = {
  Active: "badge-success",
  "On Leave": "badge-warning",
  Inactive: "badge-danger",
};

type Props = {
  rows: EmployeeRow[];
  onView: (emp: EmployeeRow) => void;
  onEdit: (emp: EmployeeRow) => void;

  // pagination
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number; // to pad blank rows
  onPageChange: (nextPage: number) => void;
  loading?: boolean;
};

export function EmployeeTable({
  rows,
  onView,
  onEdit,
  page,
  totalPages,
  pageSize,
  onPageChange,
  loading,
}: Props) {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const safePage = Math.min(Math.max(1, page || 1), safeTotalPages);

  // pad rows so table always shows exactly `pageSize` rows
  const missing = Math.max(0, pageSize - rows.length);
  const paddedRows: Array<EmployeeRow | null> = [...rows, ...Array.from({ length: missing }, () => null)];

  const canPrev = safePage > 1 && !loading;
  const canNext = safePage < safeTotalPages && !loading;

  return (
    <div className="pro-card overflow-hidden animate-fade-in-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
      <div className="overflow-x-auto">
        <table className="pro-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Position</th>
              <th>Department</th>
              <th>Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paddedRows.map((emp, idx) => {
              if (!emp) {
                // blank filler row (keeps table height consistent)
                return (
                  <tr key={`blank-${idx}`} className="opacity-60">
                    <td className="font-mono text-xs text-gray-300">--</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs font-bold flex-shrink-0">
                          --
                        </div>
                        <span className="font-medium text-gray-300">--</span>
                      </div>
                    </td>
                    <td className="text-gray-300">--</td>
                    <td className="text-gray-300">--</td>
                    <td className="text-gray-300">--</td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button className="btn-ghost btn-icon opacity-40 cursor-not-allowed" type="button" disabled>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="btn-ghost btn-icon opacity-40 cursor-not-allowed" type="button" disabled>
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={emp.id}>
                  <td className="font-mono text-xs">{emp.employeeId}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{emp.name}</span>
                    </div>
                  </td>
                  <td>{emp.position}</td>
                  <td>{emp.department}</td>
                  <td>
                    <span className={`badge ${statusBadge[emp.status]}`}>
                      <span className="badge-dot" />
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onView(emp)}
                        className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50"
                        title="View"
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(emp)}
                        className="btn-ghost btn-icon text-emerald-600 hover:bg-emerald-50"
                        title="Edit"
                        type="button"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Simple pagination (matches your expected UI) */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPageChange(safePage - 1)}
          disabled={!canPrev}
        >
          Prev
        </button>

        <div className="text-sm text-gray-500">
          Page {safePage} / {safeTotalPages} 
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onPageChange(safePage + 1)}
          disabled={!canNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
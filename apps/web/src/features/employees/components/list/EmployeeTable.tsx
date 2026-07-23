import { useState } from "react";
import { Eye, Edit } from "lucide-react";
import type { EmployeeStatus } from "../../../../services/api/employees/employees";
import { useAvatarUrl } from "../../../../hooks/useAvatarUrl";

export type EmployeeRow = {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  isNewHire?: boolean;
  avatarUserId?: string | number | null;
};

const statusBadge: Record<EmployeeStatus, string> = {
  Active: "badge-success",
  Inactive: "badge-danger",
};

type Props = {
  rows: EmployeeRow[];
  onView: (emp: EmployeeRow) => void;
  onEdit: (emp: EmployeeRow) => void;
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
  loading?: boolean;
};

function EmployeeAvatar({
  name,
  userId,
}: {
  name: string;
  userId?: string | number | null;
}) {
  const avatarUrl = useAvatarUrl(userId);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const showAvatar = Boolean(avatarUrl && avatarUrl !== failedAvatarUrl);

  return (
    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {showAvatar && avatarUrl ? (
        <img
          src={avatarUrl}
          alt={`${name} avatar`}
          className="w-full h-full object-cover"
          onError={() => setFailedAvatarUrl(avatarUrl)}
        />
      ) : (
        initial
      )}
    </div>
  );
}

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

  const missing = Math.max(0, pageSize - rows.length);
  const paddedRows: Array<EmployeeRow | null> = [
    ...rows,
    ...Array.from({ length: missing }, () => null),
  ];

  const canPrev = safePage > 1 && !loading;
  const canNext = safePage < safeTotalPages && !loading;

  return (
    <div className="overflow-visible">
      <div className="px-6 pt-6">
        <div className="overflow-x-auto rounded-2xl">
          <table className="pro-table min-w-full">
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
                          <button
                            className="btn-ghost btn-icon opacity-40 cursor-not-allowed"
                            type="button"
                            disabled
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="btn-ghost btn-icon opacity-40 cursor-not-allowed"
                            type="button"
                            disabled
                          >
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
                        <EmployeeAvatar
                          name={emp.name}
                          userId={emp.avatarUserId}
                        />
                        <span className="font-medium text-gray-800">
                          {emp.name}
                        </span>
                      </div>
                    </td>
                    <td>{emp.position}</td>
                    <td>{emp.department}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${statusBadge[emp.status]}`}>
                          <span className="badge-dot" />
                          {emp.status}
                        </span>

                        {emp.isNewHire && (
                          <span className="badge badge-warning">
                            New Hire
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onView(emp)}
                          className="btn-ghost btn-icon text-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="View"
                          type="button"
                          disabled={loading}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEdit(emp)}
                          className="btn-ghost btn-icon text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit"
                          type="button"
                          disabled={loading}
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
      </div>

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
          Page {safePage} of {safeTotalPages}
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
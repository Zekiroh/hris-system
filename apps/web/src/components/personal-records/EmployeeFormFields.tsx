import { memo } from "react";
import type { EmployeeStatus } from "../../lib/employees";

export type UserOption = {
  id: string;
  fullName: string;
  email?: string;
  contactNumber?: string;
};

export type EmploymentType = "Regular" | "Probationary" | "Project-based";

export type FormData = {
  userId: string;
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

  // ---- C2 Government Fields ----
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  tinNumber: string;
};

function ReadOnlyValue({
  value,
  emptyFallback = "—",
}: {
  value?: string;
  emptyFallback?: string;
}) {
  return (
    <div className="min-h-[24px] pt-1 text-sm font-medium text-gray-600">
      {value?.trim() ? value : emptyFallback}
    </div>
  );
}

export const EmployeeFormFields = memo(function EmployeeFormFields({
  mode,
  formData,
  setFormData,
  apiError,
  loading,
  onCancel,
  onSubmit,
  submitLabel,
  userOptions,
  loadingUsers,
  onLinkedUserChange,
}: {
  mode: "add" | "edit";
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  apiError: string | null;
  loading: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  userOptions?: UserOption[];
  loadingUsers?: boolean;
  onLinkedUserChange?: (userId: string) => void | Promise<void>;
}) {
  const isAdd = mode === "add";
  const users = userOptions ?? [];
  const usersBusy = Boolean(loadingUsers);
  const hasSelectedUser = !!formData.userId;

  return (
    <div className="space-y-4">
      <div>
        <label className="pro-label">
          {isAdd ? "Linked User / System Account" : "Full Name"}
        </label>

        {isAdd ? (
          <select
            value={formData.userId}
            onChange={(e) => {
              const id = e.target.value;

              if (onLinkedUserChange) {
                Promise.resolve(onLinkedUserChange(id)).catch(() => {
                  // silent fail (handled upstream if needed)
                });
                return;
              }

              const selected = users.find((u) => u.id === id);

              setFormData((p) => ({
                ...p,
                userId: id,
                name: selected?.fullName ?? "",
                email: selected?.email ?? "",
                contact: selected?.contactNumber ?? "",
              }));
            }}
            className="pro-select"
            disabled={usersBusy}
          >
            <option value="">
              {usersBusy
                ? "Loading users..."
                : users.length
                  ? "Select a user..."
                  : "No users found"}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        ) : (
          <div className="min-h-[24px] pt-1 text-sm font-medium text-gray-600">
            {formData.name || "—"}
          </div>
        )}
      </div>

      {isAdd && hasSelectedUser && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="pro-label">Employee ID</label>
            <ReadOnlyValue value={formData.employeeId} />
          </div>

          <div>
            <label className="pro-label">Hire Date</label>
            <ReadOnlyValue value={formData.hireDate} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="pro-label">Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) =>
              setFormData((p) => ({ ...p, position: e.target.value }))
            }
            className="pro-input"
          />
        </div>

        <div>
          <label className="pro-label">Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) =>
              setFormData((p) => ({ ...p, department: e.target.value }))
            }
            className="pro-input"
          />
        </div>
      </div>

      {isAdd ? (
        <div>
          <label className="pro-label">Employment Type</label>
          <select
            value={formData.employmentType}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                employmentType: e.target.value as EmploymentType,
              }))
            }
            className="pro-select"
          >
            <option value="Regular">Regular</option>
            <option value="Probationary">Probationary</option>
            <option value="Project-based">Project-based</option>
          </select>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="pro-label">Employment Type</label>
            <select
              value={formData.employmentType}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  employmentType: e.target.value as EmploymentType,
                }))
              }
              className="pro-select"
            >
              <option value="Regular">Regular</option>
              <option value="Probationary">Probationary</option>
              <option value="Project-based">Project-based</option>
            </select>
          </div>

          <div>
            <label className="pro-label">Employment Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  status: e.target.value as EmployeeStatus,
                }))
              }
              className="pro-select"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="pro-label">Contact Number</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) =>
              setFormData((p) => ({ ...p, contact: e.target.value }))
            }
            className="pro-input"
          />
        </div>

        <div>
          <label className="pro-label">Email</label>
          <ReadOnlyValue value={formData.email} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="pro-label">Address Line 1</label>
          <input
            type="text"
            value={formData.addressLine1}
            onChange={(e) =>
              setFormData((p) => ({ ...p, addressLine1: e.target.value }))
            }
            className="pro-input"
          />
        </div>

        <div>
          <label className="pro-label">Address Line 2</label>
          <input
            type="text"
            value={formData.addressLine2}
            onChange={(e) =>
              setFormData((p) => ({ ...p, addressLine2: e.target.value }))
            }
            className="pro-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="pro-label">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData((p) => ({ ...p, city: e.target.value }))
            }
            className="pro-input"
          />
        </div>

        <div>
          <label className="pro-label">Province</label>
          <input
            type="text"
            value={formData.province}
            onChange={(e) =>
              setFormData((p) => ({ ...p, province: e.target.value }))
            }
            className="pro-input"
          />
        </div>

        <div>
          <label className="pro-label">Zip Code</label>
          <input
            type="text"
            value={formData.zipCode}
            onChange={(e) =>
              setFormData((p) => ({ ...p, zipCode: e.target.value }))
            }
            className="pro-input"
          />
        </div>
      </div>

      {!isAdd && (
        <div className="border-t pt-4">
          <h4 className="mb-2 text-sm font-semibold text-gray-700">
            Government Information
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="pro-label">SSS Number</label>
              <input
                type="text"
                value={formData.sssNumber}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, sssNumber: e.target.value }))
                }
                className="pro-input"
              />
            </div>

            <div>
              <label className="pro-label">PhilHealth Number</label>
              <input
                type="text"
                value={formData.philHealthNumber}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    philHealthNumber: e.target.value,
                  }))
                }
                className="pro-input"
              />
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="pro-label">Pag-IBIG Number</label>
              <input
                type="text"
                value={formData.pagIbigNumber}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    pagIbigNumber: e.target.value,
                  }))
                }
                className="pro-input"
              />
            </div>

            <div>
              <label className="pro-label">TIN Number</label>
              <input
                type="text"
                value={formData.tinNumber}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, tinNumber: e.target.value }))
                }
                className="pro-input"
              />
            </div>
          </div>
        </div>
      )}

      {apiError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <div className="pro-modal-footer !px-0 !pb-0">
        <button onClick={onCancel} className="btn btn-secondary" type="button">
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="btn btn-primary"
          disabled={loading}
          type="button"
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
});
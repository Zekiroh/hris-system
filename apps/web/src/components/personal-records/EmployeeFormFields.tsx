import { memo } from "react";
import type { EmployeeStatus } from "../../lib/employees";

export type UserOption = {
  id: string;
  fullName: string;
};

export type FormData = {
  userId: string;
  name: string;
  position: string;
  department: string;
  status: EmployeeStatus;
  contact: string;
  email: string;
};

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
}) {
  const isAdd = mode === "add";
  const users = userOptions ?? [];
  const usersBusy = Boolean(loadingUsers);

  return (
    <div className="space-y-4">
      <div>
        <label className="pro-label">Full Name</label>

        {isAdd ? (
          <select
            value={formData.userId}
            onChange={(e) => {
              const id = e.target.value;
              const selected = users.find((u) => u.id === id);
              setFormData((p) => ({
                ...p,
                userId: id,
                name: selected?.fullName ?? "",
              }));
            }}
            className="pro-select"
            disabled={usersBusy}
          >
            <option value="">
              {usersBusy ? "Loading users..." : users.length ? "Select a user..." : "No users found"}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            className="pro-input"
            placeholder="Dela Cruz, Juan"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="pro-label">Position</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
            className="pro-input"
          />
        </div>
        <div>
          <label className="pro-label">Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
            className="pro-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="pro-label">Contact Number</label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) => setFormData((p) => ({ ...p, contact: e.target.value }))}
            className="pro-input"
          />
        </div>
        <div>
          <label className="pro-label">Email</label>
          <input
            type="text"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            className="pro-input"
          />
        </div>
      </div>

      <div>
        <label className="pro-label">Employment Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as EmployeeStatus }))}
          className="pro-select"
        >
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Only show dropdown/user-fetch errors inside Add modal */}
      {isAdd && apiError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {apiError}
        </div>
      )}

      <div className="pro-modal-footer !px-0 !pb-0">
        <button onClick={onCancel} className="btn btn-secondary" type="button">
          Cancel
        </button>
        <button onClick={onSubmit} className="btn btn-primary" disabled={loading} type="button">
          {submitLabel}
        </button>
      </div>
    </div>
  );
});
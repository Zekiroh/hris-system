import {
  memo,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { EmployeeStatus } from "../../../../services/api/employees/employees";
import type { EmploymentType } from "../../../../services/api/employees/employees";
import {
  DropdownMenu,
  type SelectOption,
} from "../../../../shared/components/forms/DropdownMenu";
import {
  LOCATION_OPTIONS,
  PROVINCE_OPTIONS,
} from "../../../../shared/data/locationOptions";

export type UserOption = {
  id: string;
  fullName: string;
  email?: string;
  contactNumber?: string;
};

export type EmployeeFormSection = "personal" | "employment" | "government";

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
  sssNumber: string;
  philHealthNumber: string;
  pagIbigNumber: string;
  tinNumber: string;
};

export type FormFieldName = keyof FormData;
export type FieldErrors = Partial<Record<FormFieldName, string>>;

type DropdownKey =
  | "linkedUser"
  | "employmentType"
  | "employmentStatus"
  | "province"
  | "city"
  | null;

function RequiredAsterisk() {
  return <span className="ml-1 text-red-500">*</span>;
}

function FormLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="pro-label">
      {children}
      {required && <RequiredAsterisk />}
    </label>
  );
}

function formatDisplayDate(value?: string): string {
  if (!value?.trim()) return "—";

  const raw = value.trim();

  let date: Date | null = null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  } else {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      date = parsed;
    }
  }

  if (!date) return raw;

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

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

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <div className="border-t" />
    </div>
  );
}

function getFieldClass(baseClass: string, hasError?: boolean) {
  return hasError
    ? `${baseClass} border-red-500 focus:border-red-500`
    : baseClass;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function sanitizeTextInput(value: string): string {
  return value.replace(/\s{2,}/g, " ");
}

function sanitizeContactInput(value: string): string {
  return value.replace(/[^0-9+\-\s()]/g, "");
}

function sanitizeZipInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

function extractDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function formatSSS(value: string): string {
  const digits = extractDigits(value).slice(0, 10);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 9),
    digits.slice(9, 10),
  ];
  return parts.filter(Boolean).join("-");
}

function formatPhilHealth(value: string): string {
  const digits = extractDigits(value).slice(0, 12);
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 11),
    digits.slice(11, 12),
  ];
  return parts.filter(Boolean).join("-");
}

function formatPagIbig(value: string): string {
  const digits = extractDigits(value).slice(0, 12);
  const parts = [
    digits.slice(0, 4),
    digits.slice(4, 8),
    digits.slice(8, 12),
  ];
  return parts.filter(Boolean).join("-");
}

function formatTIN(value: string): string {
  const digits = extractDigits(value).slice(0, 9);
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9)];
  return parts.filter(Boolean).join("-");
}

function buildMaskedDisplay(formattedValue: string, pattern: string) {
  const digits = extractDigits(formattedValue);
  let digitIndex = 0;

  return pattern.split("").map((maskChar, index) => {
    if (maskChar === "-") {
      return {
        char: "-",
        filled: false,
        key: `dash-${index}`,
      };
    }

    const digit = digits[digitIndex];
    if (digit) {
      digitIndex += 1;
      return {
        char: digit,
        filled: true,
        key: `digit-${index}`,
      };
    }

    return {
      char: maskChar,
      filled: false,
      key: `mask-${index}`,
    };
  });
}

function GovernmentMaskedInput({
  value,
  onChange,
  error,
  placeholderMask,
  maxLength,
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholderMask: string;
  maxLength: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showNativeText, setShowNativeText] = useState(false);

  const display = buildMaskedDisplay(value, placeholderMask);

  const syncSelectionState = () => {
    const input = inputRef.current;
    if (!input) {
      setShowNativeText(false);
      return;
    }

    const hasSelection =
      typeof input.selectionStart === "number" &&
      typeof input.selectionEnd === "number" &&
      input.selectionStart !== input.selectionEnd;

    setShowNativeText(hasSelection);
  };

  return (
    <div>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          maxLength={maxLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onSelect={syncSelectionState}
          onKeyUp={syncSelectionState}
          onMouseUp={syncSelectionState}
          onBlur={() => setShowNativeText(false)}
          className={getFieldClass(
            "pro-input relative z-10 font-mono tracking-[0.02em]",
            Boolean(error)
          )}
          style={{
            backgroundColor: "transparent",
            color: showNativeText ? "#1f2937" : "transparent",
            WebkitTextFillColor: showNativeText ? "#1f2937" : "transparent",
            caretColor: "#111827",
          }}
          autoComplete="off"
          spellCheck={false}
        />

        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center px-4 text-sm font-mono tracking-[0.02em] whitespace-pre transition-opacity ${
            showNativeText ? "opacity-0" : "opacity-100"
          }`}
        >
          {display.map((part) => (
            <span
              key={part.key}
              className={part.filled ? "text-gray-800" : "text-gray-400"}
            >
              {part.char}
            </span>
          ))}
        </div>
      </div>

      <FieldError message={error} />
    </div>
  );
}

function LinkedUserDropdown({
  value,
  users,
  loading,
  error,
  onSelect,
  open,
  onToggle,
  onClose,
}: {
  value: string;
  users: UserOption[];
  loading: boolean;
  error?: string;
  onSelect: (userId: string) => void;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const options: SelectOption[] = users.map((user) => ({
    label: user.fullName,
    value: user.id,
  }));

  return (
    <DropdownMenu
      value={value}
      options={options}
      placeholder={
        users.length ? "Select a linked user account" : "No users found"
      }
      loading={loading}
      error={error}
      disabled={users.length === 0}
      onSelect={onSelect}
      open={open}
      onToggle={onToggle}
      onClose={onClose}
    />
  );
}

const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Regular", value: "Regular" },
  { label: "Probationary", value: "Probationary" },
  { label: "Project-based", value: "Project-based" },
];

const EMPLOYMENT_STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
];

export const EmployeeFormFields = memo(function EmployeeFormFields({
  mode,
  section,
  formData,
  setFormData,
  apiError,
  fieldErrors,
  onClearFieldError,
  loading,
  isSubmitDisabled,
  onCancel,
  onSubmit,
  submitLabel,
  userOptions,
  loadingUsers,
  onLinkedUserChange,
}: {
  mode: "add" | "edit";
  section?: EmployeeFormSection;
  formData: FormData;
  setFormData: Dispatch<SetStateAction<FormData>>;
  apiError: string | null;
  fieldErrors?: FieldErrors;
  onClearFieldError?: (field: FormFieldName) => void;
  loading: boolean;
  isSubmitDisabled?: boolean;
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
  const errors = fieldErrors ?? {};
  const [openDropdown, setOpenDropdown] = useState<DropdownKey>(null);

  const cityOptions: SelectOption[] = useMemo(() => {
    const selectedProvince = formData.province as keyof typeof LOCATION_OPTIONS;

    if (!selectedProvince || !(selectedProvince in LOCATION_OPTIONS)) {
      return [];
    }

    return LOCATION_OPTIONS[selectedProvince].map((city) => ({
      label: city,
      value: city,
    }));
  }, [formData.province]);

  const apiFieldErrors = useMemo<FieldErrors>(() => {
    return {
      sssNumber:
        apiError === "DUPLICATE_SSS" ||
        apiError === "SSS number already exists."
          ? "SSS number already exists."
          : undefined,
      philHealthNumber:
        apiError === "DUPLICATE_PHILHEALTH" ||
        apiError === "PhilHealth number already exists."
          ? "PhilHealth number already exists."
          : undefined,
      pagIbigNumber:
        apiError === "DUPLICATE_PAGIBIG" ||
        apiError === "Pag-IBIG number already exists."
          ? "Pag-IBIG number already exists."
          : undefined,
      tinNumber:
        apiError === "DUPLICATE_TIN" || apiError === "TIN already exists."
          ? "TIN already exists."
          : undefined,
    };
  }, [apiError]);

  const inlineFieldMessages = useMemo(() => {
    return new Set(
      Object.values(errors)
        .concat(Object.values(apiFieldErrors))
        .filter((value): value is string => Boolean(value?.trim()))
    );
  }, [errors, apiFieldErrors]);

  const shouldHideTopApiError =
    !apiError ||
    inlineFieldMessages.has(apiError) ||
    apiError === "DUPLICATE_SSS" ||
    apiError === "DUPLICATE_PHILHEALTH" ||
    apiError === "DUPLICATE_PAGIBIG" ||
    apiError === "DUPLICATE_TIN";

  const showPersonal = isAdd || section === "personal";
  const showEmployment = isAdd || section === "employment";
  const showGovernment = !isAdd && section === "government";

  function updateField<K extends FormFieldName>(field: K, value: FormData[K]) {
    onClearFieldError?.(field);

    setFormData((p) => ({
      ...p,
      [field]: value,
    }));
  }

  function handleProvinceSelect(value: string) {
    onClearFieldError?.("province");
    onClearFieldError?.("city");

    setFormData((p) => ({
      ...p,
      province: value,
      city: "",
    }));

    setOpenDropdown(null);
  }

  function handleLinkedUserSelect(id: string) {
    onClearFieldError?.("userId");
    onClearFieldError?.("name");
    onClearFieldError?.("email");
    onClearFieldError?.("contact");

    setOpenDropdown(null);

    if (onLinkedUserChange) {
      Promise.resolve(onLinkedUserChange(id)).catch(() => {});
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
  }

  const toggleDropdown = (key: DropdownKey) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-visible">
        <div className="space-y-4 overflow-visible">
          {apiError && !shouldHideTopApiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          )}

          {isAdd && (
            <div>
              <FormLabel required>Linked User / System Account</FormLabel>

              <LinkedUserDropdown
                value={formData.userId}
                users={users}
                loading={usersBusy || loading}
                error={errors.userId}
                onSelect={handleLinkedUserSelect}
                open={openDropdown === "linkedUser"}
                onToggle={() => toggleDropdown("linkedUser")}
                onClose={() => setOpenDropdown(null)}
              />
            </div>
          )}

          {!isAdd && showPersonal && (
            <>
              <SectionHeader title="Personal Information" />

              <div>
                <p className="text-sm font-medium text-gray-600">
                  Full Name:{" "}
                  <span className="font-semibold text-green-600">
                    {formData.name?.trim() || "—"}
                  </span>
                </p>
                <FieldError message={errors.name} />
              </div>
            </>
          )}

          {isAdd && hasSelectedUser && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Employee ID</FormLabel>
                <ReadOnlyValue value={formData.employeeId} />
              </div>

              <div>
                <FormLabel>Hire Date</FormLabel>
                <ReadOnlyValue value={formatDisplayDate(formData.hireDate)} />
              </div>
            </div>
          )}

          {showEmployment && (
            <>
              {!isAdd && <SectionHeader title="Employment Information" />}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>Position</FormLabel>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      updateField("position", sanitizeTextInput(e.target.value))
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.position)
                    )}
                    placeholder="Enter position"
                    disabled={loading}
                  />
                  <FieldError message={errors.position} />
                </div>

                <div>
                  <FormLabel required>Department</FormLabel>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) =>
                      updateField(
                        "department",
                        sanitizeTextInput(e.target.value)
                      )
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.department)
                    )}
                    placeholder="Enter department"
                    disabled={loading}
                  />
                  <FieldError message={errors.department} />
                </div>
              </div>

              {isAdd ? (
                <div>
                  <FormLabel required>Employment Type</FormLabel>
                  <DropdownMenu
                    value={formData.employmentType}
                    options={EMPLOYMENT_TYPE_OPTIONS}
                    placeholder="Select employment type"
                    error={errors.employmentType}
                    disabled={loading}
                    onSelect={(value) => {
                      updateField("employmentType", value as EmploymentType);
                      setOpenDropdown(null);
                    }}
                    open={openDropdown === "employmentType"}
                    onToggle={() => toggleDropdown("employmentType")}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Employment Type</FormLabel>
                    <DropdownMenu
                      value={formData.employmentType}
                      options={EMPLOYMENT_TYPE_OPTIONS}
                      placeholder="Select employment type"
                      error={errors.employmentType}
                      disabled={loading}
                      onSelect={(value) => {
                        updateField("employmentType", value as EmploymentType);
                        setOpenDropdown(null);
                      }}
                      open={openDropdown === "employmentType"}
                      onToggle={() => toggleDropdown("employmentType")}
                      onClose={() => setOpenDropdown(null)}
                    />
                  </div>

                  <div>
                    <FormLabel>Employment Status</FormLabel>
                    <DropdownMenu
                      value={formData.status}
                      options={EMPLOYMENT_STATUS_OPTIONS}
                      placeholder="Select status"
                      error={errors.status}
                      disabled={loading}
                      onSelect={(value) => {
                        updateField("status", value as EmployeeStatus);
                        setOpenDropdown(null);
                      }}
                      open={openDropdown === "employmentStatus"}
                      onToggle={() => toggleDropdown("employmentStatus")}
                      onClose={() => setOpenDropdown(null)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {!isAdd && showPersonal && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>Contact Number</FormLabel>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) =>
                      updateField("contact", sanitizeContactInput(e.target.value))
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.contact)
                    )}
                    placeholder="Enter contact number"
                  />
                  <FieldError message={errors.contact} />
                </div>

                <div>
                  <FormLabel>Email</FormLabel>
                  <ReadOnlyValue value={formData.email} />
                  <FieldError message={errors.email} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel>Address Line 1</FormLabel>
                  <input
                    type="text"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      updateField("addressLine1", sanitizeTextInput(e.target.value))
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.addressLine1)
                    )}
                    placeholder="Street address"
                  />
                  <FieldError message={errors.addressLine1} />
                </div>

                <div>
                  <FormLabel>Address Line 2</FormLabel>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      updateField("addressLine2", sanitizeTextInput(e.target.value))
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.addressLine2)
                    )}
                    placeholder="Apartment, Unit, Building, Floor, etc."
                  />
                  <FieldError message={errors.addressLine2} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="overflow-visible">
                  <FormLabel>City / Municipality</FormLabel>
                  <DropdownMenu
                    value={formData.city}
                    options={cityOptions}
                    placeholder={
                      formData.province
                        ? "Select city"
                        : "Select province first"
                    }
                    error={errors.city}
                    disabled={loading || !formData.province}
                    onSelect={(value) => {
                      updateField("city", value);
                      setOpenDropdown(null);
                    }}
                    open={openDropdown === "city"}
                    onToggle={() => toggleDropdown("city")}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>

                <div className="overflow-visible">
                  <FormLabel>Province</FormLabel>
                  <DropdownMenu
                    value={formData.province}
                    options={PROVINCE_OPTIONS}
                    placeholder="Select province"
                    error={errors.province}
                    disabled={loading}
                    onSelect={handleProvinceSelect}
                    open={openDropdown === "province"}
                    onToggle={() => toggleDropdown("province")}
                    onClose={() => setOpenDropdown(null)}
                  />
                </div>

                <div>
                  <FormLabel>Zip Code</FormLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={formData.zipCode}
                    onChange={(e) =>
                      updateField("zipCode", sanitizeZipInput(e.target.value))
                    }
                    className={getFieldClass(
                      "pro-input",
                      Boolean(errors.zipCode)
                    )}
                    placeholder="0000"
                  />
                  <FieldError message={errors.zipCode} />
                </div>
              </div>
            </>
          )}

          {showGovernment && (
            <div className="space-y-4">
              <SectionHeader title="Government Information" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>SSS Number</FormLabel>
                  <GovernmentMaskedInput
                    value={formData.sssNumber}
                    onChange={(value) =>
                      updateField("sssNumber", formatSSS(value))
                    }
                    error={errors.sssNumber || apiFieldErrors.sssNumber}
                    placeholderMask="XX-XXXXXXX-X"
                    maxLength={12}
                  />
                </div>

                <div>
                  <FormLabel required>PhilHealth Number</FormLabel>
                  <GovernmentMaskedInput
                    value={formData.philHealthNumber}
                    onChange={(value) =>
                      updateField("philHealthNumber", formatPhilHealth(value))
                    }
                    error={
                      errors.philHealthNumber || apiFieldErrors.philHealthNumber
                    }
                    placeholderMask="XX-XXXXXXXXX-X"
                    maxLength={14}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FormLabel required>Pag-IBIG Number</FormLabel>
                  <GovernmentMaskedInput
                    value={formData.pagIbigNumber}
                    onChange={(value) =>
                      updateField("pagIbigNumber", formatPagIbig(value))
                    }
                    error={errors.pagIbigNumber || apiFieldErrors.pagIbigNumber}
                    placeholderMask="XXXX-XXXX-XXXX"
                    maxLength={14}
                  />
                </div>

                <div>
                  <FormLabel required>TIN Number</FormLabel>
                  <GovernmentMaskedInput
                    value={formData.tinNumber}
                    onChange={(value) => updateField("tinNumber", formatTIN(value))}
                    error={errors.tinNumber || apiFieldErrors.tinNumber}
                    placeholderMask="XXX-XXX-XXX"
                    maxLength={11}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4">
        <div className="pro-modal-footer !px-0 !pb-0">
          <button
            onClick={onCancel}
            className="btn btn-secondary"
            type="button"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="btn btn-primary flex items-center justify-center gap-2"
            disabled={loading || isSubmitDisabled}
            type="button"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
});
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getNextEmployeeNumber,
  type UpdateEmployeeRequest,
  type EmployeeDto,
  type EmployeeStatus,
} from "../../lib/employees";
import { mapEmployeeMutationErrorToUiMessage } from "../../lib/employeeErrorHelpers";
import { getEmployeeApiErrorMessage } from "./utils/employeeApiError";

import { getUserOptionsForEmployeeDropdown } from "../../lib/users";

import {
  type FormData,
  type UserOption,
  type FieldErrors,
  type FormFieldName,
} from "../../components/personal-records/EmployeeFormFields";
import {
  EmployeeTable,
  type EmployeeRow,
} from "../../components/personal-records/EmployeeTable";
import { EmployeeToolbar } from "../../components/personal-records/EmployeeToolbar";
import { EmployeeStats } from "../../components/personal-records/EmployeeStats";
import { EmployeeViewPanel } from "../../components/personal-records/EmployeeViewPanel";
import { EmployeeAddModal } from "../../components/personal-records/EmployeeAddModal";
import { EmployeeEditModal } from "../../components/personal-records/EmployeeEditModal";
import {
  type Employee,
  type Paged,
  DEFAULT_PAGE_SIZE,
  emptyFormData,
  mapDtoToEmployee,
  parseNameToParts,
  unwrapData,
} from "../../components/personal-records/employeeList.utils";

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState<FormData>(emptyFormData());
  const [initialEditFormData, setInitialEditFormData] =
    useState<FormData | null>(null);

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const employeeNumberRequestRef = useRef(0);

  const isActiveQuery = useMemo(() => {
    if (filterStatus === "Active") return true;
    if (filterStatus === "Inactive") return false;
    return undefined;
  }, [filterStatus]);

  const totalPages = useMemo(() => {
    if (!totalCount) return 1;
    const pages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);
    return pages <= 0 ? 1 : pages;
  }, [totalCount]);

  function sanitizeLoadedText(value: string | null | undefined): string {
    const normalized = value?.trim() ?? "";
    if (!normalized) return "";
    const lowered = normalized.toLowerCase();

    if (lowered === "string" || lowered === "null" || lowered === "undefined") {
      return "";
    }

    return normalized;
  }

  function mapDtoToFormData(dto: EmployeeDto): FormData {
    const employee = mapDtoToEmployee(dto);

    return {
      userId: "",
      employeeId: sanitizeLoadedText(employee.employeeId),
      name: sanitizeLoadedText(employee.name),
      position: sanitizeLoadedText(employee.position),
      department: sanitizeLoadedText(employee.department),
      status: employee.status,
      employmentType: employee.employmentType,
      contact: sanitizeLoadedText(employee.contact),
      email: sanitizeLoadedText(employee.email),
      hireDate: sanitizeLoadedText(employee.hireDate),
      addressLine1: sanitizeLoadedText(employee.addressLine1),
      addressLine2: sanitizeLoadedText(employee.addressLine2),
      city: sanitizeLoadedText(employee.city),
      province: sanitizeLoadedText(employee.province),
      zipCode: sanitizeLoadedText(employee.zipCode),
      sssNumber: sanitizeLoadedText(employee.sssNumber),
      philHealthNumber: sanitizeLoadedText(employee.philHealthNumber),
      pagIbigNumber: sanitizeLoadedText(employee.pagIbigNumber),
      tinNumber: sanitizeLoadedText(employee.tinNumber),
    };
  }

  function resetModalState() {
    setSelectedEmployee(null);
    setFormData(emptyFormData());
    setInitialEditFormData(null);
    setFormError(null);
    setFieldErrors({});
    employeeNumberRequestRef.current += 1;
  }

  function getFirstFieldError(errors: FieldErrors): string | null {
    const first = Object.values(errors).find(
      (value): value is string => Boolean(value?.trim())
    );
    return first ?? null;
  }

  function clearFieldError(field: FormFieldName) {
    setFormError(null);

    setFieldErrors((prev) => {
      if (!prev[field]) return prev;

      const next = { ...prev };
      delete next[field];

      return next;
    });
  }

  function normalizeOptionalText(value: string): string | undefined {
    const normalized = value.trim().replace(/\s+/g, " ");
    return normalized || undefined;
  }

  function normalizeEmailValue(value: string): string | undefined {
    const normalized = value.trim().toLowerCase();
    return normalized || undefined;
  }

  function normalizeContactNumber(value: string): string | undefined {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    return trimmed.replace(/[^\d+]/g, "");
  }

  function extractDigits(value: string): string {
    return value.replace(/\D/g, "");
  }

  function normalizeGovernmentNumber(value: string): string | undefined {
    const digits = extractDigits(value);
    return digits || undefined;
  }

  function normalizeZipCode(value: string): string | undefined {
    const digits = extractDigits(value);
    return digits || undefined;
  }

  function normalizeFormDataForComparison(data: FormData) {
    return {
      ...data,
      userId: data.userId.trim(),
      employeeId: data.employeeId.trim(),
      name: data.name.trim(),
      position: data.position.trim(),
      department: data.department.trim(),
      status: data.status,
      employmentType: data.employmentType,
      contact: data.contact.trim(),
      email: data.email.trim().toLowerCase(),
      hireDate: data.hireDate.trim(),
      addressLine1: data.addressLine1.trim(),
      addressLine2: data.addressLine2.trim(),
      city: data.city.trim(),
      province: data.province.trim(),
      zipCode: data.zipCode.trim(),
      sssNumber: extractDigits(data.sssNumber),
      philHealthNumber: extractDigits(data.philHealthNumber),
      pagIbigNumber: extractDigits(data.pagIbigNumber),
      tinNumber: extractDigits(data.tinNumber),
    };
  }

  function validateAddForm(form: FormData): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.userId) {
      errors.userId = "Linked user is required.";
    } else {
      const numericUserId = Number(form.userId);
      if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
        errors.userId = "Selected user is invalid.";
      }
    }

    if (!form.position.trim()) {
      errors.position = "Position is required.";
    }

    if (!form.department.trim()) {
      errors.department = "Department is required.";
    }

    if (!form.employmentType.trim()) {
      errors.employmentType = "Employment type is required.";
    }

    return errors;
  }

  function validateEditForm(form: FormData): FieldErrors {
    const errors: FieldErrors = {};

    if (!form.name.trim()) {
      errors.name = "Employee name is required.";
    } else {
      const { firstName, lastName } = parseNameToParts(form.name);
      if (!firstName || !lastName) {
        errors.name = "Invalid employee name.";
      }
    }

    if (form.email) {
      const email = form.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Invalid email format.";
      }
    }

    if (form.contact.trim()) {
      const digits = extractDigits(form.contact);
      if (digits.length < 7 || digits.length > 15) {
        errors.contact = "Contact number must be 7 to 15 digits.";
      }
    }

    if (form.zipCode.trim()) {
      const zipDigits = extractDigits(form.zipCode);
      if (zipDigits.length !== 4) {
        errors.zipCode = "Zip code must be exactly 4 digits.";
      }
    }

    if (form.sssNumber.trim()) {
      const digits = extractDigits(form.sssNumber);
      if (digits.length !== 10) {
        errors.sssNumber = "SSS number must contain exactly 10 digits.";
      }
    }

    if (form.philHealthNumber.trim()) {
      const digits = extractDigits(form.philHealthNumber);
      if (digits.length !== 12) {
        errors.philHealthNumber =
          "PhilHealth number must contain exactly 12 digits.";
      }
    }

    if (form.pagIbigNumber.trim()) {
      const digits = extractDigits(form.pagIbigNumber);
      if (digits.length !== 12) {
        errors.pagIbigNumber =
          "Pag-IBIG number must contain exactly 12 digits.";
      }
    }

    if (form.tinNumber.trim()) {
      const digits = extractDigits(form.tinNumber);
      if (digits.length !== 9) {
        errors.tinNumber = "TIN must contain exactly 9 digits.";
      }
    }

    return errors;
  }

  async function fetchEmployees() {
    setLoading(true);
    setEmployeesError(null);

    try {
      const res = await getEmployees({
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        search: searchTerm.trim() || undefined,
        isActive: isActiveQuery,
      });

      const payload = unwrapData<Paged<EmployeeDto> | EmployeeDto[]>(res);

      if (Array.isArray(payload)) {
        setEmployees(payload.map(mapDtoToEmployee));
        setTotalCount(payload.length);
        return;
      }

      const items = Array.isArray(payload.items) ? payload.items : [];
      setEmployees(items.map(mapDtoToEmployee));

      const payloadWithMaybeTotalItems = payload as Paged<EmployeeDto> & {
        totalItems?: number;
      };

      const tc =
        typeof payload.totalCount === "number"
          ? payload.totalCount
          : typeof payloadWithMaybeTotalItems.totalItems === "number"
            ? payloadWithMaybeTotalItems.totalItems
            : items.length;

      setTotalCount(tc);
    } catch (e) {
      setEmployees([]);
      setTotalCount(0);
      setEmployeesError(
        e instanceof Error ? e.message : "Failed to load employees"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsersForDropdown() {
    setLoadingUsers(true);
    setFormError(null);

    try {
      const mapped = await getUserOptionsForEmployeeDropdown();
      setUserOptions(mapped);
    } catch (e) {
      setUserOptions([]);
      setFormError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  }

  async function fetchEmployeeDtoById(id: string) {
    const res = await getEmployeeById(id);
    return unwrapData<EmployeeDto>(res);
  }

  async function handleLinkedUserChange(userId: string) {
    clearFieldError("userId");

    const selected = userOptions.find((u) => u.id === userId);
    const requestId = ++employeeNumberRequestRef.current;

    const baseUpdate = {
      userId,
      name: selected?.fullName ?? "",
      email: selected?.email ?? "",
      contact: selected?.contactNumber ?? "",
      hireDate: new Date().toISOString().slice(0, 10),
    };

    if (!userId) {
      setFormData((p) => ({
        ...p,
        ...baseUpdate,
        employeeId: "",
      }));
      return;
    }

    setFormData((p) => ({
      ...p,
      ...baseUpdate,
    }));

    try {
      const res = await getNextEmployeeNumber();
      const payload = unwrapData<{ employeeNumber: string }>(res);

      if (requestId !== employeeNumberRequestRef.current) return;

      if (payload?.employeeNumber) {
        setFormData((p) => {
          if (p.userId !== userId) return p;

          return {
            ...p,
            employeeId: payload.employeeNumber,
          };
        });
      }
    } catch {
      if (requestId !== employeeNumberRequestRef.current) return;

      setFormData((p) => {
        if (p.userId !== userId) return p;

        return {
          ...p,
          employeeId: "",
        };
      });
    }
  }

  useEffect(() => {
    setPage(1);
  }, [searchTerm, isActiveQuery]);

  useEffect(() => {
    void fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, isActiveQuery]);

  useEffect(() => {
    if (showAddModal) {
      void fetchUsersForDropdown();
    } else {
      setFormError(null);
      setFieldErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal]);

  const rows: EmployeeRow[] = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        name: e.name,
        position: e.position,
        department: e.department,
        status: e.status,
      })),
    [employees]
  );

  const totalActive = useMemo(
    () => employees.filter((e) => e.status === "Active").length,
    [employees]
  );
  const totalOnLeave = useMemo(
    () => employees.filter((e) => e.status === "On Leave").length,
    [employees]
  );
  const totalInactive = useMemo(
    () => employees.filter((e) => e.status === "Inactive").length,
    [employees]
  );

  const hasEditChanges = useMemo(() => {
    if (!initialEditFormData) return true;

    return (
      JSON.stringify(normalizeFormDataForComparison(formData)) !==
      JSON.stringify(normalizeFormDataForComparison(initialEditFormData))
    );
  }, [formData, initialEditFormData]);

  const openEdit = async (id: string) => {
    setFormError(null);
    setFieldErrors({});
    setEmployeesError(null);
    setDetailsLoading(true);

    try {
      const dto = await fetchEmployeeDtoById(id);
      const employee = mapDtoToEmployee(dto);
      const mappedForm = mapDtoToFormData(dto);

      setSelectedEmployee(employee);
      setFormData(mappedForm);
      setInitialEditFormData(mappedForm);
      setShowEditModal(true);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load employee details";

      setFormError(message);
      setEmployeesError(message);
      setShowEditModal(false);
      setSelectedEmployee(null);
      setInitialEditFormData(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openView = async (id: string) => {
    setEmployeesError(null);
    setDetailsLoading(true);

    try {
      const dto = await fetchEmployeeDtoById(id);
      setSelectedEmployee(mapDtoToEmployee(dto));
      setShowViewPanel(true);
    } catch (e) {
      setEmployeesError(
        e instanceof Error ? e.message : "Failed to load employee details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewRow = async (row: EmployeeRow) => {
    if (detailsLoading) return;
    await openView(row.id);
  };

  const handleEditRow = async (row: EmployeeRow) => {
    if (detailsLoading) return;
    await openEdit(row.id);
  };

  const handleOpenAddModal = () => {
    setFormError(null);
    setFieldErrors({});
    setFormData(emptyFormData());
    setInitialEditFormData(null);
    setShowAddModal(true);
  };

  const handleAdd = async () => {
    if (submitting) return;

    setFormError(null);

    const validationErrors = validateAddForm(formData);
    setFieldErrors(validationErrors);

    const firstError = getFirstFieldError(validationErrors);
    if (firstError) {
      setFormError(firstError);
      return;
    }

    const numericUserId = Number(formData.userId);

    const payload: Parameters<typeof createEmployee>[0] = {
      userId: numericUserId,
      employmentType: formData.employmentType,
      department: normalizeOptionalText(formData.department),
      position: normalizeOptionalText(formData.position),
    };

    setSubmitting(true);

    try {
      await createEmployee(payload);
      setFieldErrors({});
      setFormError(null);
      toast.success("Employee created successfully.");
      setShowAddModal(false);
      resetModalState();
      await fetchEmployees();
    } catch (e) {
      const normalizedMessage = getEmployeeApiErrorMessage(e);
      const mapped = mapEmployeeMutationErrorToUiMessage(
        normalizedMessage,
        "add"
      );

      if (mapped.fieldErrors) {
        setFieldErrors(mapped.fieldErrors);
        setFormError(mapped.formMessage || normalizedMessage);
      } else {
        setFieldErrors({});
        setFormError(mapped.formMessage || normalizedMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedEmployee || submitting) return;

    if (!hasEditChanges) {
      setFormError("No changes detected.");
      return;
    }

    setFormError(null);

    const validationErrors = validateEditForm(formData);
    setFieldErrors(validationErrors);

    const firstError = getFirstFieldError(validationErrors);
    if (firstError) {
      setFormError(firstError);
      return;
    }

    const { firstName, middleName, lastName } = parseNameToParts(formData.name);

    const normalizedStatus: EmployeeStatus =
      formData.status === "Inactive" ? "Inactive" : "Active";

    const updatePayload: UpdateEmployeeRequest & { status: EmployeeStatus } = {
      firstName: firstName.trim(),
      middleName: normalizeOptionalText(middleName ?? ""),
      lastName: lastName.trim(),
      position: normalizeOptionalText(formData.position),
      department: normalizeOptionalText(formData.department),
      employmentType: formData.employmentType,
      contactNumber: normalizeContactNumber(formData.contact),
      email: normalizeEmailValue(formData.email),
      addressLine1: normalizeOptionalText(formData.addressLine1),
      addressLine2: normalizeOptionalText(formData.addressLine2),
      city: normalizeOptionalText(formData.city),
      province: normalizeOptionalText(formData.province),
      zipCode: normalizeZipCode(formData.zipCode),
      sssNumber: normalizeGovernmentNumber(formData.sssNumber),
      philHealthNumber: normalizeGovernmentNumber(formData.philHealthNumber),
      pagIbigNumber: normalizeGovernmentNumber(formData.pagIbigNumber),
      tinNumber: normalizeGovernmentNumber(formData.tinNumber),
      isActive: normalizedStatus === "Active",
      status: normalizedStatus,
    };

    setSubmitting(true);

    try {
      const updatedDto = await updateEmployee(selectedEmployee.id, updatePayload);
      const refreshedForm = mapDtoToFormData(updatedDto);
      const refreshedEmployee = mapDtoToEmployee(updatedDto);

      setSelectedEmployee(refreshedEmployee);
      setFormData(refreshedForm);
      setInitialEditFormData(refreshedForm);
      setFieldErrors({});
      setFormError(null);

      await fetchEmployees();
      toast.success("Employee details updated successfully.");
    } catch (e) {
      const maybeError = e as {
        response?: {
          data?: {
            errors?: Record<string, string[]>;
            message?: string;
          };
        };
      };

      const serverErrors = maybeError.response?.data?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const nextFieldErrors: FieldErrors = {};

        for (const [key, messages] of Object.entries(serverErrors)) {
          const firstMessage = Array.isArray(messages) ? messages[0] : undefined;
          if (!firstMessage?.trim()) continue;

          if (
            key === "sssNumber" ||
            key === "philHealthNumber" ||
            key === "pagIbigNumber" ||
            key === "tinNumber"
          ) {
            nextFieldErrors[key] = firstMessage.trim();
          }
        }

        setFieldErrors(nextFieldErrors);
        setFormError(null);
      } else {
        const normalizedMessage = getEmployeeApiErrorMessage(e);
        const mapped = mapEmployeeMutationErrorToUiMessage(
          normalizedMessage,
          "edit"
        );

        if (mapped.fieldErrors) {
          setFieldErrors(mapped.fieldErrors);
          setFormError(mapped.formMessage || normalizedMessage);
        } else {
          setFieldErrors({});
          setFormError(mapped.formMessage || normalizedMessage);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    if (nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Employee Information Management</h1>
          <p>Manage employee records and information</p>
        </div>
      </div>

      <EmployeeStats
        total={employees.length}
        active={totalActive}
        onLeave={totalOnLeave}
        inactive={totalInactive}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <div
        className="pro-card overflow-visible animate-fade-in-up"
        style={{ animationDelay: "0.2s", opacity: 0 }}
      >
        <div className="p-6 pb-0 overflow-visible">
          <EmployeeToolbar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            loading={loading}
            apiError={employeesError}
            onAddEmployee={handleOpenAddModal}
          />
        </div>

        <EmployeeTable
          rows={rows}
          onView={handleViewRow}
          onEdit={handleEditRow}
          page={page}
          pageSize={DEFAULT_PAGE_SIZE}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          loading={loading || detailsLoading}
        />
      </div>

      <EmployeeAddModal
        open={showAddModal}
        formData={formData}
        setFormData={setFormData}
        apiError={formError}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
        loading={submitting}
        loadingUsers={loadingUsers}
        userOptions={userOptions}
        onClose={() => {
          setShowAddModal(false);
          resetModalState();
        }}
        onSubmit={handleAdd}
        onLinkedUserChange={handleLinkedUserChange}
      />

      <EmployeeEditModal
        open={showEditModal}
        employeeId={selectedEmployee?.id ?? null}
        formData={formData}
        setFormData={setFormData}
        apiError={formError}
        fieldErrors={fieldErrors}
        onClearFieldError={clearFieldError}
        loading={submitting || detailsLoading}
        isSubmitDisabled={!hasEditChanges}
        onClose={() => {
          setShowEditModal(false);
          resetModalState();
        }}
        onSubmit={handleEdit}
      />

      <EmployeeViewPanel
        open={showViewPanel}
        employee={selectedEmployee}
        onClose={() => {
          setShowViewPanel(false);
          resetModalState();
        }}
      />
    </div>
  );
};

export default EmployeeList;
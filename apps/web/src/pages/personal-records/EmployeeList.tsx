import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  getNextEmployeeNumber,
  type UpdateEmployeeRequest,
  type EmployeeDto,
  type EmployeeStatus,
} from "../../lib/employees";

import { getUserOptionsForEmployeeDropdown } from "../../lib/users";

import {
  EmployeeFormFields,
  type FormData,
  type UserOption,
  type EmploymentType,
} from "../../components/personal-records/EmployeeFormFields";
import {
  EmployeeTable,
  type EmployeeRow,
} from "../../components/personal-records/EmployeeTable";
import { EmployeeToolbar } from "../../components/personal-records/EmployeeToolbar";
import { EmployeeStats } from "../../components/personal-records/EmployeeStats";
import { EmployeeViewPanel } from "../../components/personal-records/EmployeeViewPanel";

interface Employee {
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
}

function safeTrim(v: string | null | undefined) {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeNullString(v: string | null | undefined) {
  const s = safeTrim(v);
  if (!s) return "";
  if (s.toLowerCase() === "null") return "";
  return s;
}

function buildName(dto: EmployeeDto) {
  const last = safeTrim(dto.lastName);
  const first = safeTrim(dto.firstName);
  const middle = normalizeNullString(dto.middleName);
  const base = [last, first].filter(Boolean).join(", ");
  return [base, middle].filter(Boolean).join(" ").trim() || "(No name)";
}

function mapDtoToEmployee(dto: EmployeeDto): Employee {
  return {
    id: dto.id,
    employeeId: safeTrim(dto.employeeNumber) || `EMP-${dto.id}`,
    name: buildName(dto),
    position: safeTrim(dto.position) || "",
    department: safeTrim(dto.department) || "",
    status: dto.isActive ? "Active" : "Inactive",
    employmentType:
      dto.employmentType === "Probationary" ||
      dto.employmentType === "Project-based"
        ? dto.employmentType
        : "Regular",
    contact: safeTrim(dto.contactNumber) || "",
    email: safeTrim(dto.email) || "",
    hireDate: safeTrim(dto.dateHired) || "",
    addressLine1: safeTrim(dto.addressLine1) || "",
    addressLine2: safeTrim(dto.addressLine2) || "",
    city: safeTrim(dto.city) || "",
    province: safeTrim(dto.province) || "",
    zipCode: safeTrim(dto.zipCode) || "",
  };
}

function parseNameToParts(fullName: string) {
  const raw = fullName.trim();

  if (raw.includes(",")) {
    const [last, rest] = raw.split(",", 2);
    const lastName = (last ?? "").trim();
    const parts = (rest ?? "").trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] ?? "";
    const middleName = parts.length > 1 ? parts.slice(1).join(" ") : undefined;
    return { firstName, middleName, lastName };
  }

  const parts = raw.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ") || "Unknown";
  return { firstName, middleName: undefined, lastName };
}

function unwrapData<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

type Paged<T> = {
  items: T[];
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
};

const DEFAULT_PAGE_SIZE = 10;

const emptyFormData = (): FormData => ({
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
});

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const [employeesError, setEmployeesError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [formData, setFormData] = useState<FormData>(emptyFormData());

  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

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

  async function fetchNextEmployeeNumber() {
    try {
      const res = await getNextEmployeeNumber();
      const payload = unwrapData<{ employeeNumber: string }>(res);

      if (payload?.employeeNumber) {
        setFormData((p) => ({
          ...p,
          employeeId: payload.employeeNumber,
        }));
      }
    } catch {
      setFormData((p) => ({
        ...p,
        employeeId: "",
      }));
    }
  }

  async function handleLinkedUserChange(userId: string) {
    const selected = userOptions.find((u) => u.id === userId);

    setFormData((p) => ({
      ...p,
      userId,
      name: selected?.fullName ?? "",
      email: selected?.email ?? "",
      contact: selected?.contactNumber ?? "",
      employeeId: userId ? p.employeeId : "",
      hireDate: new Date().toISOString().slice(0, 10),
    }));

    if (userId) {
      await fetchNextEmployeeNumber();
      return;
    }

    setFormData((p) => ({
      ...p,
      employeeId: "",
      hireDate: new Date().toISOString().slice(0, 10),
    }));
  }

  useEffect(() => {
    setPage(1);
  }, [searchTerm, isActiveQuery]);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, isActiveQuery]);

  useEffect(() => {
    if (showAddModal) {
      fetchUsersForDropdown();
    } else {
      setFormError(null);
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

  const openEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFormError(null);
    setFormData({
      userId: "",
      employeeId: emp.employeeId,
      name: emp.name,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      employmentType: emp.employmentType,
      contact: emp.contact,
      email: emp.email,
      hireDate: emp.hireDate,
      addressLine1: emp.addressLine1,
      addressLine2: emp.addressLine2,
      city: emp.city,
      province: emp.province,
      zipCode: emp.zipCode,
    });
    setShowEditModal(true);
  };

  const openView = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowViewPanel(true);
  };

  const handleViewRow = (row: EmployeeRow) => {
    const emp = employees.find((x) => x.id === row.id);
    if (emp) openView(emp);
  };

  const handleEditRow = (row: EmployeeRow) => {
    const emp = employees.find((x) => x.id === row.id);
    if (emp) openEdit(emp);
  };

  const handleAdd = async () => {
    setFormError(null);

    if (!formData.userId) {
      setFormError("Linked user is required.");
      return;
    }

    const numericUserId = Number(formData.userId);
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) {
      setFormError("Selected user is invalid.");
      return;
    }

    if (!formData.employmentType.trim()) {
      setFormError("Employment type is required.");
      return;
    }

    const payload: Parameters<typeof createEmployee>[0] = {
      userId: numericUserId,
      employmentType: formData.employmentType,
      department: formData.department || undefined,
      position: formData.position || undefined,
      contactNumber: formData.contact || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      province: formData.province || undefined,
      zipCode: formData.zipCode || undefined,
    };

    try {
      await createEmployee(payload);
      setShowAddModal(false);
      setFormData(emptyFormData());
      await fetchEmployees();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create employee");
    }
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;

    setFormError(null);

    const { firstName, middleName, lastName } = parseNameToParts(
      selectedEmployee.name
    );

    if (!firstName || !lastName) {
      setFormError("Invalid employee name.");
      return;
    }

    const updatePayload: UpdateEmployeeRequest & { status: EmployeeStatus } = {
      firstName,
      middleName,
      lastName,
      position: formData.position || undefined,
      department: formData.department || undefined,
      employmentType: formData.employmentType,
      contactNumber: formData.contact || undefined,
      email: formData.email || undefined,
      addressLine1: formData.addressLine1 || undefined,
      addressLine2: formData.addressLine2 || undefined,
      city: formData.city || undefined,
      province: formData.province || undefined,
      zipCode: formData.zipCode || undefined,
      isActive: formData.status !== "Inactive",
      status: formData.status,
    };

    try {
      await updateEmployee(selectedEmployee.id, updatePayload);
      setShowEditModal(false);
      setSelectedEmployee(null);
      await fetchEmployees();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to update employee");
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1) return;
    if (nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-fade-in-up">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Employee Information Management</h1>
          <p>Manage employee records and information</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setFormData(emptyFormData());
            setShowAddModal(true);
          }}
          className="btn btn-primary"
          type="button"
        >
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <EmployeeStats
        total={employees.length}
        active={totalActive}
        onLeave={totalOnLeave}
        inactive={totalInactive}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
      />

      <EmployeeToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filterStatus={filterStatus}
        onFilterStatusChange={setFilterStatus}
        loading={loading}
        apiError={employeesError}
      />

      <EmployeeTable
        rows={rows}
        onView={handleViewRow}
        onEdit={handleEditRow}
        page={page}
        pageSize={DEFAULT_PAGE_SIZE}
        totalCount={totalCount}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        loading={loading}
      />

      {showAddModal && (
        <div className="pro-modal-overlay">
          <div
            className="pro-modal max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-modal-header">
              <h3>Add New Employee</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-ghost btn-icon"
                type="button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="pro-modal-body">
              <EmployeeFormFields
                mode="add"
                formData={formData}
                setFormData={setFormData}
                apiError={formError}
                loading={loading}
                onCancel={() => setShowAddModal(false)}
                onSubmit={handleAdd}
                submitLabel="Add Employee"
                userOptions={userOptions}
                loadingUsers={loadingUsers}
                onLinkedUserChange={handleLinkedUserChange}
              />
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="pro-modal-overlay">
          <div
            className="pro-modal max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pro-modal-header">
              <h3>Edit Employee</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-ghost btn-icon"
                type="button"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="pro-modal-body">
              <EmployeeFormFields
                mode="edit"
                formData={formData}
                setFormData={setFormData}
                apiError={formError}
                loading={loading}
                onCancel={() => setShowEditModal(false)}
                onSubmit={handleEdit}
                submitLabel="Save Changes"
              />
            </div>
          </div>
        </div>
      )}

      <EmployeeViewPanel
        open={showViewPanel}
        employee={selectedEmployee}
        onClose={() => setShowViewPanel(false)}
      />
    </div>
  );
};

export default EmployeeList;
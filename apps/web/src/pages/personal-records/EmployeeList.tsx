import { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  type CreateEmployeeRequest,
  type UpdateEmployeeRequest,
  type EmployeeDto,
  type EmployeeStatus,
} from "../../lib/employees";

import { getUserOptionsForEmployeeDropdown } from "../../lib/users";

import {
  EmployeeFormFields,
  type FormData,
  type UserOption,
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
  contact: string;
  email: string;
  hireDate: string;
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
    contact: safeTrim(dto.contactNumber) || "",
    email: safeTrim(dto.email) || "",
    hireDate: safeTrim(dto.dateHired) || "",
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

function toDateOnly(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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

  const [formData, setFormData] = useState<FormData>({
    userId: "",
    name: "",
    position: "",
    department: "",
    status: "Active",
    contact: "",
    email: "",
  });

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

      const tc =
        typeof payload.totalCount === "number"
          ? payload.totalCount
          : typeof (payload as { totalItems?: number }).totalItems === "number"
            ? (payload as { totalItems: number }).totalItems
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

  useEffect(() => {
    setPage(1);
  }, [searchTerm, isActiveQuery]);

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchTerm, isActiveQuery]);

  useEffect(() => {
    if (showAddModal) fetchUsersForDropdown();
    else setFormError(null);
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
      name: emp.name,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      contact: emp.contact,
      email: emp.email,
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
      setFormError("Full Name is required.");
      return;
    }

    const { firstName, middleName, lastName } = parseNameToParts(formData.name);
    if (!firstName || !lastName) {
      setFormError("Full Name is required.");
      return;
    }

    const payload: CreateEmployeeRequest & { status: EmployeeStatus } = {
      employeeNumber: `EMP-${Date.now()}`,
      firstName,
      middleName,
      lastName,
      position: formData.position || undefined,
      department: formData.department || undefined,
      contactNumber: formData.contact || undefined,
      email: formData.email || undefined,
      dateHired: toDateOnly(new Date().toISOString()),
      status: formData.status,
    };

    try {
      await createEmployee(payload);
      setShowAddModal(false);
      setFormData({
        userId: "",
        name: "",
        position: "",
        department: "",
        status: "Active",
        contact: "",
        email: "",
      });
      await fetchEmployees();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create employee");
    }
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;

    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Full Name is required.");
      return;
    }

    const { firstName, middleName, lastName } = parseNameToParts(formData.name);
    if (!firstName || !lastName) {
      setFormError("Full Name is required.");
      return;
    }

    const updatePayload: UpdateEmployeeRequest & { status: EmployeeStatus } = {
      firstName,
      middleName,
      lastName,
      position: formData.position || undefined,
      department: formData.department || undefined,
      contactNumber: formData.contact || undefined,
      email: formData.email || undefined,
      dateHired: toDateOnly(selectedEmployee.hireDate) || undefined,
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
            setFormData({
              userId: "",
              name: "",
              position: "",
              department: "",
              status: "Active",
              contact: "",
              email: "",
            });
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
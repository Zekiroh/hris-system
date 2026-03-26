import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";

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

import { getUserOptionsForEmployeeDropdown } from "../../lib/users";

import {
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

  function mapDtoToFormData(dto: EmployeeDto): FormData {
    const employee = mapDtoToEmployee(dto);

    return {
      userId: "",
      employeeId: employee.employeeId,
      name: employee.name,
      position: employee.position,
      department: employee.department,
      status: employee.status,
      employmentType: employee.employmentType,
      contact: employee.contact,
      email: employee.email,
      hireDate: employee.hireDate,
      addressLine1: employee.addressLine1,
      addressLine2: employee.addressLine2,
      city: employee.city,
      province: employee.province,
      zipCode: employee.zipCode,
      sssNumber: employee.sssNumber,
      philHealthNumber: employee.philHealthNumber,
      pagIbigNumber: employee.pagIbigNumber,
      tinNumber: employee.tinNumber,
    };
  }

  function resetModalState() {
    setSelectedEmployee(null);
    setFormData(emptyFormData());
    setFormError(null);
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
    const selected = userOptions.find((u) => u.id === userId);

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

  const openEdit = async (id: string) => {
    setFormError(null);
    setDetailsLoading(true);

    try {
      const dto = await fetchEmployeeDtoById(id);
      const employee = mapDtoToEmployee(dto);

      setSelectedEmployee(employee);
      setFormData(mapDtoToFormData(dto));
      setShowEditModal(true);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Failed to load employee details"
      );
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

    if (!formData.position.trim()) {
      setFormError("Position is required.");
      return;
    }

    if (!formData.department.trim()) {
      setFormError("Department is required.");
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
      resetModalState();
      await fetchEmployees();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create employee");
    }
  };

  const handleEdit = async () => {
    if (!selectedEmployee) return;

    setFormError(null);

    const { firstName, middleName, lastName } = parseNameToParts(formData.name);

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
      sssNumber: formData.sssNumber || undefined,
      philHealthNumber: formData.philHealthNumber || undefined,
      pagIbigNumber: formData.pagIbigNumber || undefined,
      tinNumber: formData.tinNumber || undefined,
      isActive: formData.status !== "Inactive",
      status: formData.status,
    };

    try {
      const res = await updateEmployee(selectedEmployee.id, updatePayload);
      const dto = unwrapData<EmployeeDto>(res);
      const updatedEmployee = mapDtoToEmployee(dto);

      setSelectedEmployee(updatedEmployee);
      setShowEditModal(false);
      resetModalState();
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
        loading={loading || detailsLoading}
      />

      <EmployeeAddModal
        open={showAddModal}
        formData={formData}
        setFormData={setFormData}
        apiError={formError}
        loading={loading}
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
        formData={formData}
        setFormData={setFormData}
        apiError={formError}
        loading={loading || detailsLoading}
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
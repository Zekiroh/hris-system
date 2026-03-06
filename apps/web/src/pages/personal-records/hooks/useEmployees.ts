import { useEffect, useMemo, useState } from "react";
import { getEmployees, type EmployeeDto } from "../../../lib/employees";

export type UiStatus = "Active" | "On Leave" | "Inactive";

export interface EmployeeRow {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  department: string;
  status: UiStatus;
  contact: string;
  email: string;
  hireDate: string;
}

type PagedEmployeesLike = {
  items: EmployeeDto[];
  totalCount: number;
  page: number;
  pageSize: number;
};

type PagedEmployeesResponseOrWrapped =
  | PagedEmployeesLike
  | { data: PagedEmployeesLike };

function safeTrim(v: string | null | undefined): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeNullString(v: string | null | undefined): string {
  const s = safeTrim(v);
  if (!s) return "";
  if (s.toLowerCase() === "null") return "";
  return s;
}

function buildDisplayName(dto: EmployeeDto): string {
  const last = safeTrim(dto.lastName);
  const first = safeTrim(dto.firstName);
  const middle = normalizeNullString(dto.middleName);

  const base = [last, first].filter(Boolean).join(", ");
  const full = [base, middle].filter(Boolean).join(" ").trim();

  return full || "(No name)";
}

function mapDtoToRow(dto: EmployeeDto): EmployeeRow {
  const employeeId = safeTrim(dto.employeeNumber) || `EMP-${dto.id}`;
  const name = buildDisplayName(dto);
  const hireDate = safeTrim(dto.dateHired) || "—";

  return {
    id: dto.id,
    employeeId,
    name,
    position: safeTrim(dto.position) || "—",
    department: safeTrim(dto.department) || "—",
    status: dto.isActive ? "Active" : "Inactive",
    contact: safeTrim(dto.contactNumber) || "—",
    email: safeTrim(dto.email) || "—",
    hireDate,
  };
}

function isPagedEmployeesLike(v: unknown): v is PagedEmployeesLike {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;

  return (
    Array.isArray(obj.items) &&
    typeof obj.totalCount === "number" &&
    typeof obj.page === "number" &&
    typeof obj.pageSize === "number"
  );
}

function normalizePagedResponse(res: unknown): PagedEmployeesLike {
  if (isPagedEmployeesLike(res)) return res;

  if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>;
    if (isPagedEmployeesLike(obj.data)) return obj.data;
  }

  return { items: [], totalCount: 0, page: 1, pageSize: 10 };
}

export function useEmployeesList() {
  // list state
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // paging
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // UI filter -> backend isActive query
  const isActiveQuery = useMemo(() => {
    if (statusFilter === "Active") return true;
    if (statusFilter === "Inactive") return false;
    return undefined; // All / On Leave not supported by backend yet
  }, [statusFilter]);

  const totalPages = useMemo(() => {
    const pages = Math.ceil(totalCount / pageSize);
    return Math.max(1, pages || 1);
  }, [totalCount, pageSize]);

  async function fetchEmployees(opts?: { keepPage?: boolean }) {
    setLoading(true);
    setError(null);

    try {
      const res: PagedEmployeesResponseOrWrapped = await getEmployees({
        page: opts?.keepPage ? page : 1,
        pageSize,
        search: search.trim() || undefined,
        isActive: isActiveQuery,
      });

      const normalized = normalizePagedResponse(res);

      setRows(normalized.items.map(mapDtoToRow));
      setTotalCount(normalized.totalCount);

      if (!opts?.keepPage) setPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load employees");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }

  // auto-fetch on dependency changes
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError(null);

      try {
        const res: PagedEmployeesResponseOrWrapped = await getEmployees({
          page,
          pageSize,
          search: search.trim() || undefined,
          isActive: isActiveQuery,
        });

        if (cancelled) return;

        const normalized = normalizePagedResponse(res);
        setRows(normalized.items.map(mapDtoToRow));
        setTotalCount(normalized.totalCount);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load employees");
        setRows([]);
        setTotalCount(0);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, search, isActiveQuery]);

  // derived stats (current page only; same behavior as your current page)
  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === "Active").length;
    const inactive = rows.filter((r) => r.status === "Inactive").length;
    const onLeave = rows.filter((r) => r.status === "On Leave").length;

    return {
      total: rows.length,
      active,
      inactive,
      onLeave,
    };
  }, [rows]);

  return {
    rows,
    loading,
    error,
    stats,

    page,
    pageSize,
    totalCount,
    totalPages,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    setPage,

    refresh: (keepPage = true) => fetchEmployees({ keepPage }),
  };
}
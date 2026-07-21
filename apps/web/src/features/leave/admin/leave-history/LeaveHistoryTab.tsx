import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Filter, Search } from "lucide-react";
import type { LeaveHistoryEntry } from "../../../../context/LeaveContext";
import type { HistoryFilters, HistorySortFilter, StatusBadgeMap } from "../LeaveTableTypes";
import LeaveHistoryTable from "./LeaveHistoryTable";

const PAGE_SIZE = 10;

type FilterOption<T extends string> = {
  label: string;
  value: T;
};

const SORT_OPTIONS: FilterOption<HistorySortFilter>[] = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

const DEFAULT_FILTERS: HistoryFilters = {
  search: "",
  dateFrom: "",
  dateTo: "",
  sort: "latest",
};

type FilterDropdownProps<T extends string> = {
  value: T;
  options: FilterOption<T>[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: T) => void;
};

function FilterDropdown<T extends string>({
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: FilterDropdownProps<T>) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="pro-input flex w-full items-center justify-between text-left"
      >
        <span className="text-gray-700">{selectedOption?.label ?? "Latest"}</span>
        <span className="ml-3 shrink-0 text-gray-400">▾</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[220] mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`block w-full px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                option.value === value
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-700"
              }`}
              onClick={() => onSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const escapeCsvField = (value: string) => {
  let safeValue = value;

  if (/^[=+\-@]/.test(safeValue)) {
    safeValue = `'${safeValue}`;
  }

  if (/[",\n]/.test(safeValue)) {
    return `"${safeValue.replace(/"/g, '""')}"`;
  }

  return safeValue;
};

const CSV_HEADERS = ["Employee", "Leave Type", "Date Applied", "Duration", "Status", "Approver"];

const rowsToCsv = (rows: LeaveHistoryEntry[]) => {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((r) =>
      [r.employee, r.leaveType, r.dateApplied, r.duration, r.status, r.approver]
        .map((field) => escapeCsvField(String(field)))
        .join(",")
    ),
  ];

  return lines.join("\n");
};

const downloadCsv = (csv: string, filename: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface LeaveHistoryTabProps {
  history: LeaveHistoryEntry[];
  statusBadge: StatusBadgeMap;
}

const LeaveHistoryTab = ({ history, statusBadge }: LeaveHistoryTabProps) => {
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);

  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"sort" | null>(null);
  const [draftDateFrom, setDraftDateFrom] = useState(filters.dateFrom);
  const [draftDateTo, setDraftDateTo] = useState(filters.dateTo);
  const [draftSort, setDraftSort] = useState<HistorySortFilter>(filters.sort);

  const filterRef = useRef<HTMLDivElement | null>(null);

  const hasActiveFilter = Boolean(
    filters.dateFrom || filters.dateTo || filters.sort !== "latest"
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilters(false);
        setOpenDropdown(null);
        setDraftDateFrom(filters.dateFrom);
        setDraftDateTo(filters.dateTo);
        setDraftSort(filters.sort);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [filters.dateFrom, filters.dateTo, filters.sort]);

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPage(1);
  };

  const handleApplyFilters = () => {
    if (draftDateFrom && draftDateTo && draftDateFrom > draftDateTo) {
      alert('"Date From" must be before or equal to "Date To".');
      return;
    }

    setFilters((prev) => ({
      ...prev,
      dateFrom: draftDateFrom,
      dateTo: draftDateTo,
      sort: draftSort,
    }));
    setPage(1);
    setShowFilters(false);
    setOpenDropdown(null);
  };

  const handleClearDraft = () => {
    setDraftDateFrom("");
    setDraftDateTo("");
    setDraftSort("latest");

    setFilters((prev) => ({ ...prev, dateFrom: "", dateTo: "", sort: "latest" }));
    setPage(1);
    setShowFilters(false);
    setOpenDropdown(null);
  };

  const filteredHistory = useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    let list = history.filter((r) => {
      if (query) {
        const matches =
          r.employee.toLowerCase().includes(query) ||
          r.leaveType.toLowerCase().includes(query) ||
          r.approver.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filters.dateFrom && r.dateApplied < filters.dateFrom) return false;
      if (filters.dateTo && r.dateApplied > filters.dateTo) return false;

      return true;
    });

    list = [...list].sort((a, b) =>
      filters.sort === "latest"
        ? b.dateApplied.localeCompare(a.dateApplied)
        : a.dateApplied.localeCompare(b.dateApplied)
    );

    return list;
  }, [history, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paginatedHistory = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredHistory.slice(start, start + PAGE_SIZE);
  }, [filteredHistory, safePage]);

  const handleExportCsv = () => {
    if (filteredHistory.length === 0) {
      alert("No leave history records match the current search and filters.");
      return;
    }

    const csv = rowsToCsv(filteredHistory);
    const rangeSuffix =
      filters.dateFrom || filters.dateTo
        ? `_${filters.dateFrom || "start"}_to_${filters.dateTo || "end"}`
        : "";
    downloadCsv(csv, `leave-history-report${rangeSuffix}.csv`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search by employee, leave type, or approver..."
            className="h-12 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative overflow-visible" ref={filterRef}>
            <button
              type="button"
              onClick={() => {
                if (!showFilters) {
                  setDraftDateFrom(filters.dateFrom);
                  setDraftDateTo(filters.dateTo);
                  setDraftSort(filters.sort);
                }

                setShowFilters((prev) => !prev);
                setOpenDropdown(null);
              }}
              className={`btn btn-secondary flex items-center gap-2 ${
                hasActiveFilter ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full z-[200] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date From
                    </label>
                    <input
                      type="date"
                      className="pro-input"
                      value={draftDateFrom}
                      max={draftDateTo || undefined}
                      onChange={(e) => setDraftDateFrom(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Date To
                    </label>
                    <input
                      type="date"
                      className="pro-input"
                      value={draftDateTo}
                      min={draftDateFrom || undefined}
                      onChange={(e) => setDraftDateTo(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sort
                    </label>

                    <FilterDropdown
                      value={draftSort}
                      options={SORT_OPTIONS}
                      isOpen={openDropdown === "sort"}
                      onToggle={() =>
                        setOpenDropdown((current) => (current === "sort" ? null : "sort"))
                      }
                      onSelect={(value) => {
                        setDraftSort(value);
                        setOpenDropdown(null);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button type="button" className="btn btn-secondary" onClick={handleClearDraft}>
                      Clear
                    </button>

                    <button type="button" className="btn btn-primary" onClick={handleApplyFilters}>
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredHistory.length === 0}
            className="btn flex items-center gap-2 border-none bg-emerald-600 text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <LeaveHistoryTable
        history={paginatedHistory}
        statusBadge={statusBadge}
        page={safePage}
        totalPages={totalPages}
        onPrev={() =>
          setPage((p) => Math.max(1, Math.min(p, totalPages) - 1))
        }
        onNext={() =>
          setPage((p) => Math.min(totalPages, Math.min(p, totalPages) + 1))
        }
      />
    </div>
  );
};

export default LeaveHistoryTab;

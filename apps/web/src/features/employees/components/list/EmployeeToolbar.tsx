import { Search, Filter, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { EmployeeSortBy } from "../../../../lib/employees";

type FilterOption = {
  label: string;
  value: string;
};

const FILTER_STATUS_OPTIONS: FilterOption[] = [
  { label: "All", value: "All" },
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "New Hires", value: "New Hires" },
];

const SORT_OPTIONS: Array<{ label: string; value: EmployeeSortBy }> = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
  { label: "Name", value: "name" },
];

function FilterDropdown({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: readonly FilterOption[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="pro-input flex w-full items-center justify-between text-left"
      >
        <span className={selectedOption ? "text-gray-700" : "text-gray-500"}>
          {selectedOption?.label ?? "All"}
        </span>
        <span className="ml-3 shrink-0 text-gray-400">▾</span>
      </button>

      {open && (
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
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function EmployeeToolbar({
  searchTerm,
  onSearchTermChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortChange,
  loading,
  apiError,
  onAddEmployee,
}: {
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
  sortBy: EmployeeSortBy;
  onSortChange: (v: EmployeeSortBy) => void;
  loading: boolean;
  apiError: string | null;
  onAddEmployee: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const employmentType = searchParams.get("employmentType");

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [draftFilterStatus, setDraftFilterStatus] = useState(filterStatus);
  const [draftSortBy, setDraftSortBy] = useState<EmployeeSortBy>(sortBy);
  const filterMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setDraftFilterStatus(filterStatus);
  }, [filterStatus]);

  useEffect(() => {
    setDraftSortBy(sortBy);
  }, [sortBy]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterMenuRef.current &&
        !filterMenuRef.current.contains(event.target as Node)
      ) {
        setShowFilterMenu(false);
        setDraftFilterStatus(filterStatus);
        setDraftSortBy(sortBy);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filterStatus, sortBy]);

  const hasPendingFilterChange = draftFilterStatus !== filterStatus;
  const hasPendingSortChange = draftSortBy !== sortBy;
  const hasPendingChanges = hasPendingFilterChange || hasPendingSortChange;
  const hasActiveFilters = filterStatus !== "All" || sortBy !== "latest";

  const clearEmploymentType = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("employmentType");
    setSearchParams(newParams);
  };

  return (
    <div className="overflow-visible">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pro-search max-w-md flex-1">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, ID, or position..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* 🔥 ACTIVE EMPLOYMENT TYPE (NO UI DRIFT) */}
          {employmentType && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">
              <span>{employmentType}</span>
              <button
                onClick={clearEmploymentType}
                className="text-emerald-500 hover:text-emerald-700"
              >
                ✕
              </button>
            </div>
          )}

          <div className="relative overflow-visible" ref={filterMenuRef}>
            <button
              className="btn btn-secondary flex items-center gap-2"
              type="button"
              onClick={() => {
                if (!showFilterMenu) {
                  setDraftFilterStatus(filterStatus);
                  setDraftSortBy(sortBy);
                }
                setShowFilterMenu((prev) => !prev);
              }}
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 top-full z-[200] mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </label>

                    <FilterDropdown
                      value={draftFilterStatus}
                      options={FILTER_STATUS_OPTIONS}
                      onSelect={setDraftFilterStatus}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Sort
                    </label>

                    <FilterDropdown
                      value={draftSortBy}
                      options={SORT_OPTIONS}
                      onSelect={(value) => setDraftSortBy(value as EmployeeSortBy)}
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setDraftFilterStatus("All");
                        setDraftSortBy("latest");
                        onFilterStatusChange("All");
                        onSortChange("latest");
                        setShowFilterMenu(false);
                      }}
                      disabled={!hasActiveFilters}
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        onFilterStatusChange(draftFilterStatus);
                        onSortChange(draftSortBy);
                        setShowFilterMenu(false);
                      }}
                      disabled={!hasPendingChanges}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onAddEmployee}
            className="btn btn-primary flex items-center gap-2"
            type="button"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {loading && <div className="mt-3 text-sm text-gray-400">Loading...</div>}
      {apiError && <div className="mt-3 text-sm text-red-600">{apiError}</div>}
    </div>
  );
}

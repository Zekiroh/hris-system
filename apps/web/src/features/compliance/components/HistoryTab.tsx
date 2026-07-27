import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import {
  getEmploymentStatusHistory,
  type EmploymentStatusHistoryDto,
} from "../../../services/api/government-compliance/governmentCompliance";
import { formatDate } from "../config/helpers";
import { useComplianceTablePagination } from "../config/pagination";
import { TablePagination, TablePlaceholderRows } from "./TablePagination";

const formatActiveState = (value?: boolean | null) => {
  if (value === null || value === undefined) return "-";
  return value ? "Active" : "Inactive";
};

export const HistoryTab = () => {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [submittedDateFrom, setSubmittedDateFrom] = useState("");
  const [submittedDateTo, setSubmittedDateTo] = useState("");
  const [items, setItems] = useState<EmploymentStatusHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    currentPage,
    totalPages,
    pageItems: paginatedItems,
    goToPreviousPage,
    goToNextPage,
  } = useComplianceTablePagination(
    items,
    `${submittedSearch}-${submittedDateFrom}-${submittedDateTo}`,
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getEmploymentStatusHistory({
        search: submittedSearch,
        dateFrom: submittedDateFrom,
        dateTo: submittedDateTo,
      });
      setItems(result);
    } catch (err) {
      console.error("Failed to load employment status history.", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employment status history. Please try again.",
      );
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [submittedDateFrom, submittedDateTo, submittedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilters = () => {
    if (
      submittedSearch !== search ||
      submittedDateFrom !== dateFrom ||
      submittedDateTo !== dateTo
    ) {
      setSubmittedSearch(search);
      setSubmittedDateFrom(dateFrom);
      setSubmittedDateTo(dateTo);
      return;
    }

    loadData();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-base font-bold text-gray-800">
          Employment Status History
        </h3>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="btn btn-secondary disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_160px_160px_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applyFilters();
            }}
            disabled={isLoading}
            className="pro-input pl-11"
            placeholder="Search employee, department, or position"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
          disabled={isLoading}
          className="pro-input"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
          disabled={isLoading}
          className="pro-input"
        />
        <button
          type="button"
          onClick={applyFilters}
          disabled={isLoading}
          className="btn btn-primary disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">
          Loading employment status history...
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          No employment status history records found.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Changed At",
                "Employee ID",
                "Employee",
                "Previous Status",
                "New Status",
                "Previous Active",
                "New Active",
                "Changed By",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && (
              paginatedItems.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.changedAtUtc)}</td>
                  <td className="font-mono text-xs">{item.employeeNumber}</td>
                  <td>
                    <p className="!font-medium !text-gray-800">{item.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {[item.department, item.position].filter(Boolean).join(" / ") || "-"}
                    </p>
                  </td>
                  <td>{item.previousEmploymentStatus || "-"}</td>
                  <td>{item.newEmploymentStatus}</td>
                  <td>{formatActiveState(item.previousIsActive)}</td>
                  <td>
                    <span
                      className={`badge ${
                        item.newIsActive ? "badge-success" : "badge-neutral"
                      }`}
                    >
                      <span className="badge-dot" />
                      {formatActiveState(item.newIsActive)}
                    </span>
                  </td>
                  <td>
                    {item.changedByUserName || item.changedByUserEmail || "-"}
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={isLoading ? 0 : paginatedItems.length}
              columnCount={8}
            />
          </tbody>
        </table>
      </div>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={isLoading}
        onPrevious={goToPreviousPage}
        onNext={goToNextPage}
      />
    </div>
  );
};

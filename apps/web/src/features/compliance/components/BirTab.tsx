import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Save, Search } from "lucide-react";

import {
  getBir2316Trackings,
  updateBir2316Tracking,
  type Bir2316TrackingDto,
  type Bir2316TrackingStatus,
} from "../../../services/api/government-compliance/governmentCompliance";
import { formatCurrency } from "../config/helpers";

const statuses: Bir2316TrackingStatus[] = [
  "Pending",
  "Prepared",
  "Released",
  "Acknowledged",
];

const currentYear = new Date().getFullYear();

const getStatusBadge = (status: Bir2316TrackingStatus) => {
  if (status === "Acknowledged") return "badge-success";
  if (status === "Released" || status === "Prepared") return "badge-info";
  return "badge-warning";
};

export const BirTab = () => {
  const [taxYear, setTaxYear] = useState(currentYear);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [items, setItems] = useState<Bir2316TrackingDto[]>([]);
  const [statusDrafts, setStatusDrafts] = useState<
    Record<number, Bir2316TrackingStatus>
  >({});
  const [documentDrafts, setDocumentDrafts] = useState<Record<number, string>>(
    {},
  );
  const [savingId, setSavingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const summary = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.status === "Pending").length,
      prepared: items.filter((item) => item.status === "Prepared").length,
      released: items.filter((item) => item.status === "Released").length,
      acknowledged: items.filter((item) => item.status === "Acknowledged").length,
    }),
    [items],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getBir2316Trackings({
        taxYear,
        search: submittedSearch,
      });
      setItems(result);
      setStatusDrafts(
        Object.fromEntries(result.map((item) => [item.id, item.status])),
      );
      setDocumentDrafts(
        Object.fromEntries(
          result.map((item) => [item.id, item.employeeDocumentId ?? ""]),
        ),
      );
    } catch (err) {
      console.error("Failed to load BIR 2316 tracking.", err);
      setError("Unable to load BIR 2316 tracking. Please try again.");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [submittedSearch, taxYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applySearch = () => {
    if (submittedSearch !== search) {
      setSubmittedSearch(search);
      return;
    }

    loadData();
  };

  const saveTracking = async (item: Bir2316TrackingDto) => {
    setSavingId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await updateBir2316Tracking(item.id, {
        status: statusDrafts[item.id] ?? item.status,
        employeeDocumentId: documentDrafts[item.id]?.trim() || null,
      });
      await loadData();
      setSuccess("BIR 2316 tracking was updated.");
    } catch (err) {
      console.error("Failed to update BIR 2316 tracking.", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update BIR 2316 tracking. Please verify the document linkage and try again.",
      );
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">BIR Form 2316 Tracking</h3>
        </div>
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

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[160px_1fr_auto]">
        <input
          type="number"
          min={1900}
          max={9999}
          value={taxYear}
          onChange={(event) => setTaxYear(Number(event.target.value))}
          disabled={isLoading}
          className="pro-input"
        />
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch();
            }}
            disabled={isLoading}
            className="pro-input pl-9"
            placeholder="Search employee or TIN"
          />
        </div>
        <button
          type="button"
          onClick={applySearch}
          disabled={isLoading}
          className="btn btn-primary disabled:opacity-50"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Records", summary.total],
          ["Pending", summary.pending],
          ["Prepared", summary.prepared],
          ["Released", summary.released],
          ["Acknowledged", summary.acknowledged],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
            <p className="text-xs uppercase text-gray-400">{label}</p>
            <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Employee ID",
                "Employee",
                "TIN",
                "Taxable Compensation",
                "Withholding Tax",
                "Status",
                "Linked Document",
                "Update",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                  Loading BIR 2316 tracking...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-gray-500">
                  No BIR 2316 tracking records found for this tax year.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="font-mono text-xs">{item.employeeNumber}</td>
                  <td>
                    <p className="!font-medium !text-gray-800">{item.employeeName}</p>
                    <p className="text-xs text-gray-500">
                      {[item.department, item.position].filter(Boolean).join(" / ") || "-"}
                    </p>
                  </td>
                  <td className="font-mono text-xs">
                    {item.tinNumber || (
                      <span className="badge badge-warning">
                        <span className="badge-dot" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(item.annualTaxableCompensation)}</td>
                  <td>{formatCurrency(item.annualWithholdingTax)}</td>
                  <td>
                    <select
                      value={statusDrafts[item.id] ?? item.status}
                      onChange={(event) =>
                        setStatusDrafts((current) => ({
                          ...current,
                          [item.id]: event.target.value as Bir2316TrackingStatus,
                        }))
                      }
                      disabled={savingId === item.id}
                      className="pro-input min-w-36"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span className={`badge mt-2 ${getStatusBadge(item.status)}`}>
                      <span className="badge-dot" />
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <input
                      value={documentDrafts[item.id] ?? ""}
                      onChange={(event) =>
                        setDocumentDrafts((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      disabled={savingId === item.id}
                      className="pro-input min-w-64 font-mono text-xs"
                      placeholder="Employee Document ID"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {item.employeeDocumentName || "No document linked"}
                    </p>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => saveTracking(item)}
                      disabled={savingId === item.id}
                      className="btn btn-secondary disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {savingId === item.id ? "Saving" : "Save"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

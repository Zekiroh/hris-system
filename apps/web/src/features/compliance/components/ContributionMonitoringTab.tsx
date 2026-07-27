import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";

import {
  type ComplianceMonitoringResponseDto,
} from "../../../services/api/government-compliance/governmentCompliance";
import {
  getPayrollPeriods,
  type PayrollPeriodDto,
} from "../../../services/api/payroll/payroll";
import { formatCurrency, formatDate } from "../config/helpers";
import { useComplianceTablePagination } from "../config/pagination";
import { TablePagination, TablePlaceholderRows } from "./TablePagination";

type ContributionMonitoringTabProps = {
  title: string;
  governmentNumberLabel: string;
  summaryKeys: {
    employeeTotal: keyof NonNullable<ComplianceMonitoringResponseDto["summary"]>;
    employerTotal: keyof NonNullable<ComplianceMonitoringResponseDto["summary"]>;
    contributionTotal: keyof NonNullable<ComplianceMonitoringResponseDto["summary"]>;
    missingNumberCount: keyof NonNullable<ComplianceMonitoringResponseDto["summary"]>;
  };
  loadMonitoring: (params: {
    payrollPeriodId?: number | null;
    search?: string;
  }) => Promise<ComplianceMonitoringResponseDto>;
};

const formatCapturedCurrency = (value?: number | null) =>
  value === null || value === undefined ? "Not captured" : formatCurrency(value);

const getPeriodLabel = (period: PayrollPeriodDto) =>
  `${formatDate(period.startDate)} - ${formatDate(period.endDate)} (${period.status})`;

export const ContributionMonitoringTab = ({
  title,
  governmentNumberLabel,
  summaryKeys,
  loadMonitoring,
}: ContributionMonitoringTabProps) => {
  const [periods, setPeriods] = useState<PayrollPeriodDto[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [data, setData] = useState<ComplianceMonitoringResponseDto>({
    items: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    currentPage,
    totalPages,
    pageItems: paginatedItems,
    goToPreviousPage,
    goToNextPage,
  } = useComplianceTablePagination(
    data.items,
    `${selectedPeriodId}-${submittedSearch}`,
  );

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.id === selectedPeriodId),
    [periods, selectedPeriodId],
  );

  const loadPeriods = useCallback(async () => {
    const payrollPeriods = await getPayrollPeriods();
    const reportablePeriods = payrollPeriods.filter((period) =>
      ["Processed", "Released"].includes(period.status),
    );

    setPeriods(reportablePeriods);

    if (selectedPeriodId === "" && reportablePeriods[0]) {
      setSelectedPeriodId(reportablePeriods[0].id);
    }
  }, [selectedPeriodId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loadMonitoring({
        payrollPeriodId:
          typeof selectedPeriodId === "number" ? selectedPeriodId : null,
        search: submittedSearch,
      });

      setData(result);
    } catch (err) {
      console.error(`Failed to load ${title}.`, err);
      setError(`Unable to load ${title.toLowerCase()}. Please try again.`);
      setData({ items: [] });
    } finally {
      setIsLoading(false);
    }
  }, [loadMonitoring, selectedPeriodId, submittedSearch, title]);

  useEffect(() => {
    loadPeriods().catch((err) => {
      console.error("Failed to load payroll periods.", err);
      setError("Unable to load payroll periods. Please try again.");
    });
  }, [loadPeriods]);

  useEffect(() => {
    if (selectedPeriodId !== "") {
      loadData();
    }
  }, [loadData, selectedPeriodId]);

  const applySearch = () => {
    if (submittedSearch !== search) {
      setSubmittedSearch(search);
      return;
    }

    loadData();
  };

  const summary = data.summary;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">
            {selectedPeriod ? getPeriodLabel(selectedPeriod) : "Select a payroll period"}
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading || selectedPeriodId === ""}
          className="btn btn-secondary disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[240px_1fr_auto]">
        <select
          value={selectedPeriodId}
          onChange={(event) =>
            setSelectedPeriodId(event.target.value ? Number(event.target.value) : "")
          }
          disabled={isLoading}
          className="pro-input"
        >
          <option value="">Select payroll period</option>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {getPeriodLabel(period)}
            </option>
          ))}
        </select>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") applySearch();
            }}
            disabled={isLoading}
            className="pro-input pl-11"
            placeholder="Search employee, department, or position"
          />
        </div>
        <button
          type="button"
          onClick={applySearch}
          disabled={isLoading || selectedPeriodId === ""}
          className="btn btn-primary disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {[
            ["Records", summary.payrollRecordCount],
            ["Employee Share", formatCurrency(Number(summary[summaryKeys.employeeTotal] ?? 0))],
            ["Employer Share", formatCapturedCurrency(summary[summaryKeys.employerTotal] as number | null)],
            ["Total", formatCapturedCurrency(summary[summaryKeys.contributionTotal] as number | null)],
            ["Missing Numbers", Number(summary[summaryKeys.missingNumberCount] ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="text-xs uppercase text-gray-400">{label}</p>
              <p className="mt-1 text-sm font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">
          Loading payroll contribution records...
        </p>
      ) : data.items.length === 0 ? (
        <p className="text-sm text-gray-500">
          No payroll contribution records found.
        </p>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="pro-table">
          <thead>
            <tr>
              {[
                "Employee ID",
                "Employee Name",
                "Department",
                "Position",
                governmentNumberLabel,
                "Gross Pay",
                "EE Share",
                "ER Share",
                "Total",
                "Payroll Status",
              ].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && (
              paginatedItems.map((row) => (
                <tr key={row.payrollRecordId}>
                  <td className="font-mono text-xs">{row.employeeNumber}</td>
                  <td className="!font-medium !text-gray-800">{row.employeeName}</td>
                  <td>{row.department || "-"}</td>
                  <td>{row.position || "-"}</td>
                  <td className="font-mono text-xs">
                    {row.governmentNumber ? (
                      row.governmentNumber
                    ) : (
                      <span className="badge badge-warning">
                        <span className="badge-dot" />
                        Missing
                      </span>
                    )}
                  </td>
                  <td>{formatCurrency(row.grossPay)}</td>
                  <td>{formatCurrency(row.employeeContribution)}</td>
                  <td>{formatCapturedCurrency(row.employerContribution)}</td>
                  <td className="!font-bold">
                    {formatCapturedCurrency(row.totalContribution)}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        row.payrollStatus === "Released"
                          ? "badge-success"
                          : "badge-warning"
                      }`}
                    >
                      <span className="badge-dot" />
                      {row.payrollStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
            <TablePlaceholderRows
              actualRowCount={isLoading ? 0 : paginatedItems.length}
              columnCount={10}
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

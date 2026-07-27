import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import {
  getComplianceSummary,
  type CompliancePeriodSummaryDto,
} from "../../../services/api/government-compliance/governmentCompliance";
import {
  getPayrollPeriods,
  type PayrollPeriodDto,
} from "../../../services/api/payroll/payroll";
import { formatCurrency, formatDate } from "../config/helpers";

const reportableStatuses = new Set(["Processed", "Released"]);

const getPeriodLabel = (period: PayrollPeriodDto) =>
  `${formatDate(period.startDate)} - ${formatDate(period.endDate)} (${period.status})`;

const formatCapturedCurrency = (value?: number | null) =>
  value === null || value === undefined ? "Not captured" : formatCurrency(value);

type ContributionTotalsProps = {
  title: string;
  employeeTotal: number;
  employerTotal?: number | null;
  contributionTotal?: number | null;
  missingNumberCount: number;
};

const ContributionTotals = ({
  title,
  employeeTotal,
  employerTotal,
  contributionTotal,
  missingNumberCount,
}: ContributionTotalsProps) => (
  <section className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <h4 className="font-bold text-gray-800">{title}</h4>
    <dl className="mt-3 space-y-2 text-sm">
      <div className="flex justify-between gap-3">
        <dt className="text-gray-500">Employee deductions</dt>
        <dd className="font-semibold text-gray-900">{formatCurrency(employeeTotal)}</dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-gray-500">Employer contributions</dt>
        <dd className="font-semibold text-gray-900">
          {formatCapturedCurrency(employerTotal)}
        </dd>
      </div>
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-2">
        <dt className="font-medium text-gray-700">Total contribution</dt>
        <dd className="font-bold text-gray-900">
          {formatCapturedCurrency(contributionTotal)}
        </dd>
      </div>
      <div className="flex justify-between gap-3">
        <dt className="text-gray-500">Missing government numbers</dt>
        <dd className="font-semibold text-gray-900">{missingNumberCount}</dd>
      </div>
    </dl>
  </section>
);

export const ComplianceSummaryTab = () => {
  const [periods, setPeriods] = useState<PayrollPeriodDto[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | "">("");
  const [summary, setSummary] = useState<CompliancePeriodSummaryDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPeriod = useMemo(
    () => periods.find((period) => period.id === selectedPeriodId),
    [periods, selectedPeriodId],
  );

  const loadPeriods = useCallback(async () => {
    const payrollPeriods = await getPayrollPeriods();
    const reportablePeriods = payrollPeriods.filter((period) =>
      reportableStatuses.has(period.status),
    );

    setPeriods(reportablePeriods);
    setSelectedPeriodId((current) =>
      current !== "" && reportablePeriods.some((period) => period.id === current)
        ? current
        : reportablePeriods[0]?.id ?? "",
    );
  }, []);

  const loadSummary = useCallback(async () => {
    if (selectedPeriodId === "") {
      setSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setSummary(await getComplianceSummary({ payrollPeriodId: selectedPeriodId }));
    } catch (err) {
      console.error("Failed to load the compliance summary.", err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load the compliance summary. Please try again.",
      );
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriodId]);

  useEffect(() => {
    loadPeriods().catch((err) => {
      console.error("Failed to load payroll periods.", err);
      setError("Unable to load payroll periods. Please try again.");
    });
  }, [loadPeriods]);

  useEffect(() => {
    if (selectedPeriodId !== "") {
      loadSummary();
    }
  }, [loadSummary, selectedPeriodId]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-gray-800">Compliance Summary</h3>
          <p className="mt-1 text-sm text-gray-500">
            Totals are read from processed payroll snapshots for the selected period.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSummary}
          disabled={isLoading || selectedPeriodId === ""}
          className="btn btn-secondary disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <select
        value={selectedPeriodId}
        onChange={(event) =>
          setSelectedPeriodId(event.target.value ? Number(event.target.value) : "")
        }
        disabled={isLoading}
        className="pro-input max-w-xl"
      >
        <option value="">Select payroll period</option>
        {periods.map((period) => (
          <option key={period.id} value={period.id}>
            {getPeriodLabel(period)}
          </option>
        ))}
      </select>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-500">
          Loading compliance summary...
        </div>
      ) : selectedPeriodId === "" ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
          No processed or released payroll period is available for compliance reporting.
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payroll records</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{summary.payrollRecordCount}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gross pay</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(summary.grossPayTotal)}</p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Payroll status</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{summary.payrollPeriodStatus}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <ContributionTotals
              title="SSS"
              employeeTotal={summary.sssEmployeeTotal}
              employerTotal={summary.sssEmployerTotal}
              contributionTotal={summary.sssContributionTotal}
              missingNumberCount={summary.missingSssNumberCount}
            />
            <ContributionTotals
              title="PhilHealth"
              employeeTotal={summary.philHealthEmployeeTotal}
              employerTotal={summary.philHealthEmployerTotal}
              contributionTotal={summary.philHealthContributionTotal}
              missingNumberCount={summary.missingPhilHealthNumberCount}
            />
            <ContributionTotals
              title="Pag-IBIG"
              employeeTotal={summary.pagIbigEmployeeTotal}
              employerTotal={summary.pagIbigEmployerTotal}
              contributionTotal={summary.pagIbigContributionTotal}
              missingNumberCount={summary.missingPagIbigNumberCount}
            />
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-sm text-gray-600">
          No processed payroll records were found for {selectedPeriod ? getPeriodLabel(selectedPeriod) : "the selected period"}.
        </div>
      )}

      <p className="text-sm text-gray-500">
        Configuration changes apply only to future payroll processing and never rewrite historical processed payroll.
      </p>
    </div>
  );
};

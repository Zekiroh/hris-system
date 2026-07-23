import type { ComponentProps, MouseEvent, RefObject } from "react";
import type { Chart as ChartJS } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { EmploymentTypeSummary } from "../../../../services/api/employees/employees";

type AdminEmploymentTypeOverviewProps = {
  chartRef: RefObject<ChartJS<"doughnut", number[], string> | null>;
  chartData: ComponentProps<typeof Doughnut>["data"];
  chartOptions: ComponentProps<typeof Doughnut>["options"];
  employmentSummary: EmploymentTypeSummary;
  onChartClick: (event: MouseEvent<HTMLCanvasElement>) => void;
  onEmploymentTypeNavigate: (query: string) => void;
};

const AdminEmploymentTypeOverview = ({
  chartRef,
  chartData,
  chartOptions,
  employmentSummary,
  onChartClick,
  onEmploymentTypeNavigate,
}: AdminEmploymentTypeOverviewProps) => (
  <div
    className="pro-card p-6 animate-fade-in-up"
    style={{ animationDelay: "0.5s", opacity: 0 }}
  >
    <div className="mb-4">
      <h3 className="text-base font-bold text-gray-800">Employment Type</h3>
      <p className="text-xs text-gray-400 mt-0.5">Distribution by type</p>
    </div>

    <div
      style={{ height: 260 }}
      className="relative cursor-pointer"
      title="Click chart segment to filter employees"
    >
      <Doughnut
        ref={chartRef}
        data={chartData}
        options={chartOptions}
        onClick={onChartClick}
      />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">3</div>
          <div className="text-xs font-medium text-gray-400">Types</div>
        </div>
      </div>
    </div>

    <div className="mt-4 space-y-2">
      {[
        {
          label: "Regular",
          value: employmentSummary.regular,
          color: "#059669",
          query: "Regular",
        },
        {
          label: "Probationary",
          value: employmentSummary.probationary,
          color: "#f59e0b",
          query: "Probationary",
        },
        {
          label: "Project-based",
          value: employmentSummary.contract,
          color: "#3b82f6",
          query: "Project-based",
        },
      ].map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onEmploymentTypeNavigate(item.query)}
          className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-xs transition hover:bg-gray-50"
          title={`Show ${item.label} employees`}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-gray-500">{item.label}</span>
          </div>
          <span className="font-semibold text-gray-700">{item.value}</span>
        </button>
      ))}
    </div>
  </div>
);

export default AdminEmploymentTypeOverview;
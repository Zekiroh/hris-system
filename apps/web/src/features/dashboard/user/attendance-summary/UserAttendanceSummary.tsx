import type { RefObject } from "react";
import { Calendar, Check, ChevronDown } from "lucide-react";

type AttendanceSummaryRange =
  | "latest-month"
  | "this-month"
  | "last-month"
  | "this-year";

type AttendanceSummaryRangeOption = {
  value: AttendanceSummaryRange;
  label: string;
};

type AttendanceChartItem = {
  label: string;
  value: number;
  color: string;
};

type UserAttendanceSummaryProps = {
  summaryPeriodLabel: string;
  summaryYear: number;
  selectedRangeLabel: string;
  isDropdownOpen: boolean;
  dropdownRef: RefObject<HTMLDivElement | null>;
  rangeOptions: AttendanceSummaryRangeOption[];
  selectedRangeValue: AttendanceSummaryRange;
  onRangeChange: (value: AttendanceSummaryRange) => void;
  onDropdownToggle: () => void;
  onDropdownClose: () => void;
  chartItems: AttendanceChartItem[];
  totalChartDays: number;
  chartGradient: string;
  summaryStartDate: Date;
  summaryEndDate: Date;
};

const UserAttendanceSummary = ({
  summaryPeriodLabel,
  summaryYear,
  selectedRangeLabel,
  isDropdownOpen,
  dropdownRef,
  rangeOptions,
  selectedRangeValue,
  onRangeChange,
  onDropdownToggle,
  onDropdownClose,
  chartItems,
  totalChartDays,
  chartGradient,
  summaryStartDate,
  summaryEndDate,
}: UserAttendanceSummaryProps) => (
  <div
    className="pro-card p-5 md:p-6 animate-fade-in-up min-h-[340px]"
    style={{ animationDelay: "0.32s", opacity: 0 }}
  >
    <div className="flex items-center justify-between gap-3 mb-6">
      <div>
        <h3 className="text-base font-bold text-gray-800">
          Attendance Summary
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {summaryPeriodLabel} attendance overview for {summaryYear}
        </p>
      </div>

      <div ref={dropdownRef} className="relative hidden sm:block">
        <button
          type="button"
          onClick={onDropdownToggle}
          className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-gray-200 hover:text-gray-700"
        >
          <Calendar className="w-4 h-4 text-gray-500" />
          <span>{selectedRangeLabel}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-slate-200/70">
            {rangeOptions.map((option) => {
              const isSelected = option.value === selectedRangeValue;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onRangeChange(option.value);
                    onDropdownClose();
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-6 items-center">
      <div className="flex justify-center">
        <div
          className="relative w-56 h-56 md:w-64 md:h-64 rounded-full"
          style={{ background: chartGradient }}
        >
          <div className="absolute inset-8 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
            <p className="text-3xl font-extrabold text-gray-900">
              {totalChartDays}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Days</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {chartItems.map((item) => {
          const percentage =
            totalChartDays > 0
              ? `${((item.value / totalChartDays) * 100).toFixed(
                  item.value === 0 ? 0 : 1
                )}%`
              : "0%";

          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 border-b border-gray-100 last:border-b-0 pb-3 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </div>

              <span className="text-sm font-bold text-gray-700">
                {item.value} ({percentage})
              </span>
            </div>
          );
        })}
      </div>
    </div>

    <p className="text-xs font-medium text-gray-500 mt-8">
      Summary for{" "}
      {summaryStartDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
      })}{" "}
      -{" "}
      {summaryEndDate.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
    </p>
  </div>
);

export default UserAttendanceSummary;

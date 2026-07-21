import { DollarSign } from "lucide-react";

type FinancialBreakdownItem = {
  label: string;
  amount: string;
  percent: number;
  color: string;
};

type AdminPayrollSummaryProps = {
  payrollPeriodLabel: string;
  grossPayrollDisplayValue: string;
  financialBreakdown: FinancialBreakdownItem[];
};

const AdminPayrollSummary = ({
  payrollPeriodLabel,
  grossPayrollDisplayValue,
  financialBreakdown,
}: AdminPayrollSummaryProps) => (
  <div
    className="pro-card p-6 animate-fade-in-up"
    style={{ animationDelay: "0.7s", opacity: 0 }}
  >
    <div className="mb-5">
      <h3 className="text-base font-bold text-gray-800">Financial Summary</h3>
      <p className="text-xs text-gray-400 mt-0.5">{payrollPeriodLabel}</p>
    </div>
    <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
      <div className="flex items-center gap-2 mb-1">
        <DollarSign className="w-4 h-4 text-emerald-600" />
        <span className="text-xs text-gray-500 font-medium">
          Total Payroll
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900">
        {grossPayrollDisplayValue}
      </p>
    </div>
    <div className="space-y-4">
      {financialBreakdown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          No payroll records available for the latest payroll month.
        </div>
      ) : (
        financialBreakdown.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 font-medium">
                {item.label}
              </span>
              <span
                className={`text-xs font-bold ${
                  item.amount.startsWith("-")
                    ? "text-red-500"
                    : "text-gray-700"
                }`}
              >
                {item.amount}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${item.percent}%`,
                  background: item.color,
                }}
              />
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

export default AdminPayrollSummary;

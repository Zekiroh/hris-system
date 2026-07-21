import type { LeaveBalance } from "../../../../context/LeaveContext";
import BalanceCard from "./BalanceCard";

interface LeaveBalanceListProps {
  balances: LeaveBalance[];
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onViewHistory: (employeeName: string) => void;
}

const LeaveBalanceList = ({
  balances,
  page,
  totalPages,
  onPrev,
  onNext,
  onViewHistory,
}: LeaveBalanceListProps) => {
  const safePage = Math.max(1, page || 1);
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = safePage > 1;
  const canNext = safePage < safeTotalPages;
  const hasRecords = balances.length > 0;

  return (
    <div className="space-y-5">
      {!hasRecords && (
        <div className="pro-card !shadow-none border border-gray-100 py-10 text-center text-sm text-gray-500 italic">
          No employees found.
        </div>
      )}

      {hasRecords &&
        balances.map((emp) => (
          <div key={emp.id} className="pro-card !shadow-none border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{emp.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{emp.id}</p>
                </div>
              </div>

              <button
                onClick={() => onViewHistory(emp.name)}
                className="text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                View History →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <BalanceCard
                label="Vacation Leave"
                total={emp.vacation.total}
                used={emp.vacation.used}
                color="#059669"
              />
              <BalanceCard
                label="Sick Leave"
                total={emp.sick.total}
                used={emp.sick.used}
                color="#d97706"
              />
              <BalanceCard
                label="Emergency Leave"
                total={emp.emergency.total}
                used={emp.emergency.used}
                color="#dc2626"
              />
            </div>
          </div>
        ))}

      {hasRecords && (
        <div className="flex items-center justify-between border-t border-gray-100 px-2 py-4">
          <button className="btn btn-secondary" onClick={onPrev} disabled={!canPrev}>
            Prev
          </button>

          <div className="text-sm text-gray-500">
            Page {safePage} of {safeTotalPages}
          </div>

          <button className="btn btn-secondary" onClick={onNext} disabled={!canNext}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default LeaveBalanceList;

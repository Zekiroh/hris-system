import type { LeaveBalance } from "../../../context/LeaveContext";
import BalanceCard from "./BalanceCard";

interface LeaveBalanceListProps {
  balances: LeaveBalance[];
  onViewHistory: (employeeName: string) => void;
}

const LeaveBalanceList = ({ balances, onViewHistory }: LeaveBalanceListProps) => {
  return (
    <div className="space-y-5">
      {balances.map((emp) => (
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
    </div>
  );
};

export default LeaveBalanceList;

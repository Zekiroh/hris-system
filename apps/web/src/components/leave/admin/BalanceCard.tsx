interface BalanceCardProps {
  label: string;
  total: number;
  used: number;
  color: string;
}

const BalanceCard = ({ label, total, used, color }: BalanceCardProps) => {
  const remaining = total - used;
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs text-gray-500 font-semibold mb-3 uppercase tracking-wide">
        {label}
      </p>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-sm"
          style={{ background: color }}
        >
          {remaining}
        </div>
        <div>
          <p className="text-xl font-bold text-gray-900">
            {remaining}
            <span className="text-xs text-gray-400 font-medium ml-1">/ {total}</span>
          </p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Remaining</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm font-bold text-gray-500">{used}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Used</p>
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
};

export default BalanceCard;
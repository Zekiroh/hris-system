type UserClearanceProgressCardProps = {
  completedCount: number;
  totalCount: number;
  progressPct: number;
};

const UserClearanceProgressCard = ({
  completedCount,
  totalCount,
  progressPct,
}: UserClearanceProgressCardProps) => {
  return (
    <div className="pro-card !shadow-none border border-gray-100 !p-5">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          Overall Progress
        </p>
        <p className="text-sm font-bold text-gray-800">
          {completedCount}/{totalCount} completed
        </p>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: progressPct + "%",
            background:
              progressPct === 100
                ? "linear-gradient(90deg, #059669, #10b981)"
                : "linear-gradient(90deg, #d97706, #f59e0b)",
          }}
        />
      </div>
      <p
        className="text-right text-xs font-bold mt-1"
        style={{ color: progressPct === 100 ? "#059669" : "#d97706" }}
      >
        {progressPct}%
      </p>
    </div>
  );
};

export default UserClearanceProgressCard;

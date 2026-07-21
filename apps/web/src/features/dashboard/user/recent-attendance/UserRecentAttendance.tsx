import type { AttendanceLogDto } from "../../../../lib/attendance";

type UserRecentAttendanceProps = {
  recentAttendance: AttendanceLogDto[];
  onViewAll: () => void;
  formatDateValue: (value?: string | null) => string;
  formatWeekdayValue: (value?: string | null) => string;
  parseTimeValue: (value?: string | null) => string | null;
  getRecordStatus: (log: AttendanceLogDto) => string;
  getStatusBadgeClass: (status: string) => string;
};

const UserRecentAttendance = ({
  recentAttendance,
  onViewAll,
  formatDateValue,
  formatWeekdayValue,
  parseTimeValue,
  getRecordStatus,
  getStatusBadgeClass,
}: UserRecentAttendanceProps) => (
  <div
    className="pro-card p-5 md:p-6 animate-fade-in-up min-h-[340px]"
    style={{ animationDelay: "0.4s", opacity: 0 }}
  >
    <div className="flex items-center justify-between gap-3 mb-4">
      <h3 className="text-base font-bold text-gray-800">
        Recent Attendance
      </h3>

      <button
        type="button"
        onClick={onViewAll}
        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
      >
        View All
      </button>
    </div>

    <div className="space-y-3">
      {recentAttendance.length === 0 ? (
        <div className="rounded-xl bg-gray-50/80 p-4 text-sm text-gray-400">
          No attendance records yet.
        </div>
      ) : (
        recentAttendance.map((log, index) => {
          const status = getRecordStatus(log);

          return (
            <div
              key={`${log.id}-${log.date}-${log.timeIn ?? "no-time-in"}-${index}`}
              className="flex items-center justify-between gap-4 border-l-2 border-emerald-400 bg-gray-50/80 px-4 py-3 min-w-0"
            >
              <div className="min-w-0">
                <p className="text-[11px] text-gray-400 font-semibold">
                  {formatDateValue(log.date)}
                </p>
                <p className="text-sm font-bold text-gray-800 mt-0.5 break-words">
                  {formatWeekdayValue(log.date)}
                </p>
              </div>

              <div className="hidden sm:block text-sm font-semibold text-gray-500 whitespace-nowrap">
                {parseTimeValue(log.timeIn) ?? "--:-- --"} -{" "}
                {parseTimeValue(log.timeOut) ?? "--:-- --"}
              </div>

              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getStatusBadgeClass(
                  status
                )}`}
              >
                {status}
              </span>
            </div>
          );
        })
      )}
    </div>
  </div>
);

export default UserRecentAttendance;

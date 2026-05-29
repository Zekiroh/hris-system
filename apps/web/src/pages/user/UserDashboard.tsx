import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Star,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getMyAttendanceLogs,
  getMyOvertimeRequests,
  getTodayMyAttendanceLog,
  type AttendanceLogDto,
  type OvertimeRequestDto,
} from "../../lib/attendance";
import { apiRequest } from "../../lib/api";

type MyMonthlyAttendanceTrendDto = {
  month: number;
  monthLabel: string;
  presentCount: number;
  lateCount: number;
  overtimeCount: number;
};

const getMyAttendanceSummary = (year: number) =>
  apiRequest<MyMonthlyAttendanceTrendDto[]>(
    `/dashboard/user/attendance-summary?year=${year}`
  );

const formatDisplayName = (
  user: Partial<{
    firstName: string;
    lastName: string;
    fullName: string;
    name: string;
    username: string;
    email: string;
  }> | null
) => {
  const candidates = [
    user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    user?.fullName,
    user?.name,
    user?.username,
    user?.email,
  ];

  const value = candidates.find(
    (item) => typeof item === "string" && item.trim().length > 0
  );

  return value?.trim() || "User";
};

const DashboardClock = ({
  children,
}: {
  children: (time: Date) => ReactNode;
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <>{children(time)}</>;
};

const parseTimeValue = (value?: string | null) => {
  if (!value?.trim()) return null;

  const raw = value.trim();

  if (raw.includes("T")) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleTimeString("en-PH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  const parts = raw.split(":");
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return raw;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDateValue = (value?: string | null) => {
  if (!value?.trim()) return "—";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const formatMinutes = (minutes?: number | null) => {
  if (!minutes || minutes <= 0) return "0h 0m";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

const getPagedItems = <T,>(response: unknown): T[] => {
  if (!response || typeof response !== "object") return [];

  const candidate = response as { items?: unknown; data?: unknown };

  if (Array.isArray(candidate.items)) {
    return candidate.items as T[];
  }

  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    Array.isArray((candidate.data as { items?: unknown }).items)
  ) {
    return (candidate.data as { items: T[] }).items;
  }

  return [];
};

const getAttendanceStatus = (todayLog: AttendanceLogDto | null) => {
  if (!todayLog) return "No Record";
  if (todayLog.timeOut) return "Completed";
  if (todayLog.timeIn) return "Timed In";
  if (todayLog.isWorkingDay === false) return "Rest Day";
  return "Not Started";
};

const getRecordStatus = (log: AttendanceLogDto) => {
  if (log.status?.trim()) return log.status;
  if (log.timeOut) return "Completed";
  if (log.timeIn) return "Timed In";
  return "Pending";
};

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-50 text-emerald-600";

    case "timed in":
      return "bg-blue-50 text-blue-600";

    case "pending":
      return "bg-slate-100 text-slate-600";

    case "rest day":
      return "bg-gray-100 text-gray-600";

    case "no record":
      return "bg-gray-100 text-gray-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [todayLog, setTodayLog] = useState<AttendanceLogDto | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogDto[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequestDto[]>(
    []
  );
  const [attendanceSummary, setAttendanceSummary] = useState<
    MyMonthlyAttendanceTrendDto[]
  >([]);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const displayName = formatDisplayName(user);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [
          todayResponse,
          attendanceResponse,
          overtimeResponse,
          summaryResponse,
        ] = await Promise.all([
          getTodayMyAttendanceLog(),
          getMyAttendanceLogs({ page: 1, pageSize: 20 }),
          getMyOvertimeRequests({ page: 1, pageSize: 20 }),
          getMyAttendanceSummary(currentYear),
        ]);

        if (!isMounted) return;

        setTodayLog(todayResponse);
        setAttendanceLogs(getPagedItems<AttendanceLogDto>(attendanceResponse));
        setOvertimeRequests(
          getPagedItems<OvertimeRequestDto>(overtimeResponse)
        );
        setAttendanceSummary(summaryResponse);
        setDashboardError(null);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load user dashboard data:", error);
        setTodayLog(null);
        setAttendanceLogs([]);
        setOvertimeRequests([]);
        setAttendanceSummary([]);
        setDashboardError("Unable to load latest dashboard data.");
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [token, currentYear]);

  const overtimeSummary = useMemo(() => {
    const pending = overtimeRequests.filter(
      (item) => item.status?.toLowerCase() === "pending"
    ).length;
    const approved = overtimeRequests.filter(
      (item) => item.status?.toLowerCase() === "approved"
    ).length;
    const rejected = overtimeRequests.filter(
      (item) => item.status?.toLowerCase() === "rejected"
    ).length;

    return { pending, approved, rejected };
  }, [overtimeRequests]);

  const currentMonthSummary = useMemo(() => {
    const summary = attendanceSummary.find((item) => item.month === currentMonth);

    return {
      present: summary?.presentCount ?? 0,
      late: summary?.lateCount ?? 0,
      overtime: summary?.overtimeCount ?? 0,
    };
  }, [attendanceSummary, currentMonth]);

  const chartItems = useMemo(
    () => [
      {
        label: "Present",
        value: currentMonthSummary.present,
        color: "#22c55e",
      },
      {
        label: "Late",
        value: currentMonthSummary.late,
        color: "#f59e0b",
      },
      {
        label: "Overtime",
        value: currentMonthSummary.overtime,
        color: "#3b82f6",
      },
    ],
    [currentMonthSummary]
  );

  const totalChartDays = useMemo(
    () => chartItems.reduce((total, item) => total + item.value, 0),
    [chartItems]
  );

  const chartGradient = useMemo(() => {
    if (totalChartDays <= 0) {
      return "conic-gradient(#e5e7eb 0deg 360deg)";
    }

    let start = 0;

    const segments = chartItems.map((item) => {
      const degrees = (item.value / totalChartDays) * 360;
      const end = start + degrees;
      const segment = `${item.color} ${start}deg ${end}deg`;
      start = end;
      return segment;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [chartItems, totalChartDays]);

  const currentShiftValue =
    todayLog?.shiftStartTime && todayLog?.shiftEndTime
      ? `${parseTimeValue(todayLog.shiftStartTime)} - ${parseTimeValue(
          todayLog.shiftEndTime
        )}`
      : "No active shift";

  const todaysWorkedMinutes =
    todayLog?.creditedMinutes ??
    todayLog?.regularCreditedMinutes ??
    todayLog?.totalWorkedMinutes ??
    0;

  const statCards = [
    {
      label: "Attendance Today",
      value: getAttendanceStatus(todayLog),
      sub: todayLog?.date ? formatDateValue(todayLog.date) : "No DTR record yet",
      icon: Calendar,
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    },
    {
      label: "Current Shift",
      value: currentShiftValue,
      sub: todayLog?.shiftName ?? "Assigned shift appears here",
      icon: Clock,
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    {
      label: "Today's Worked",
      value: formatMinutes(todaysWorkedMinutes),
      sub: todayLog?.timeIn
        ? `Time in: ${parseTimeValue(todayLog.timeIn)}`
        : "Waiting for time in",
      icon: Timer,
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    },
    {
      label: "Overtime",
      value: `${overtimeSummary.approved} Approved`,
      sub: `${overtimeSummary.pending} Pending, ${overtimeSummary.rejected} Rejected`,
      icon: Star,
      gradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    },
  ];

  const quickActions = [
    {
      label: "Time In/Out",
      icon: Clock,
      path: "/dashboard/my-attendance",
      color: "#059669",
    },
    {
      label: "File a Leave",
      icon: FileText,
      path: "/dashboard/leave",
      color: "#2563eb",
    },
    {
      label: "View Payslip",
      icon: DollarSign,
      path: "/dashboard/my-payslips",
      color: "#7c3aed",
    },
  ];

  const recentAttendance = attendanceLogs.slice(0, 5);

  const summaryStartDate = new Date(currentYear, currentMonth - 1, 1);
  const summaryEndDate = new Date();

  return (
    <DashboardClock>
      {(time) => {
        const hour = time.getHours();
        const greeting =
          hour < 12
            ? "Good Morning"
            : hour < 17
              ? "Good Afternoon"
              : "Good Evening";

        return (
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 pb-6">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-5 md:p-7 text-white animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full translate-y-1/2" />

              <div className="relative z-10">
                <h1 className="text-xl md:text-2xl font-bold">
                  {greeting}, {displayName}!
                </h1>
                <p className="text-xs md:text-sm text-emerald-100/90 mt-1 max-w-2xl">
                  It&apos;s a great day to do great work.
                </p>
              </div>
            </div>

            {dashboardError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {dashboardError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((card, index) => (
                <div
                  key={card.label}
                  className="pro-card !p-0 overflow-hidden animate-fade-in-up min-w-0"
                  style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
                >
                  <div className="p-4 flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                      style={{ background: card.gradient }}
                    >
                      <card.icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        {card.label}
                      </p>
                      <p className="text-base font-bold text-gray-800 mt-0.5 break-words">
                        {card.value}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5 break-words">
                        {card.sub}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.24s", opacity: 0 }}
            >
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.path)}
                  className="pro-card !p-4 md:!p-5 flex items-center justify-between gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer text-left min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <action.icon
                        className="w-5 h-5"
                        style={{ color: action.color }}
                      />
                    </div>

                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 break-words">
                      {action.label}
                    </span>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-700 shrink-0 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
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
                      Monthly attendance overview for {currentYear}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    This Month
                    <ChevronRight className="w-4 h-4 rotate-90 text-gray-400" />
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
                    onClick={() => navigate("/dashboard/my-attendance")}
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
                    recentAttendance.map((log) => {
                      const status = getRecordStatus(log);

                      return (
                        <div
                          key={log.id}
                          className="flex items-center justify-between gap-4 border-l-2 border-emerald-400 bg-gray-50/80 px-4 py-3 min-w-0"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] text-gray-400 font-semibold">
                              {formatDateValue(log.date)}
                            </p>
                            <p className="text-sm font-bold text-gray-800 mt-0.5 break-words">
                              {log.shiftName ?? "Attendance Record"}
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
            </div>
          </div>
        );
      }}
    </DashboardClock>
  );
};

export default UserDashboard;
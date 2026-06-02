import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Calendar,
  Check,
  ChevronDown,
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
  getMyCurrentShift,
  getMyOvertimeRequests,
  getTodayMyAttendanceLog,
  type AttendanceLogDto,
  type OvertimeRequestDto,
  type Shift,
} from "../../lib/attendance";

type MyOvertimeDashboardRow = {
  id: number;
  status: string;
};

type AttendanceSummaryRange =
  | "latest-month"
  | "this-month"
  | "last-month"
  | "this-year";

type AttendanceSummaryBucket = "present" | "late" | "overtime" | "absent";

const attendanceSummaryRangeOptions: {
  value: AttendanceSummaryRange;
  label: string;
}[] = [
  { value: "latest-month", label: "Latest Month" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "this-year", label: "This Year" },
];

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

const formatWeekdayValue = (value?: string | null) => {
  if (!value?.trim()) return "Attendance Record";

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "Attendance Record";

  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
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

const normalizeStatus = (status?: string | null) =>
  status?.trim().toLowerCase() ?? "";

const getAttendanceStatus = (todayLog: AttendanceLogDto | null) => {
  if (!todayLog) return "No Record";
  if (todayLog.timeOut) return "Completed";
  if (todayLog.timeIn) return "Timed In";
  if (todayLog.isWorkingDay === false) return "Rest Day";
  return "Not Started";
};

const getRecordStatus = (log: AttendanceLogDto) => {
  if (log.status?.trim()) {
    return log.status;
  }

  if (!log.isPresent && !log.timeIn && !log.timeOut) {
    return "Absent";
  }

  if (log.timeOut) {
    return "Completed";
  }

  if (log.timeIn) {
    return "Timed In";
  }

  return "No Record";
};

const getStatusBadgeClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-50 text-emerald-600";

    case "timed in":
      return "bg-blue-50 text-blue-600";

    case "absent":
      return "bg-red-50 text-red-600";

    case "pending":
      return "bg-slate-100 text-slate-600";

    case "rest day":
      return "bg-gray-100 text-gray-600";

    case "no record":
      return "bg-slate-100 text-slate-500";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

const normalizeDateKey = (value?: string | null) => {
  if (!value || value === "-" || value === "--" || value === "—") return "";

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isDateWithinRange = (dateKey: string, startDate: Date, endDate: Date) => {
  const date = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(date.getTime())) return false;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return date >= start && date <= end;
};

const classifyAttendanceDay = (
  logs: AttendanceLogDto[]
): AttendanceSummaryBucket | null => {
  if (logs.length === 0) return null;

  const hasAbsent = logs.some(
    (log) =>
      normalizeStatus(log.status) === "absent" ||
      (!log.isPresent && !log.timeIn && !log.timeOut)
  );

  if (hasAbsent) return "absent";

  const hasLate = logs.some((log) => (log.lateMinutes ?? 0) > 0);

  if (hasLate) return "late";

  const hasOvertime = logs.some(
    (log) =>
      (log.overtimeCreditedMinutes ?? 0) > 0 ||
      (log.overtimeMinutes ?? 0) > 0 ||
      normalizeStatus(log.overtimeStatus) === "approved"
  );

  if (hasOvertime) return "overtime";

  const hasPresent = logs.some(
    (log) =>
      !!log.timeIn ||
      !!log.timeOut ||
      log.isPresent ||
      normalizeStatus(log.status) === "present" ||
      normalizeStatus(log.status) === "completed"
  );

  if (hasPresent) return "present";

  return null;
};

const getOvertimeRequestDateRange = (request: OvertimeRequestDto) => {
  const dateFrom = normalizeDateKey(
    request.dateFrom || request.attendanceDate || ""
  );
  const dateTo = normalizeDateKey(
    request.dateTo || request.dateFrom || request.attendanceDate || ""
  );

  if (!dateFrom && !dateTo) return [];
  if (!dateFrom) return [dateTo];
  if (!dateTo) return [dateFrom];

  const start = new Date(`${dateFrom}T00:00:00`);
  const end = new Date(`${dateTo}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return [dateFrom];
  }

  if (start > end) return [dateFrom];

  const dates: string[] = [];
  const cursor = new Date(end);

  while (cursor >= start) {
    const year = cursor.getFullYear();
    const month = String(cursor.getMonth() + 1).padStart(2, "0");
    const day = String(cursor.getDate()).padStart(2, "0");

    dates.push(`${year}-${month}-${day}`);
    cursor.setDate(cursor.getDate() - 1);
  }

  return dates;
};

const expandOvertimeRequestRows = (
  request: OvertimeRequestDto
): MyOvertimeDashboardRow[] => {
  const dates = getOvertimeRequestDateRange(request);
  const status = request.status || "Pending";

  if (dates.length === 0) {
    return [
      {
        id: request.id,
        status,
      },
    ];
  }

  return dates.map((_, index) => ({
    id: request.id * 1000 + index,
    status,
  }));
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [todayLog, setTodayLog] = useState<AttendanceLogDto | null>(null);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLogDto[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequestDto[]>(
    []
  );
  const [attendanceSummaryRange, setAttendanceSummaryRange] =
    useState<AttendanceSummaryRange>("latest-month");
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [isSummaryRangeOpen, setIsSummaryRangeOpen] = useState(false);
  const summaryRangeDropdownRef = useRef<HTMLDivElement | null>(null);

  const displayName = formatDisplayName(user);
  const today = useMemo(() => new Date(), []);

  const latestAttendanceDate = useMemo(() => {
    return attendanceLogs
      .map((log) => (log.date ? new Date(`${log.date}T00:00:00`) : null))
      .filter(
        (date): date is Date => !!date && !Number.isNaN(date.getTime())
      )
      .sort((a, b) => b.getTime() - a.getTime())[0];
  }, [attendanceLogs]);

  const summaryPeriod = useMemo(() => {
    if (attendanceSummaryRange === "this-year") {
      return {
        label: "This Year",
        year: today.getFullYear(),
        month: null as number | null,
        startDate: new Date(today.getFullYear(), 0, 1),
        endDate: today,
      };
    }

    if (attendanceSummaryRange === "this-month") {
      return {
        label: "This Month",
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: today,
      };
    }

    if (attendanceSummaryRange === "last-month") {
      const lastMonthDate = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );

      return {
        label: "Last Month",
        year: lastMonthDate.getFullYear(),
        month: lastMonthDate.getMonth() + 1,
        startDate: new Date(
          lastMonthDate.getFullYear(),
          lastMonthDate.getMonth(),
          1
        ),
        endDate: new Date(
          lastMonthDate.getFullYear(),
          lastMonthDate.getMonth() + 1,
          0
        ),
      };
    }

    const referenceDate = latestAttendanceDate ?? today;

    return {
      label: "Latest Month",
      year: referenceDate.getFullYear(),
      month: referenceDate.getMonth() + 1,
      startDate: new Date(
        referenceDate.getFullYear(),
        referenceDate.getMonth(),
        1
      ),
      endDate: referenceDate,
    };
  }, [attendanceSummaryRange, latestAttendanceDate, today]);

  const summaryYear = summaryPeriod.year;

  const selectedSummaryRangeLabel =
    attendanceSummaryRangeOptions.find(
      (option) => option.value === attendanceSummaryRange
    )?.label ?? "Latest Month";

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [
          todayResponse,
          currentShiftResponse,
          attendanceResponse,
          overtimeResponse,
        ] = await Promise.all([
          getTodayMyAttendanceLog(),
          getMyCurrentShift().catch(() => null),
          getMyAttendanceLogs({ page: 1, pageSize: 1000 }),
          getMyOvertimeRequests(),
        ]);

        if (!isMounted) return;

        setTodayLog(todayResponse);
        setCurrentShift(currentShiftResponse);
        setAttendanceLogs(getPagedItems<AttendanceLogDto>(attendanceResponse));
        setOvertimeRequests(
          getPagedItems<OvertimeRequestDto>(overtimeResponse)
        );
        setDashboardError(null);
      } catch (error) {
        if (!isMounted) return;

        console.error("Failed to load user dashboard data:", error);
        setTodayLog(null);
        setCurrentShift(null);
        setAttendanceLogs([]);
        setOvertimeRequests([]);
        setDashboardError("Unable to load latest dashboard data.");
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (!isSummaryRangeOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        summaryRangeDropdownRef.current &&
        !summaryRangeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSummaryRangeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSummaryRangeOpen]);

  const overtimeSummary = useMemo(() => {
    const overtimeRows = overtimeRequests.flatMap((request) =>
      expandOvertimeRequestRows(request)
    );

    const pending = overtimeRows.filter(
      (item) => normalizeStatus(item.status) === "pending"
    ).length;

    const approved = overtimeRows.filter(
      (item) => normalizeStatus(item.status) === "approved"
    ).length;

    const rejected = overtimeRows.filter(
      (item) => normalizeStatus(item.status) === "rejected"
    ).length;

    return { pending, approved, rejected, total: overtimeRows.length };
  }, [overtimeRequests]);

  const currentMonthSummary = useMemo(() => {
    const summaryLogsByDate = new Map<string, AttendanceLogDto[]>();

    attendanceLogs.forEach((log) => {
      const dateKey = normalizeDateKey(log.date);

      if (
        !dateKey ||
        !isDateWithinRange(
          dateKey,
          summaryPeriod.startDate,
          summaryPeriod.endDate
        )
      ) {
        return;
      }

      const existingLogs = summaryLogsByDate.get(dateKey) ?? [];
      summaryLogsByDate.set(dateKey, [...existingLogs, log]);
    });

    const summary = {
      present: 0,
      late: 0,
      overtime: 0,
      absent: 0,
    };

    summaryLogsByDate.forEach((logs) => {
      const classification = classifyAttendanceDay(logs);

      if (!classification) return;

      summary[classification] += 1;
    });

    return summary;
  }, [attendanceLogs, summaryPeriod.endDate, summaryPeriod.startDate]);

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
      {
        label: "Absent",
        value: currentMonthSummary.absent,
        color: "#ef4444",
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
    currentShift?.name ?? currentShift?.code ?? "No assigned shift";

  const currentShiftSub =
    todayLog?.isWorkingDay === false
      ? "Rest Day Today"
      : currentShift
        ? "Active Shift Assignment"
        : "No assigned shift";

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
      sub: currentShiftSub,
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

  const recentAttendance = [...attendanceLogs]
    .sort((a, b) => {
      const aTime = new Date(`${a.date}T00:00:00`).getTime();
      const bTime = new Date(`${b.date}T00:00:00`).getTime();

      return bTime - aTime;
    })
    .slice(0, 5);

  const summaryStartDate = summaryPeriod.startDate;
  const summaryEndDate = summaryPeriod.endDate;

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
                      {summaryPeriod.label} attendance overview for {summaryYear}
                    </p>
                  </div>

                  <div
                    ref={summaryRangeDropdownRef}
                    className="relative hidden sm:block"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setIsSummaryRangeOpen((current) => !current)
                      }
                      className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition-colors hover:border-gray-200 hover:text-gray-700"
                    >
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{selectedSummaryRangeLabel}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isSummaryRangeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isSummaryRangeOpen && (
                      <div className="absolute right-0 top-full z-30 mt-2 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl shadow-slate-200/70">
                        {attendanceSummaryRangeOptions.map((option) => {
                          const isSelected =
                            option.value === attendanceSummaryRange;

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => {
                                setAttendanceSummaryRange(option.value);
                                setIsSummaryRangeOpen(false);
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
            </div>
          </div>
        );
      }}
    </DashboardClock>
  );
};

export default UserDashboard;
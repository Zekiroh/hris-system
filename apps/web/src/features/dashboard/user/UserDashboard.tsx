import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Star,
  Timer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getMyAttendanceLogs,
  getMyCurrentShift,
  getMyOvertimeRequests,
  getTodayMyAttendanceLog,
  type AttendanceLogDto,
  type OvertimeRequestDto,
  type Shift,
} from "../../../lib/attendance";
import UserAttendanceSummary from "./attendance-summary/UserAttendanceSummary";
import UserQuickActions from "./quick-actions/UserQuickActions";
import UserRecentAttendance from "./recent-attendance/UserRecentAttendance";
import UserWorkdayOverview from "./workday-overview/UserWorkdayOverview";

type MyOvertimeDashboardRow = {
  id: string;
  status: string;
};

type AttendanceSummaryRange =
  | "latest-month"
  | "this-month"
  | "last-month"
  | "this-year";

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

const getAttendanceDaySummary = (logs: AttendanceLogDto[]) => {
  const hasAbsent = logs.some(
    (log) =>
      normalizeStatus(log.status) === "absent" ||
      (!log.isPresent && !log.timeIn && !log.timeOut)
  );

  const hasPresent = logs.some(
    (log) =>
      !!log.timeIn ||
      !!log.timeOut ||
      log.isPresent ||
      normalizeStatus(log.status) === "present" ||
      normalizeStatus(log.status) === "completed"
  );

  const hasLate = logs.some((log) => (log.lateMinutes ?? 0) > 0);

  const hasOvertime = logs.some(
    (log) =>
      (log.overtimeCreditedMinutes ?? 0) > 0 ||
      (log.overtimeMinutes ?? 0) > 0 ||
      normalizeStatus(log.overtimeStatus) === "approved"
  );

  return {
    isPresent: hasPresent && !hasAbsent,
    isLate: hasLate && hasPresent && !hasAbsent,
    hasOvertime: hasOvertime && hasPresent && !hasAbsent,
    isAbsent: hasAbsent && !hasPresent,
  };
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
        id: `${request.id}-single`,
        status,
      },
    ];
  }

  return dates.map((_, index) => ({
    id: `${request.id}-${index}`,
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
      const daySummary = getAttendanceDaySummary(logs);

      if (daySummary.isPresent) summary.present += 1;
      if (daySummary.isLate) summary.late += 1;
      if (daySummary.hasOvertime) summary.overtime += 1;
      if (daySummary.isAbsent) summary.absent += 1;
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
    () => currentMonthSummary.present + currentMonthSummary.absent,
    [currentMonthSummary.absent, currentMonthSummary.present]
  );

  const chartGradient = useMemo(() => {
    if (totalChartDays <= 0) {
      return "conic-gradient(#e5e7eb 0deg 360deg)";
    }

    let start = 0;

    const segments = chartItems.map((item) => {
      const degrees = (item.value / totalChartDays) * 360;
      const end = Math.min(start + degrees, 360);
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

            <UserWorkdayOverview statCards={statCards} />

            <UserQuickActions
              quickActions={quickActions}
              onNavigate={(path) => navigate(path)}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <UserAttendanceSummary
                summaryPeriodLabel={summaryPeriod.label}
                summaryYear={summaryYear}
                selectedRangeLabel={selectedSummaryRangeLabel}
                isDropdownOpen={isSummaryRangeOpen}
                dropdownRef={summaryRangeDropdownRef}
                rangeOptions={attendanceSummaryRangeOptions}
                selectedRangeValue={attendanceSummaryRange}
                onRangeChange={setAttendanceSummaryRange}
                onDropdownToggle={() =>
                  setIsSummaryRangeOpen((current) => !current)
                }
                onDropdownClose={() => setIsSummaryRangeOpen(false)}
                chartItems={chartItems}
                totalChartDays={totalChartDays}
                chartGradient={chartGradient}
                summaryStartDate={summaryStartDate}
                summaryEndDate={summaryEndDate}
              />

              <UserRecentAttendance
                recentAttendance={recentAttendance}
                onViewAll={() => navigate("/dashboard/my-attendance")}
                formatDateValue={formatDateValue}
                formatWeekdayValue={formatWeekdayValue}
                parseTimeValue={parseTimeValue}
                getRecordStatus={getRecordStatus}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            </div>
          </div>
        );
      }}
    </DashboardClock>
  );
};

export default UserDashboard;

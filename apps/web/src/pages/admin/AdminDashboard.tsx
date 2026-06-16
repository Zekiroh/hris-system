import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Clock,
  FileText,
  DollarSign,
  ArrowUpRight,
  CalendarDays,
  LogIn,
  LogOut,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, getElementAtEvent } from "react-chartjs-2";
import { useAuth } from "../../context/AuthContext";
import {
  getActivityLogs,
  type ActivityLogItemDto,
} from "../../lib/activityLogs";
import { getAdminUsers, type AdminUserDto } from "../../lib/adminUsers";
import {
  getAttendanceTrends,
  type MonthlyAttendanceTrendDto,
} from "../../lib/dashboard";
import {
  getEmployees,
  type EmployeeSummaryDto,
  type PagedEmployeesResponse,
  type EmploymentTypeSummary,
} from "../../lib/employees";
import { subscribeEmployeeStatsChanged } from "../../lib/events/employeeEvents";
import {
  getAdminLeaveRequests,
  type LeaveRequestDto,
} from "../../lib/leave";
import {
  getPayrollPeriods,
  getPayrollRecords,
  type PayrollPeriodDto,
  type PayrollRecordDto,
} from "../../lib/payroll";
import {
  buildUserNameByEmail,
  formatActionLabel,
  formatDatePart,
  formatTimePart,
  prettifyDetails,
} from "../../lib/activityLog.utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const RECENT_ACTIVITY_LIMIT = 5;

const extractRecentLogs = (response: unknown): ActivityLogItemDto[] => {
  if (!response || typeof response !== "object") return [];

  const candidate = response as {
    items?: unknown;
    data?: unknown;
    logs?: unknown;
  };

  if (Array.isArray(candidate.items))
    return candidate.items as ActivityLogItemDto[];
  if (Array.isArray(candidate.data))
    return candidate.data as ActivityLogItemDto[];
  if (Array.isArray(candidate.logs))
    return candidate.logs as ActivityLogItemDto[];

  return [];
};

const extractAdminUsers = (response: unknown): AdminUserDto[] => {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (typeof response === "object") {
    const candidate = response as { items?: unknown; data?: unknown };

    if (Array.isArray(candidate.items)) {
      return candidate.items as AdminUserDto[];
    }

    if (
      candidate.data &&
      typeof candidate.data === "object" &&
      Array.isArray((candidate.data as { items?: unknown }).items)
    ) {
      return (candidate.data as { items: AdminUserDto[] }).items;
    }
  }

  return [];
};

const extractEmployeesPayload = (
  response: unknown
): PagedEmployeesResponse | null => {
  if (!response || typeof response !== "object") return null;

  const candidate = response as {
    items?: unknown;
    summary?: unknown;
    data?: unknown;
  };

  if (Array.isArray(candidate.items)) {
    return candidate as PagedEmployeesResponse;
  }

  if (
    candidate.data &&
    typeof candidate.data === "object" &&
    Array.isArray((candidate.data as { items?: unknown }).items)
  ) {
    return candidate.data as PagedEmployeesResponse;
  }

  return null;
};

const getRecentActivityVisual = (action?: string) => {
  switch ((action || "").trim().toUpperCase()) {
    case "LOGIN":
      return {
        icon: LogIn,
        color: "#2563eb",
        background: "#eff6ff",
      };
    case "LOGIN_FAILED":
      return {
        icon: LogIn,
        color: "#dc2626",
        background: "#fef2f2",
      };
    case "LOGOUT":
      return {
        icon: LogOut,
        color: "#ef4444",
        background: "#fef2f2",
      };
    case "USER_CREATE":
    case "EMPLOYEE_CREATED":
      return {
        icon: UserPlus,
        color: "#059669",
        background: "#ecfdf5",
      };
    case "USER_UPDATE":
    case "EMPLOYEE_UPDATED":
      return {
        icon: FileText,
        color: "#d97706",
        background: "#fffbeb",
      };
    case "USER_STATUS_UPDATE":
    case "EMPLOYEE_STATUS_UPDATED":
      return {
        icon: Users,
        color: "#7c3aed",
        background: "#f5f3ff",
      };
    case "USER_PASSWORD_RESET":
      return {
        icon: KeyRound,
        color: "#e11d48",
        background: "#fff1f2",
      };
    case "PERMISSION_UPDATE":
      return {
        icon: ShieldCheck,
        color: "#0891b2",
        background: "#ecfeff",
      };
    default:
      return {
        icon: Clock,
        color: "#2563eb",
        background: "#eff6ff",
      };
  }
};

const emptyEmploymentSummary = (): EmploymentTypeSummary => ({
  regular: 0,
  probationary: 0,
  contract: 0,
});

const emptyEmployeeSummary = (): EmployeeSummaryDto => ({
  total: 0,
  active: 0,
  inactive: 0,
  newHires: 0,
});

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const emptyMonthlyAttendanceTrends = (): MonthlyAttendanceTrendDto[] =>
  MONTH_LABELS.map((monthLabel, index) => ({
    month: index + 1,
    monthLabel,
    presentCount: 0,
    lateCount: 0,
    overtimeCount: 0,
    absentCount: 0,
  }));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

const parseDateOnly = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatPayrollMonth = (periods: PayrollPeriodDto[]) => {
  if (!periods.length) return "No processed payroll yet";

  const latestStart = parseDateOnly(periods[0].startDate);

  return latestStart.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const getPayrollMonthKey = (period: PayrollPeriodDto) =>
  period.startDate.slice(0, 7);

const countEmployeesOnLeaveToday = (requests: LeaveRequestDto[]) => {
  const now = new Date();
  const todayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );

  const employeeIds = new Set<string>();

  requests.forEach((request) => {
    if (request.status !== "Approved") return;

    const startDate = new Date(request.startDate);
    const endDate = new Date(request.endDate);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return;
    }

    const startUtc = Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate()
    );

    const endUtc = Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate()
    );

    if (startUtc <= todayUtc && endUtc >= todayUtc) {
      employeeIds.add(request.employeeId);
    }
  });

  return employeeIds.size;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const employmentChartRef =
    useRef<ChartJS<"doughnut", number[], string> | null>(null);
  const { user, token } = useAuth();
  const canLoadDashboard = !!user && !!token;

  const [time, setTime] = useState(new Date());
  const [recentLogs, setRecentLogs] = useState<ActivityLogItemDto[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserDto[]>([]);
  const [employeeSummary, setEmployeeSummary] =
    useState<EmployeeSummaryDto | null>(null);
  const [employmentSummary, setEmploymentSummary] =
    useState<EmploymentTypeSummary>(emptyEmploymentSummary());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestDto[]>([]);

  const [attendanceTrends, setAttendanceTrends] = useState<
    MonthlyAttendanceTrendDto[]
  >(emptyMonthlyAttendanceTrends());
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecordDto[]>([]);
  const [payrollPeriodLabel, setPayrollPeriodLabel] = useState(
    "No processed payroll yet"
  );

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!canLoadDashboard) return;

    let isMounted = true;

    const fetchDashboardActivityData = async () => {
      try {
        const [logsResponse, usersResponse] = await Promise.all([
          getActivityLogs({
            page: 1,
            pageSize: RECENT_ACTIVITY_LIMIT,
          }),
          getAdminUsers({
            page: 1,
            pageSize: 200,
          }),
        ]);

        if (!isMounted) return;

        const extractedLogs = extractRecentLogs(logsResponse).slice(
          0,
          RECENT_ACTIVITY_LIMIT
        );
        const extractedUsers = extractAdminUsers(usersResponse);

        setRecentLogs(extractedLogs);
        setAdminUsers(extractedUsers);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch dashboard recent activities:", error);
        setRecentLogs([]);
        setAdminUsers([]);
      }
    };

    Promise.resolve().then(() => {
      void fetchDashboardActivityData();
    });

    return () => {
      isMounted = false;
    };
  }, [canLoadDashboard]);

  const fetchEmployeeDashboardData = useCallback(async () => {
    if (!canLoadDashboard) return;

    try {
      const [
        summaryResponse,
        regularResponse,
        probationaryResponse,
        contractResponse,
      ] = await Promise.all([
        getEmployees({
          page: 1,
          pageSize: 1,
        }),
        getEmployees({
          page: 1,
          pageSize: 1,
          isActive: true,
          employmentType: "Regular",
        }),
        getEmployees({
          page: 1,
          pageSize: 1,
          isActive: true,
          employmentType: "Probationary",
        }),
        getEmployees({
          page: 1,
          pageSize: 1,
          isActive: true,
          employmentType: "Project-based",
        }),
      ]);

      const summaryPayload = extractEmployeesPayload(summaryResponse);
      const regularPayload = extractEmployeesPayload(regularResponse);
      const probationaryPayload =
        extractEmployeesPayload(probationaryResponse);
      const contractPayload = extractEmployeesPayload(contractResponse);

      const summary = summaryPayload?.summary ?? null;

      const activeEmploymentTypeSummary: EmploymentTypeSummary = {
        regular: regularPayload?.totalCount ?? 0,
        probationary: probationaryPayload?.totalCount ?? 0,
        contract: contractPayload?.totalCount ?? 0,
      };

      setEmployeeSummary(summary);
      setEmploymentSummary(activeEmploymentTypeSummary);
    } catch (error) {
      console.error("Failed to fetch employee dashboard data:", error);
      setEmployeeSummary(null);
      setEmploymentSummary(emptyEmploymentSummary());
    }
  }, [canLoadDashboard]);

  useEffect(() => {
    if (!canLoadDashboard) return;

    let isMounted = true;

    const runFetch = async () => {
      if (!isMounted) return;
      await fetchEmployeeDashboardData();
    };

    Promise.resolve().then(() => {
      void runFetch();
    });

    const unsubscribe = subscribeEmployeeStatsChanged(() => {
      Promise.resolve().then(() => {
        void runFetch();
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [fetchEmployeeDashboardData, canLoadDashboard]);

  useEffect(() => {
    if (!canLoadDashboard) return;

    let isMounted = true;

    const fetchLeaveDashboardData = async () => {
      try {
        const requests = await getAdminLeaveRequests();

        if (!isMounted) return;

        setLeaveRequests(Array.isArray(requests) ? requests : []);
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch dashboard leave data:", error);
        setLeaveRequests([]);
      }
    };

    Promise.resolve().then(() => {
      void fetchLeaveDashboardData();
    });

    return () => {
      isMounted = false;
    };
  }, [canLoadDashboard]);

  const fetchAttendanceDashboardData = useCallback(async () => {
    if (!canLoadDashboard) return;

    try {
      const currentYear = new Date().getFullYear();
      const trends = await getAttendanceTrends(currentYear);

      setAttendanceTrends(
        Array.isArray(trends) && trends.length === 12
          ? trends
          : emptyMonthlyAttendanceTrends()
      );
    } catch (error) {
      console.error("Failed to fetch dashboard attendance trends:", error);
      setAttendanceTrends(emptyMonthlyAttendanceTrends());
    }
  }, [canLoadDashboard]);

  useEffect(() => {
    if (!canLoadDashboard) return;

    let isMounted = true;

    const runFetch = async () => {
      if (!isMounted) return;
      await fetchAttendanceDashboardData();
    };

    Promise.resolve().then(() => {
      void runFetch();
    });

    return () => {
      isMounted = false;
    };
  }, [fetchAttendanceDashboardData, canLoadDashboard]);

  useEffect(() => {
    if (!canLoadDashboard) return;

    let isMounted = true;

    const fetchPayrollDashboardData = async () => {
      try {
        const periods = await getPayrollPeriods();
        const sortedPeriods = [...periods].sort((a, b) =>
          b.startDate.localeCompare(a.startDate)
        );

        if (!sortedPeriods.length) {
          if (!isMounted) return;
          setPayrollRecords([]);
          setPayrollPeriodLabel("No processed payroll yet");
          return;
        }

        const latestMonthKey = getPayrollMonthKey(sortedPeriods[0]);
        const latestMonthPeriods = sortedPeriods.filter(
          (period) => getPayrollMonthKey(period) === latestMonthKey
        );

        const recordsByPeriod = await Promise.all(
          latestMonthPeriods.map((period) => getPayrollRecords(period.id))
        );

        if (!isMounted) return;

        setPayrollRecords(recordsByPeriod.flat());
        setPayrollPeriodLabel(formatPayrollMonth(latestMonthPeriods));
      } catch (error) {
        if (!isMounted) return;
        console.error("Failed to fetch dashboard payroll data:", error);
        setPayrollRecords([]);
        setPayrollPeriodLabel("Payroll data unavailable");
      }
    };

    Promise.resolve().then(() => {
      void fetchPayrollDashboardData();
    });

    return () => {
      isMounted = false;
    };
  }, [canLoadDashboard]);

  const safeRecentLogs = canLoadDashboard ? recentLogs : [];
  const safeAdminUsers = adminUsers;
  const safeEmployeeSummary = canLoadDashboard
    ? (employeeSummary ?? emptyEmployeeSummary())
    : emptyEmployeeSummary();
  const safeEmploymentSummary = canLoadDashboard
    ? employmentSummary
    : emptyEmploymentSummary();
  const safeLeaveRequests = canLoadDashboard ? leaveRequests : [];
  const employeesOnLeaveToday = countEmployeesOnLeaveToday(safeLeaveRequests);

  const safeAttendanceTrends = canLoadDashboard
    ? attendanceTrends
    : emptyMonthlyAttendanceTrends();

  const userNameByEmail = useMemo(
    () => buildUserNameByEmail(safeAdminUsers),
    [safeAdminUsers]
  );

  const statCards = [
    {
      title: "Total Employees",
      value: safeEmployeeSummary.total,
      icon: Users,
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      change: "0%",
    },
    {
      title: "Active Employees",
      value: safeEmployeeSummary.active,
      icon: UserCheck,
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
      change: "0%",
    },
    {
      title: "On Leave",
      value: employeesOnLeaveToday,
      icon: UserX,
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      change: "0",
    },
    {
      title: "Resigned",
      value: safeEmployeeSummary.inactive,
      icon: UserPlus,
      gradient: "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
      change: "0",
    },
  ];

  const attendanceData = {
    labels: safeAttendanceTrends.map((item) => item.monthLabel),
    datasets: [
      {
        label: "Present",
        data: safeAttendanceTrends.map((item) => item.presentCount),
        backgroundColor: "#059669",
        borderRadius: 6,
        borderSkipped: false as const,
      },
      {
        label: "Late",
        data: safeAttendanceTrends.map((item) => item.lateCount),
        backgroundColor: "#f59e0b",
        borderRadius: 6,
        borderSkipped: false as const,
      },
      {
        label: "Overtime",
        data: safeAttendanceTrends.map((item) => item.overtimeCount),
        backgroundColor: "#3b82f6",
        borderRadius: 6,
        borderSkipped: false as const,
      },
      {
        label: "Absent",
        data: safeAttendanceTrends.map((item) => item.absentCount),
        backgroundColor: "#ef4444",
        borderRadius: 6,
        borderSkipped: false as const,
      },
    ],
  };

  const attendanceOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle" as const,
          padding: 20,
          font: { size: 12, family: "Inter", weight: 500 as const },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: "Inter" }, color: "#94a3b8" },
      },
      y: {
        grid: { color: "#f1f5f9" },
        ticks: { font: { size: 11, family: "Inter" }, color: "#94a3b8" },
        border: { display: false },
      },
    },
  };

  const employmentData = {
    labels: ["Regular", "Probationary", "Project-based"],
    datasets: [
      {
        data: [
          safeEmploymentSummary.regular,
          safeEmploymentSummary.probationary,
          safeEmploymentSummary.contract,
        ],
        backgroundColor: ["#059669", "#f59e0b", "#3b82f6"],
        borderWidth: 0,
        cutout: "70%",
        spacing: 3,
      },
    ],
  };

  const employmentOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle" as const,
          padding: 16,
          font: { size: 12, family: "Inter", weight: 500 as const },
        },
      },
    },
  };

  const payrollFinancials = useMemo(() => {
    if (payrollRecords.length === 0) {
      return {
        grossPay: 0,
        totalDeductions: 0,
        netPay: 0,
        breakdown: [],
      };
    }

    const grossPay = payrollRecords.reduce(
      (sum, record) => sum + record.grossPay,
      0
    );
    const totalDeductions = payrollRecords.reduce(
      (sum, record) => sum + record.totalDeductions,
      0
    );
    const netPay = payrollRecords.reduce((sum, record) => sum + record.netPay, 0);

    const earningItems = payrollRecords.flatMap((record) =>
      record.items.filter((item) => item.type.toLowerCase() === "earning")
    );

    const basicPay = earningItems
      .filter((item) => item.description.toLowerCase().includes("basic"))
      .reduce((sum, item) => sum + item.amount, 0);

    const overtimePay = earningItems
      .filter((item) => {
        const description = item.description.toLowerCase();
        return (
          /\bovertime\b/.test(description) ||
          /\bot\b/.test(description)
        );
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const resolvedBasicPay = basicPay > 0 ? basicPay : grossPay;
    const otherEarnings = Math.max(grossPay - resolvedBasicPay - overtimePay, 0);
    const denominator = Math.max(grossPay, totalDeductions, 1);

    const toPercent = (amount: number) =>
      Math.min(100, Math.round((Math.abs(amount) / denominator) * 100));

    const breakdown = [
      {
        label: "Basic Pay",
        amount: formatCurrency(resolvedBasicPay),
        percent: toPercent(resolvedBasicPay),
        color: "#059669",
      },
      ...(overtimePay > 0
        ? [
            {
              label: "Overtime Pay",
              amount: formatCurrency(overtimePay),
              percent: toPercent(overtimePay),
              color: "#3b82f6",
            },
          ]
        : []),
      ...(otherEarnings > 0
        ? [
            {
              label: "Other Earnings",
              amount: formatCurrency(otherEarnings),
              percent: toPercent(otherEarnings),
              color: "#8b5cf6",
            },
          ]
        : []),
      ...(totalDeductions > 0
        ? [
            {
              label: "Deductions",
              amount: `-${formatCurrency(totalDeductions)}`,
              percent: toPercent(totalDeductions),
              color: "#ef4444",
            },
          ]
        : []),
      {
        label: "Net Payroll",
        amount: formatCurrency(netPay),
        percent: toPercent(netPay),
        color: "#14b8a6",
      },
    ].filter((item) => item.percent > 0 || item.label === "Net Payroll");

    return {
      grossPay,
      totalDeductions,
      netPay,
      breakdown,
    };
  }, [payrollRecords]);

  const financialBreakdown = payrollFinancials.breakdown;

  const employmentTypeTargets = [
    { label: "Regular", query: "Regular" },
    { label: "Probationary", query: "Probationary" },
    { label: "Project-based", query: "Project-based" },
  ] as const;

  const navigateToEmploymentType = (query: string) => {
    navigate(
      `/dashboard/personal-records?employmentType=${encodeURIComponent(query)}`
    );
  };

  const handleEmploymentChartClick = (
    event: React.MouseEvent<HTMLCanvasElement>
  ) => {
    const chart = employmentChartRef.current;
    if (!chart) return;

    const elements = getElementAtEvent(chart, event);
    if (!elements.length) return;

    const clickedIndex = elements[0].index;
    const target = employmentTypeTargets[clickedIndex];

    if (!target) return;
    navigateToEmploymentType(target.query);
  };

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatRecentTimestamp = (value?: string) => {
    if (!value) return "—";

    const datePart = formatDatePart(value);
    const timePart = formatTimePart(value);

    if (datePart === "—" || timePart === "—") return "—";

    return `${datePart} at ${timePart}`;
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4 text-emerald-200/80" />
            <span className="text-xs text-emerald-200/80 font-medium">
              {time.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{greeting()}, Admin!</h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Here's what's happening with your workforce today.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => (
          <div
            key={card.title}
            className="stat-card animate-fade-in-up cursor-pointer group"
            style={{
              background: card.gradient,
              animationDelay: `${i * 0.1}s`,
              opacity: 0,
            }}
          >
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="stat-label">{card.title}</p>
                <p className="stat-value mt-1">{card.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="text-xs font-semibold opacity-90">
                    {card.change}
                  </span>
                </div>
              </div>
              <div className="stat-icon">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 pro-card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Attendance Summary
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Monthly attendance overview for 2026
              </p>
            </div>
          </div>
          <div style={{ height: 320 }}>
            <Bar data={attendanceData} options={attendanceOptions} />
          </div>
        </div>

        <div
          className="pro-card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.5s", opacity: 0 }}
        >
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800">
              Employment Type
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Distribution by type
            </p>
          </div>

          <div
            style={{ height: 260 }}
            className="relative cursor-pointer"
            title="Click chart segment to filter employees"
          >
            <Doughnut
              ref={employmentChartRef}
              data={employmentData}
              options={employmentOptions}
              onClick={handleEmploymentChartClick}
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">3</div>
                <div className="text-xs font-medium text-gray-400">Types</div>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {[
              {
                label: "Regular",
                value: safeEmploymentSummary.regular,
                color: "#059669",
                query: "Regular",
              },
              {
                label: "Probationary",
                value: safeEmploymentSummary.probationary,
                color: "#f59e0b",
                query: "Probationary",
              },
              {
                label: "Project-based",
                value: safeEmploymentSummary.contract,
                color: "#3b82f6",
                query: "Project-based",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigateToEmploymentType(item.query)}
                className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left text-xs transition hover:bg-gray-50"
                title={`Show ${item.label} employees`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-gray-500">{item.label}</span>
                </div>
                <span className="font-semibold text-gray-700">
                  {item.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 pro-card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.6s", opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Recent Activities
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Latest events in the system
              </p>
            </div>
          </div>

          <div className="space-y-1">
            {safeRecentLogs.map((log, i) => {
              const visual = getRecentActivityVisual(log.action);
              const Icon = visual.icon;
              const timestamp = log.createdAt || "";
              const description = prettifyDetails(log, userNameByEmail);
              const fallbackLabel = formatActionLabel(
                log.action || "SYSTEM_ACTIVITY"
              );

              return (
                <div
                  key={log.id ?? `recent-log-${i}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-pointer"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: visual.background }}
                  >
                    <Icon className="w-4 h-4" style={{ color: visual.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium">
                      {description && description !== "—"
                        ? description
                        : fallbackLabel}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatRecentTimestamp(timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="pro-card p-6 animate-fade-in-up"
          style={{ animationDelay: "0.7s", opacity: 0 }}
        >
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-800">
              Financial Summary
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {payrollPeriodLabel}
            </p>
          </div>
          <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-gray-500 font-medium">
                Total Payroll
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(payrollFinancials.grossPay)}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
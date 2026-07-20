import { useCallback, useEffect, useState } from "react";
import { Bell, ChevronRight, Check, Trash2, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEmployees } from "../../lib/employees";
import { subscribeEmployeeStatsChanged } from "../../lib/events/employeeEvents";
import { useAvatarUrl } from "../../hooks/useAvatarUrl";
import { useTopBarNotifications } from "./hooks/useTopBarNotifications";

type TopBarProps = {
  onMenuClick?: () => void;
};

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/personal-records": "Employee Management",
  "/dashboard/attendance": "Attendance Log",
  "/dashboard/leave": "Leave Management",
  "/dashboard/payroll": "Payroll",
  "/dashboard/compliance": "Government Compliance",
  "/dashboard/assets": "Asset Management",
  "/dashboard/clearance": "Clearance",
  "/dashboard/hris": "HRIS System",
  "/dashboard/settings": "Settings",
  "/dashboard/my-attendance": "Attendance Log",
  "/dashboard/my-payslips": "My Pay Slips",
  "/dashboard/my-performance": "My Performance",
  "/dashboard/my-assets": "My Assets",
  "/dashboard/daily-accomplishment": "Daily Accomplishment Reports",
  "/dashboard/my-daily-accomplishment": "Daily Accomplishment",
};

const TopBar = ({ onMenuClick }: TopBarProps) => {
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const backendRole = user?.role;
  const isAdmin = backendRole === "SUPER_ADMIN" || backendRole === "ADMIN";

  const displayName = user?.fullName?.trim() || "Unknown User";

  const displayRole =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
      ? "Admin"
      : user?.role === "USER"
      ? "User"
      : "Unknown Role";

  const displayInitial = displayName?.charAt(0)?.toUpperCase() || "U";
  const avatarUrl = useAvatarUrl(user?.id);

  const [activeEmployees, setActiveEmployees] = useState<number>(0);

  const {
    showNotifications,
    notifications,
    unreadCount,
    setShowNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    handleNotificationClick,
  } = useTopBarNotifications({ isAdmin, navigate });

  const fetchSummary = useCallback(async () => {
    if (!isAdmin || !user || !token) {
      setActiveEmployees(0);
      return;
    }

    try {
      const res = await getEmployees({
        page: 1,
        pageSize: 1,
      });

      const payload =
        res && typeof res === "object" && "data" in res
          ? (res.data ?? res)
          : res;

      if (payload && typeof payload === "object" && "summary" in payload) {
        setActiveEmployees(payload.summary?.active ?? 0);
        return;
      }

      setActiveEmployees(0);
    } catch (err) {
      console.error("Failed to fetch employee summary", err);
      setActiveEmployees(0);
    }
  }, [isAdmin, token, user]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isAdmin || !user || !token) {
      setActiveEmployees(0);
      return;
    }

    let isMounted = true;

    const runFetch = async () => {
      if (!isMounted) return;
      await fetchSummary();
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
  }, [fetchSummary, isAdmin, token, user]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const currentPage = routeLabels[location.pathname] || "Page";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="hidden lg:flex items-center gap-2 text-sm min-w-0">
            <span className="text-gray-400 font-medium shrink-0">HRIS</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="font-semibold text-gray-800 truncate">{currentPage}</span>
          </div>

          <div className="lg:hidden">
            <span className="font-semibold text-gray-800 truncate">{currentPage}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {isAdmin && (
          <div className="hidden sm:flex bg-gradient-to-r from-emerald-600 to-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm items-center gap-2 whitespace-nowrap shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
            {activeEmployees} Active Employees
          </div>
        )}

        <div className="hidden md:flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-tight">{formatTime(time)}</p>
            <p className="text-[11px] text-gray-400 leading-tight">{formatDate(time)}</p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className={`relative p-2 rounded-xl transition-colors group ${
              showNotifications
                ? "bg-emerald-50 text-emerald-600"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <Bell
              className={`h-5 w-5 transition-colors ${
                showNotifications ? "text-emerald-600" : "group-hover:text-gray-700"
              }`}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-[20rem] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                  <h3 className="font-bold text-gray-900 text-sm">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n.path, n.id)}
                        className={`p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors cursor-pointer relative group ${
                          !n.read ? "bg-emerald-50/30" : ""
                        }`}
                      >
                        {!n.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                        )}

                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            n.type === "leave"
                              ? "bg-blue-100 text-blue-600"
                              : n.type === "payroll"
                              ? "bg-emerald-100 text-emerald-600"
                              : n.type === "attendance"
                              ? "bg-rose-100 text-rose-600"
                              : "bg-amber-100 text-amber-600"
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-xs font-bold truncate ${
                                n.read ? "text-gray-700" : "text-gray-900"
                              }`}
                            >
                              {n.title}
                            </p>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!n.read && (
                                <button
                                  onClick={(e) => markAsRead(n.id, e)}
                                  className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}

                              <button
                                onClick={(e) => deleteNotification(n.id, e)}
                                className="p-1 hover:bg-rose-100 rounded text-rose-500"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
                            {n.time}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-400 text-xs">No notifications yet</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-gray-50/50 text-center border-t border-gray-50">
                  <button className="text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                {displayInitial}
              </div>
            )}
          </div>

          <div className="hidden xl:block">
            <p className="text-xs font-semibold text-gray-800">{displayName}</p>
            <p className="text-[10px] text-gray-400">{displayRole}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;

import { useCallback, useEffect, useState } from "react";
import type { MouseEvent } from "react";
import type { NavigateFunction } from "react-router-dom";

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "leave" | "payroll" | "attendance" | "system";
  path?: string;
};

type UseTopBarNotificationsOptions = {
  navigate: NavigateFunction;
};

const initialNotifications: NotificationItem[] = [
  {
    id: 1,
    title: "New Leave Request",
    message: "Juan Dela Cruz submitted a leave request.",
    time: "2 mins ago",
    read: false,
    type: "leave",
    path: "/dashboard/leave",
  },
  {
    id: 2,
    title: "Payroll Processed",
    message: "Payroll for Feb 1-15 has been successfully processed.",
    time: "1 hour ago",
    read: false,
    type: "payroll",
    path: "/dashboard/payroll",
  },
  {
    id: 3,
    title: "System Update",
    message: "System maintenance at 12:00 AM.",
    time: "5 hours ago",
    read: true,
    type: "system",
    path: "/dashboard/settings",
  },
  {
    id: 4,
    title: "Compliance Update",
    message: "New Government Reporting requirements added.",
    time: "1 day ago",
    read: false,
    type: "system",
    path: "/dashboard/compliance",
  },
];

export const useTopBarNotifications = ({
  navigate,
}: UseTopBarNotificationsOptions) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);

  useEffect(() => {
    const handleStorageChange = () => {
      const newNotif = localStorage.getItem("attendance_notification");
      if (!newNotif) return;

      try {
        const parsed = JSON.parse(newNotif);

        // Read role DIRECTLY from storage - never stale, no ref needed
        const rawUser =
          localStorage.getItem("auth.user") ||
          sessionStorage.getItem("auth.user");
        const currentUser = rawUser ? JSON.parse(rawUser) : null;
        const currentIsAdmin =
          currentUser?.role === "SUPER_ADMIN" ||
          currentUser?.role === "ADMIN";

        setNotifications((prev) => {
          if (prev.find((n) => n.id === parsed.id)) return prev;

          // Role-based filtering:
          // dar_submit -> only ADMIN should receive
          // dar_review -> only USER should receive
          if (parsed.type === "dar_submit" && !currentIsAdmin) return prev;
          if (parsed.type === "dar_review" && currentIsAdmin) return prev;

          // Route to correct page based on type
          let path: string;
          if (parsed.type === "dar_submit") {
            path = "/dashboard/daily-accomplishment";
          } else if (parsed.type === "dar_review") {
            path = "/dashboard/my-daily-accomplishment";
          } else {
            path = currentIsAdmin
              ? "/dashboard/attendance"
              : "/dashboard/my-attendance";
          }

          return [
            {
              id: parsed.id,
              title: parsed.title,
              message: parsed.message,
              time: parsed.time,
              type: "system",
              read: false,
              path,
            },
            ...prev,
          ];
        });
      } finally {
        localStorage.removeItem("attendance_notification");
      }
    };

    // Listen to both storage (cross-tab) AND custom event (same-tab)
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("dar_notification", handleStorageChange);
    const checkInterval = setInterval(handleStorageChange, 2000);

    return () => {
      clearInterval(checkInterval);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("dar_notification", handleStorageChange);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: number, e: MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const deleteNotification = useCallback((id: number, e: MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const handleNotificationClick = useCallback(
    (path: string | undefined, id: number) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setShowNotifications(false);
      navigate(path || "/dashboard");
    },
    [navigate]
  );

  return {
    showNotifications,
    notifications,
    unreadCount,
    setShowNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    handleNotificationClick,
  };
};

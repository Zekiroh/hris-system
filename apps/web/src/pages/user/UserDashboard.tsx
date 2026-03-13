import { useEffect, useState } from "react";
import {
  Clock,
  FileText,
  DollarSign,
  Star,
  CheckCircle2,
  Calendar,
  Megaphone,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  children: (time: Date) => React.ReactNode;
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <>{children(time)}</>;
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const statCards = [
    {
      label: "Leaves Available",
      value: "12.5 Days",
      sub: "8 Vacation, 4.5 Sick",
      icon: Calendar,
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    },
    {
      label: "Current Shift",
      value: "09:00 AM - 06:00 PM",
      sub: "Regular Schedule",
      icon: Clock,
      gradient: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    {
      label: "Next Payday",
      value: "Feb 15, 2026",
      sub: "5 days remaining",
      icon: DollarSign,
      gradient: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    },
    {
      label: "Performance Rating",
      value: "4.6 / 5.0",
      sub: "Top 10% in Department",
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

  const announcements = [
    {
      date: "FEB 14, 2026",
      title: "Townhall Meeting",
      desc: "Join Us For The Q1 Townhall Meeting This Friday At 3 PM In The Main Conference Room.",
    },
    {
      date: "JAN 25, 2026",
      title: "Tax Updates For 2026",
      desc: "Please Review The Newly Updated Tax Brackets Sent By The Finance Department.",
    },
    {
      date: "JAN 15, 2026",
      title: "Welcome New Hires",
      desc: "Say Hello To Our 5 New Software Engineers Who Joined This Month!",
    },
  ];

  const upcomingEvents = [
    {
      icon: "🎉",
      title: "Company Anniversary Gala",
      sub: "Grand Plaza Hotel, 6PM",
    },
    {
      icon: "🗓️",
      title: "Quarterly Department Sync",
      sub: "Zoom (Virtual), 10AM",
    },
    {
      icon: "🧘",
      title: "Wellness Friday (Yoga & Smoothies)",
      sub: "Main Office Lounge, 3PM",
    },
  ];

  const perks = [
    {
      icon: "🏥",
      title: "Premium Health HMO",
      desc: "Access Your Healthcard Details And Dependents Coverage Limits.",
    },
    {
      icon: "🌐",
      title: "WFH Connectivity Allowance",
      desc: "Claim Your Monthly ₱50 Internet Subsidy.",
    },
    {
      icon: "📚",
      title: "Learning & Development",
      desc: "Up To ₱500/Year For Courses And Certifications To Advance Your Career.",
    },
  ];

  return (
    <DashboardClock>
      {(time) => {
        const h = time.getHours();
        const greeting =
          h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

        return (
          <div className="space-y-4 md:space-y-6 pb-6">
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-4 md:p-6 text-white animate-fade-in-up relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-1/3 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full translate-y-1/2" />

              <div className="relative z-10">
                <h1 className="text-xl md:text-2xl font-bold">
                  {greeting}, {formatDisplayName(user)}!
                </h1>
                <p className="text-xs md:text-sm text-emerald-100/80 mt-1 max-w-2xl">
                  It&apos;s a great day to do great work. You have 1 new notification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {statCards.map((card, i) => (
                <div
                  key={card.label}
                  className="pro-card !p-0 overflow-hidden animate-fade-in-up min-w-0"
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
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

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 md:gap-6">
              <div className="xl:col-span-3 space-y-4 md:space-y-6 min-w-0">
                <div
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up"
                  style={{ animationDelay: "0.3s", opacity: 0 }}
                >
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => navigate(action.path)}
                      className="pro-card !p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all group cursor-pointer text-left min-w-0"
                    >
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
                    </button>
                  ))}
                </div>

                <div
                  className="pro-card p-4 md:p-5 animate-fade-in-up"
                  style={{ animationDelay: "0.4s", opacity: 0 }}
                >
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    My Tasks & Approvals
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">
                    Currently Have No Pending Tasks Or Items Requiring Your Attention.
                  </p>

                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold text-gray-700">
                      All Caught Up!
                    </span>
                  </div>
                </div>
              </div>

              <div
                className="xl:col-span-2 pro-card p-4 md:p-5 animate-fade-in-up min-w-0"
                style={{ animationDelay: "0.35s", opacity: 0 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Megaphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="text-base font-bold text-gray-800">
                    Announcements
                  </h3>
                </div>

                <div className="space-y-4">
                  {announcements.map((announcement, i) => (
                    <div
                      key={i}
                      className="border-l-2 border-emerald-400 pl-3 py-1 min-w-0"
                    >
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        {announcement.date}
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5 break-words">
                        {announcement.title}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed break-words">
                        {announcement.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              <div
                className="pro-card p-4 md:p-5 animate-fade-in-up"
                style={{ animationDelay: "0.5s", opacity: 0 }}
              >
                <h3 className="text-base font-bold text-gray-800 mb-4">
                  Upcoming Events
                </h3>

                <div className="space-y-3">
                  {upcomingEvents.map((event, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-white shadow-sm">
                        {event.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 break-words">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 break-words">
                          {event.sub}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="pro-card p-4 md:p-5 animate-fade-in-up"
                style={{ animationDelay: "0.55s", opacity: 0 }}
              >
                <h3 className="text-base font-bold text-gray-800 mb-4">
                  Your Perks & Benefits
                </h3>

                <div className="space-y-3">
                  {perks.map((perk, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-4 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 bg-white shadow-sm">
                        {perk.icon}
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 break-words">
                          {perk.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed break-words">
                          {perk.desc}
                        </p>
                      </div>
                    </div>
                  ))}
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
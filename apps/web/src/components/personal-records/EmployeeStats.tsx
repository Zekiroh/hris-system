import { Users, UserCheck, UserPlus, UserX } from "lucide-react";

export function EmployeeStats({
  total,
  active,
  newHires,
  inactive,
  filterStatus,
  onFilterStatusChange,
}: {
  total: number;
  active: number;
  newHires: number;
  inactive: number;
  filterStatus: string;
  onFilterStatusChange: (v: string) => void;
}) {
  const statItems = [
    {
      label: "Total",
      value: total,
      icon: Users,
      gradient: "linear-gradient(135deg, #059669, #10b981)",
      badge: "All",
    },
    {
      label: "Active",
      value: active,
      icon: UserCheck,
      gradient: "linear-gradient(135deg, #2563eb, #3b82f6)",
      badge: "Active",
    },
    {
      label: "New Hires",
      value: newHires,
      icon: UserPlus,
      gradient: "linear-gradient(135deg, #d97706, #f59e0b)",
      badge: "New Hires",
    },
    {
      label: "Inactive",
      value: inactive,
      icon: UserX,
      gradient: "linear-gradient(135deg, #dc2626, #ef4444)",
      badge: "Inactive",
    },
  ] as const;

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up"
      style={{ animationDelay: "0.1s", opacity: 0 }}
    >
      {statItems.map((item) => (
        <button
          key={item.label}
          onClick={() => onFilterStatusChange(item.badge)}
          className={`stat-card text-left transition-all ${
            filterStatus === item.badge
              ? "ring-2 ring-white/50 scale-[1.02]"
              : ""
          }`}
          style={{ background: item.gradient }}
          type="button"
        >
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{item.value}</p>
            </div>
            <div className="stat-icon">
              <item.icon className="w-5 h-5" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
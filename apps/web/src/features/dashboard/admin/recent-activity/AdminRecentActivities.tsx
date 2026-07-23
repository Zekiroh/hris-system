import type { LucideIcon } from "lucide-react";
import type { ActivityLogItemDto } from "../../../../services/api/activity-logs/activityLogs";

type RecentActivityVisual = {
  icon: LucideIcon;
  color: string;
  background: string;
};

type AdminRecentActivitiesProps = {
  recentLogs: ActivityLogItemDto[];
  userNameByEmail: Map<string, string>;
  getRecentActivityVisual: (action?: string) => RecentActivityVisual;
  prettifyDetails: (
    log: ActivityLogItemDto,
    userNameByEmail: Map<string, string>
  ) => string;
  formatActionLabel: (action: string) => string;
  formatRecentTimestamp: (value?: string) => string;
};

const AdminRecentActivities = ({
  recentLogs,
  userNameByEmail,
  getRecentActivityVisual,
  prettifyDetails,
  formatActionLabel,
  formatRecentTimestamp,
}: AdminRecentActivitiesProps) => (
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
      {recentLogs.map((log, i) => {
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
);

export default AdminRecentActivities;
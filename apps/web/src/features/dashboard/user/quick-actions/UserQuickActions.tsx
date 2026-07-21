import { ChevronRight, type LucideIcon } from "lucide-react";

type UserQuickAction = {
  label: string;
  icon: LucideIcon;
  path: string;
  color: string;
};

type UserQuickActionsProps = {
  quickActions: UserQuickAction[];
  onNavigate: (path: string) => void;
};

const UserQuickActions = ({
  quickActions,
  onNavigate,
}: UserQuickActionsProps) => (
  <div
    className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up"
    style={{ animationDelay: "0.24s", opacity: 0 }}
  >
    {quickActions.map((action) => (
      <button
        key={action.label}
        type="button"
        onClick={() => onNavigate(action.path)}
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
);

export default UserQuickActions;

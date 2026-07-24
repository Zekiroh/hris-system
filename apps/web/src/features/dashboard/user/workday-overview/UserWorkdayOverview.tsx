import type { LucideIcon } from "lucide-react";

type UserWorkdayOverviewCard = {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  gradient: string;
};

type UserWorkdayOverviewProps = {
  statCards: UserWorkdayOverviewCard[];
};

const UserWorkdayOverview = ({ statCards }: UserWorkdayOverviewProps) => (
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
);

export default UserWorkdayOverview;

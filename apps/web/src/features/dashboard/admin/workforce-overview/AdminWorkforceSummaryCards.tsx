import { ArrowUpRight, type LucideIcon } from "lucide-react";

type AdminWorkforceSummaryCard = {
  title: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  change: string;
};

type AdminWorkforceSummaryCardsProps = {
  statCards: AdminWorkforceSummaryCard[];
};

const AdminWorkforceSummaryCards = ({
  statCards,
}: AdminWorkforceSummaryCardsProps) => (
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
);

export default AdminWorkforceSummaryCards;

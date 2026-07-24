import type { LucideIcon } from 'lucide-react';

type AssetStatCardProps = {
    label: string;
    value: string | number;
    gradient: string;
    icon: LucideIcon;
    index: number;
};

const AssetStatCard = ({ label, value, gradient, icon: Icon, index }: AssetStatCardProps) => {
    return (
        <div className="stat-card animate-fade-in-up" style={{ background: gradient, animationDelay: `${index * 0.1}s`, opacity: 0 }}>
            <div className="flex items-center justify-between relative z-10">
                <div>
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                </div>
                <div className="stat-icon"><Icon className="w-5 h-5" /></div>
            </div>
        </div>
    );
};

export default AssetStatCard;

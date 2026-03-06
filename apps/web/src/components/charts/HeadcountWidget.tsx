
import { Users, UserCheck, TrendingUp, ArrowRight } from 'lucide-react';

interface HeadcountWidgetProps {
    title: string;
    count: number;
    subtitle?: string;
    icon?: 'users' | 'check';
    color?: string;
    gradient?: string;
    onView?: () => void;
}

const HeadcountWidget = ({
    title,
    count,
    subtitle,
    icon = 'users',
    gradient = 'gradient-green',
    onView,
}: HeadcountWidgetProps) => {
    const IconComponent = icon === 'users' ? Users : UserCheck;

    return (
        <div
            className={`${gradient} p-6 rounded-2xl shadow-lg relative overflow-hidden group cursor-pointer card-hover`}
            onClick={onView}
        >
            {/* Background decorative circle */}
            <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white/5"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                        <IconComponent size={22} className="text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-white/80 text-xs font-medium bg-white/10 px-2 py-1 rounded-full">
                        <TrendingUp size={12} />
                        <span>+2.5%</span>
                    </div>
                </div>

                <h3 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
                <p className="text-3xl font-extrabold text-white tracking-tight">{count.toLocaleString()}</p>

                {subtitle && (
                    <div className="mt-2 text-sm text-white/70">{subtitle}</div>
                )}

                <div className="mt-4 flex items-center gap-2 text-white/90 text-xs font-semibold group-hover:gap-3 transition-all duration-200">
                    <span>View Details</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>
            </div>
        </div>
    );
};

export default HeadcountWidget;

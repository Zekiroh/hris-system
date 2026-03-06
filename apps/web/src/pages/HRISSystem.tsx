import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Clock, FileText, DollarSign, Shield, UserCircle, Package, Settings, ArrowRight } from 'lucide-react';

const HRISSystem: FC = () => {
    const navigate = useNavigate();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const modules = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', gradient: 'linear-gradient(135deg, #059669, #10b981)' },
        { icon: Users, label: 'Employee Management', path: '/dashboard/personal-records', gradient: 'linear-gradient(135deg, #2563eb, #3b82f6)' },
        { icon: Clock, label: 'Time & Attendance', path: '/dashboard/attendance', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' },
        { icon: FileText, label: 'Leave Management', path: '/dashboard/leave', gradient: 'linear-gradient(135deg, #059669, #34d399)' },
        { icon: DollarSign, label: 'Payroll', path: '/dashboard/payroll', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
        { icon: Shield, label: 'Government Compliance', path: '/dashboard/compliance', gradient: 'linear-gradient(135deg, #dc2626, #ef4444)' },
        { icon: UserCircle, label: 'Employee Self-Service', path: '/dashboard/self-service', gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)' },
        { icon: Package, label: 'Asset Management', path: '/dashboard/assets', gradient: 'linear-gradient(135deg, #78350f, #a16207)' },
        { icon: Settings, label: 'Administration Setting', path: '/dashboard/settings', gradient: 'linear-gradient(135deg, #475569, #64748b)' },
    ];

    return (
        <div className="space-y-6 pb-6">
            {/* Welcome Banner */}
            <div className="rounded-2xl overflow-hidden animate-fade-in-up" style={{ background: 'linear-gradient(135deg, #059669, #10b981, #34d399)' }}>
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">System Administration</h1>
                        <p className="text-emerald-100 text-sm mt-1">Welcome, <span className="font-semibold text-white">Admin User</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white font-mono">{formatTime(time)}</p>
                        <p className="text-xs text-emerald-100">{formatDate(time)}</p>
                    </div>
                </div>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {modules.map((mod, i) => (
                    <button
                        key={mod.label}
                        onClick={() => navigate(mod.path)}
                        className="pro-card !p-0 overflow-hidden text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up group"
                        style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}
                    >
                        <div className="p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ background: mod.gradient }}>
                                <mod.icon className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-600 transition-colors">{mod.label}</h3>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HRISSystem;

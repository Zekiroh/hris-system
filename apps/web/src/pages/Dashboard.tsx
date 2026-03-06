import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, UserPlus, TrendingUp, Clock, FileText, DollarSign, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const Dashboard = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const statCards = [
        { title: 'Total Employees', value: 245, icon: Users, gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', change: '+5.2%' },
        { title: 'Active Employees', value: 235, icon: UserCheck, gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)', change: '+2.1%' },
        { title: 'On Leave', value: 3, icon: UserX, gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', change: '-1' },
        { title: 'New Hires', value: 18, icon: UserPlus, gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', change: '+12' },
    ];

    const attendanceData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Present',
                data: [220, 225, 230, 228, 232, 235, 230, 228, 233, 231, 229, 235],
                backgroundColor: '#059669',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Late',
                data: [15, 12, 8, 10, 7, 5, 9, 11, 6, 8, 10, 5],
                backgroundColor: '#f59e0b',
                borderRadius: 6,
                borderSkipped: false,
            },
            {
                label: 'Absent',
                data: [10, 8, 7, 7, 6, 5, 6, 6, 6, 6, 6, 5],
                backgroundColor: '#ef4444',
                borderRadius: 6,
                borderSkipped: false,
            },
        ],
    };

    const attendanceOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: { usePointStyle: true, pointStyle: 'circle', padding: 20, font: { size: 12, family: 'Inter', weight: 500 as const } },
            },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11, family: 'Inter' }, color: '#94a3b8' }, border: { display: false } },
        },
    };

    const employmentData = {
        labels: ['Regular', 'Probationary', 'Contract'],
        datasets: [{
            data: [185, 35, 25],
            backgroundColor: ['#059669', '#f59e0b', '#3b82f6'],
            borderWidth: 0,
            cutout: '70%',
            spacing: 3,
        }],
    };

    const employmentOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12, family: 'Inter', weight: 500 as const } },
            },
        },
    };

    const activities = [
        { icon: UserPlus, text: 'New employee Maria Santos was onboarded', time: '2 hours ago', color: '#059669' },
        { icon: Clock, text: 'Attendance report generated for January', time: '4 hours ago', color: '#3b82f6' },
        { icon: FileText, text: 'Leave request approved for Juan Dela Cruz', time: '5 hours ago', color: '#f59e0b' },
        { icon: TrendingUp, text: 'Payroll processing completed for January', time: '1 day ago', color: '#059669' },
        { icon: Users, text: '3 employees completed probationary period', time: '2 days ago', color: '#8b5cf6' },
    ];

    const financialBreakdown = [
        { label: 'Basic Salary', amount: '₱6,200,000', percent: 73, color: '#059669' },
        { label: 'Overtime Pay', amount: '₱850,000', percent: 10, color: '#3b82f6' },
        { label: 'Allowances', amount: '₱650,000', percent: 8, color: '#8b5cf6' },
        { label: 'Benefits', amount: '₱500,000', percent: 6, color: '#14b8a6' },
        { label: 'Deductions', amount: '-₱1,700,000', percent: 20, color: '#ef4444' },
    ];

    const greeting = () => {
        const h = time.getHours();
        if (h < 12) return 'Good Morning';
        if (h < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="space-y-6 pb-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="w-4 h-4 text-emerald-200/80" />
                        <span className="text-xs text-emerald-200/80 font-medium">
                            {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold">{greeting()}, Admin! 👋</h1>
                    <p className="text-sm text-emerald-100/70 mt-1">Here's what's happening with your workforce today.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((card, i) => (
                    <div
                        key={card.title}
                        className="stat-card animate-fade-in-up cursor-pointer group"
                        style={{ background: card.gradient, animationDelay: `${i * 0.1}s`, opacity: 0 }}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className="stat-label">{card.title}</p>
                                <p className="stat-value mt-1">{card.value}</p>
                                <div className="flex items-center gap-1 mt-2">
                                    <ArrowUpRight className="w-3 h-3" />
                                    <span className="text-xs font-semibold opacity-90">{card.change}</span>
                                </div>
                            </div>
                            <div className="stat-icon">
                                <card.icon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Attendance Summary */}
                <div className="lg:col-span-2 pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s', opacity: 0 }}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Attendance Summary</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly attendance overview for 2026</p>
                        </div>
                    </div>
                    <div style={{ height: 320 }}>
                        <Bar data={attendanceData} options={attendanceOptions} />
                    </div>
                </div>

                {/* Employment Status */}
                <div className="pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-gray-800">Employment Status</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Distribution by type</p>
                    </div>
                    <div style={{ height: 260 }}>
                        <Doughnut data={employmentData} options={employmentOptions} />
                    </div>
                    <div className="mt-4 space-y-2">
                        {[
                            { label: 'Regular', value: 185, color: '#059669' },
                            { label: 'Probationary', value: 35, color: '#f59e0b' },
                            { label: 'Contract', value: 25, color: '#3b82f6' },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                                    <span className="text-gray-500">{item.label}</span>
                                </div>
                                <span className="font-semibold text-gray-700">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Recent Activities */}
                <div className="lg:col-span-2 pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.6s', opacity: 0 }}>
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-base font-bold text-gray-800">Recent Activities</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Latest events in the system</p>
                        </div>
                    </div>
                    <div className="space-y-1">
                        {activities.map((activity, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: activity.color + '12' }}>
                                    <activity.icon className="w-4 h-4" style={{ color: activity.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
                    <div className="mb-5">
                        <h3 className="text-base font-bold text-gray-800">Financial Summary</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Monthly Payroll Overview</p>
                    </div>
                    <div className="mb-5 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs text-gray-500 font-medium">Total Payroll</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">₱8,500,000</p>
                    </div>
                    <div className="space-y-4">
                        {financialBreakdown.map((item) => (
                            <div key={item.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-gray-500 font-medium">{item.label}</span>
                                    <span className={`text-xs font-bold ${item.amount.startsWith('-') ? 'text-red-500' : 'text-gray-700'}`}>
                                        {item.amount}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${item.percent}%`, background: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

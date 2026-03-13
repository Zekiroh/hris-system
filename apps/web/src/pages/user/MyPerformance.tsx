import { Award, Target, Trophy, Star } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const MyPerformance = () => {
    const kpis = [
        { title: 'Complete Frontend React Migration', progress: 80, desc: 'Transition 10 legacy pages to the new framework.' },
        { title: 'Improve System Load Time by 20%', progress: 45, desc: 'Optimize assets and database queries to hit sub-1s load times.' },
        { title: 'Mentorship Program', progress: 100, desc: 'Successfully onboard and mentor 2 new junior developers.' },
    ];

    const appraisals = [
        { period: '2025 Annual Review', evaluator: 'Maria Garcia (Lead)', score: '4.6 / 5.0', rating: 'Outstanding' },
        { period: '2025 Mid-Year', evaluator: 'Maria Garcia (Lead)', score: '4.2 / 5.0', rating: 'Exceeds Expectations' },
        { period: '2024 Annual Review', evaluator: 'Maria Garcia (Lead)', score: '4.0 / 5.0', rating: 'Exceeds Expectations' },
    ];

    const achievements = [
        { icon: '🏆', title: 'Employee of the Month', sub: 'Awarded November 2025', color: '#f59e0b' },
        { icon: '☁️', title: 'AWS Cloud Architect', sub: 'Certification Completed, Jan 2026', color: '#2563eb' },
        { icon: '🤝', title: 'Team Player Award', sub: 'Voted by peers, H1 Q3 2025', color: '#8b5cf6' },
    ];

    const taskData = {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
            data: [12, 5, 3],
            backgroundColor: ['#059669', '#f59e0b', '#d1d5db'],
            borderWidth: 0,
            cutout: '65%',
            spacing: 2,
        }],
    };

    const taskOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: { usePointStyle: true, pointStyle: 'circle' as const, padding: 12, font: { size: 11, family: 'Inter', weight: 500 as const } },
            },
        },
    };

    const getProgressColor = (progress: number) => {
        if (progress === 100) return '#059669';
        if (progress >= 60) return '#f59e0b';
        return '#3b82f6';
    };

    return (
        <div className="space-y-6 pb-6">
            <div className="page-header animate-fade-in-up">
                <h1>My Performance</h1>
                <p>Track your goals, achievements, and performance reviews</p>
            </div>

            {/* Overall Score */}
            <div className="pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-50">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-800">4.6</p>
                                <p className="text-[10px] text-gray-400">/ 5.0</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Outstanding Performance</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Based on your latest Annual Review (2025). Keep up the great work!</p>
                        <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full">
                            <Star className="w-3 h-3" /> Top 10% Performer
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* KPIs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="pro-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
                        <div className="flex items-center gap-2 mb-5">
                            <Target className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800">Q1 2026 Key Objectives (KPIs)</h3>
                        </div>
                        <div className="space-y-6">
                            {kpis.map((kpi, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <h4 className="text-sm font-bold text-gray-800">{kpi.title}</h4>
                                        <span className="text-sm font-bold" style={{ color: getProgressColor(kpi.progress) }}>{kpi.progress}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${kpi.progress}%`, backgroundColor: getProgressColor(kpi.progress) }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">{kpi.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Past Appraisals */}
                    <div className="pro-card animate-fade-in-up" style={{ animationDelay: '0.35s', opacity: 0 }}>
                        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800">Past Appraisals</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">REVIEW PERIOD</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">EVALUATOR</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">SCORE</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">RATING</th>
                                        <th className="text-left px-5 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appraisals.map((a, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                            <td className="px-5 py-3 text-sm font-semibold text-gray-800">{a.period}</td>
                                            <td className="px-5 py-3 text-sm text-gray-500">{a.evaluator}</td>
                                            <td className="px-5 py-3 text-sm font-bold text-gray-700">{a.score}</td>
                                            <td className="px-5 py-3 text-sm text-emerald-600 font-semibold">{a.rating}</td>
                                            <td className="px-5 py-3">
                                                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Task Accomplishments + Achievements */}
                <div className="space-y-6">
                    {/* Task Accomplishments */}
                    <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
                        <h3 className="text-base font-bold text-gray-800 mb-4">Task Accomplishments</h3>
                        <div style={{ height: 200 }}>
                            <Doughnut data={taskData} options={taskOptions} />
                        </div>
                    </div>

                    {/* Achievements & Badges */}
                    <div className="pro-card p-5 animate-fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-base font-bold text-gray-800">Achievements & Badges</h3>
                        </div>
                        <div className="space-y-3">
                            {achievements.map((ach, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg bg-white shadow-sm flex-shrink-0">
                                        {ach.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{ach.title}</p>
                                        <p className="text-[11px] text-gray-400">{ach.sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyPerformance;

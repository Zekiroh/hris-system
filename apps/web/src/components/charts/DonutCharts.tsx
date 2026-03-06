
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DonutChartProps {
    title: string;
    dataValues: number[];
    labels: string[];
    colors: string[];
    cutout?: string;
}

const DonutChart = ({ title, dataValues, labels, colors, cutout = '72%' }: DonutChartProps) => {
    const data = {
        labels: labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: colors,
                borderWidth: 0,
                hoverBorderWidth: 2,
                hoverBorderColor: '#fff',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 10,
                padding: 10,
            },
        },
        cutout: cutout,
    };

    return (
        <div className="flex flex-col items-center p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group card-hover">
            <div className="relative h-28 w-28 mb-3">
                <Doughnut data={data} options={options} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-slate-700">{dataValues[0]}%</span>
                </div>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-2">{title}</p>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {labels.map((label, index) => (
                    <div key={label} className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                        ></div>
                        <span className="text-xs text-slate-500">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const StatisticsSection = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 w-full">
            <DonutChart
                title="Attendance"
                dataValues={[85, 15]}
                labels={['Present', 'Absent']}
                colors={['#059669', '#e5e7eb']}
            />
            <DonutChart
                title="Male / Female"
                dataValues={[60, 40]}
                labels={['Male', 'Female']}
                colors={['#3b82f6', '#ec4899']}
            />
            <DonutChart
                title="Organic"
                dataValues={[75, 25]}
                labels={['Organic', 'Others']}
                colors={['#f59e0b', '#e5e7eb']}
            />
            <DonutChart
                title="Non-Organic"
                dataValues={[45, 55]}
                labels={['Non-Organic', 'Others']}
                colors={['#8b5cf6', '#e5e7eb']}
            />
        </div>
    );
};

export default StatisticsSection;

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface AnalyticsBarProps {
    title: string;
    labels: string[];
    data: number[];
    color?: string;
}

export default function AnalyticsBar({ title, labels, data, color = '#2563EB' }: AnalyticsBarProps) {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                position: 'top' as const,
                align: 'start' as const,
                color: '#333',
                font: { size: 16, weight: 'bold' as const },
                padding: { bottom: 12 },
            },
        },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
            x: { grid: { display: false } },
        },
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data,
                backgroundColor: color,
                borderRadius: 4,
            },
        ],
    };

    return <div className="h-full w-full"><Bar options={options} data={chartData} /></div>;
}

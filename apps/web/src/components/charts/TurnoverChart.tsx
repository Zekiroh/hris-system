
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            // switch to bottom on narrow screens for better space usage
            position: (ctx: any) => (ctx?.chart?.width && ctx.chart.width < 480 ? 'bottom' : 'top'),
            align: 'end' as const,
            labels: {
                boxWidth: 12,
                padding: 8,
            }
        },
        title: {
            display: true,
            text: 'Turnover Rate (2024)',
            position: 'top' as const,
            align: 'start' as const,
            color: '#333',
            font: {
                // smaller font on narrow screens
                size: (ctx: any) => (ctx?.chart?.width && ctx.chart.width < 400 ? 12 : 16),
                weight: 'bold' as const,
            },
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            grid: {
                color: '#f0f0f0',
            }
        },
        x: {
            grid: {
                display: false,
            }
        }
    },
    elements: {
        line: {
            tension: 0.4, // smooth curves
        }
    }
};

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const data = {
    labels,
    datasets: [
        {
            fill: true,
            label: 'Turnover %',
            data: [12, 19, 15, 25, 22, 30, 28, 35, 20, 25, 18, 22],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
        },
    ],
};

export function TurnoverChart() {
    // responsive height: smaller on mobile, larger on desktop
    return (
        <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72">
            <Line options={options} data={data} />
        </div>
    );
}

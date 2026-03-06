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

const mobileOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                boxWidth: 10,
                padding: 6,
                usePointStyle: true,
            }
        },
        title: {
            display: true,
            text: 'Turnover (2024)',
            position: 'top' as const,
            align: 'start' as const,
            color: '#222',
            font: {
                size: 12,
                weight: '600' as const,
            },
        },
        tooltip: {
            mode: 'index',
            intersect: false,
            bodyFont: { size: 12 },
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100,
            ticks: {
                stepSize: 20,
                callback: function (value: any) {
                    return value + '%';
                }
            },
            grid: { color: '#f7f7f7' }
        },
        x: {
            grid: { display: false },
            ticks: {
                maxRotation: 0,
                minRotation: 0,
                callback: function (val: any, index: number) {
                    // show only short month names
                    const short = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                    return short[index] || '';
                }
            }
        }
    },
    elements: {
        point: { radius: 2 },
        line: { tension: 0.35, borderWidth: 2 }
    }
};

const labelsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const dataMobile = {
    labels: labelsShort,
    datasets: [
        {
            fill: true,
            label: 'Turnover %',
            data: [12, 19, 15, 25, 22, 30, 28, 35, 20, 25, 18, 22],
            borderColor: '#FF9800',
            backgroundColor: 'rgba(255, 152, 0, 0.12)',
            pointHoverRadius: 4,
            pointHitRadius: 8,
        },
    ],
};

export default function TurnoverChartMobile() {
    return (
        <div className="w-full h-40 sm:h-44">
            <Line options={mobileOptions} data={dataMobile} />
        </div>
    );
}

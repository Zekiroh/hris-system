
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

export const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: true,
            text: 'Manpower per Region',
            position: 'top' as const,
            align: 'start' as const,
            color: '#333',
            font: {
                size: 16,
                weight: 'bold' as const,
            },
            padding: {
                bottom: 20,
            }
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            grid: {
                color: '#f0f0f0',
            },
            ticks: {
                stepSize: 200,
            }
        },
        x: {
            grid: {
                display: false,
            }
        }
    }
};

const labels = ['BARMM', 'CAR', 'NCR', 'R1', 'R2', 'R3', 'R4A', 'R4B', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13'];

export const data = {
    labels,
    datasets: [
        {
            label: 'Manpower',
            data: [350, 480, 950, 500, 450, 600, 700, 300, 400, 550, 600, 400, 350, 400, 450, 380, 300],
            backgroundColor: '#008000',
            borderRadius: 4,
        },
    ],
};

export function ManpowerChart() {
    return <div className="h-full w-full"><Bar options={options} data={data} /></div>;
}

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
import type { TestResult } from '@/types';

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

interface LineChartProps {
  history: TestResult[];
}

export default function LineChart({ history }: LineChartProps) {
  const sortedHistory = [...history].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const labels = sortedHistory.map((h, index) => `第${index + 1}次`);

  const data = {
    labels,
    datasets: [
      {
        label: '外向 E',
        data: sortedHistory.map((h) => h.percentages.EI),
        borderColor: '#e94560',
        backgroundColor: 'rgba(233, 69, 96, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#e94560',
      },
      {
        label: '感觉 S',
        data: sortedHistory.map((h) => h.percentages.SN),
        borderColor: '#00d9ff',
        backgroundColor: 'rgba(0, 217, 255, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#00d9ff',
      },
      {
        label: '思考 T',
        data: sortedHistory.map((h) => h.percentages.TF),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#a855f7',
      },
      {
        label: '判断 J',
        data: sortedHistory.map((h) => h.percentages.JP),
        borderColor: '#00ff88',
        backgroundColor: 'rgba(0, 255, 136, 0.1)',
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointBackgroundColor: '#00ff88',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: 'Inter, sans-serif',
          },
          padding: 20,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (value: string | number) => `${value}%`,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart' as const,
    },
  };

  return <Line data={data} options={options} />;
}

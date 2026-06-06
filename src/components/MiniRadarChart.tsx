import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { TestResult } from '@/types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip
);

interface MiniRadarChartProps {
  result: TestResult;
  color?: string;
}

export default function MiniRadarChart({
  result,
  color = '#e94560',
}: MiniRadarChartProps) {
  const { percentages } = result;

  const data = {
    labels: ['E', 'S', 'T', 'J', 'I', 'N', 'F', 'P'],
    datasets: [
      {
        data: [
          percentages.EI,
          percentages.SN,
          percentages.TF,
          percentages.JP,
          100 - percentages.EI,
          100 - percentages.SN,
          100 - percentages.TF,
          100 - percentages.JP,
        ],
        backgroundColor: `${color}30`,
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.08)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: {
            size: 10,
            family: 'Inter, sans-serif',
          },
        },
        ticks: {
          display: false,
        },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div className="w-full h-full">
      <Radar data={data} options={options} />
    </div>
  );
}

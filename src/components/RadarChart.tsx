import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import type { TestResult } from '@/types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  result: TestResult;
  color?: string;
}

export default function RadarChart({ result, color = '#e94560' }: RadarChartProps) {
  const chartRef = useRef<ChartJS<'radar'>>(null);

  const { percentages } = result;

  const data = {
    labels: ['外向 E', '感觉 S', '思考 T', '判断 J', '内向 I', '直觉 N', '情感 F', '感知 P'],
    datasets: [
      {
        label: '维度强度',
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
        borderWidth: 2,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      r: {
          angleLines: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          pointLabels: {
            color: 'rgba(255, 255, 255, 0.7)',
            font: {
              size: 12,
              family: 'Inter, sans-serif',
            },
          },
          ticks: {
            display: false,
            stepSize: 20,
          },
          suggestedMin: 0,
          suggestedMax: 100,
        },
    },
    animation: {
      duration: 1500,
      easing: 'easeOutQuart' as const,
    },
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Radar ref={chartRef} data={data} options={options} />
    </div>
  );
}

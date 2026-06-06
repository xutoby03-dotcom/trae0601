import { useSmartHomeStore } from '@/store/useSmartHomeStore';
import { X, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const EnergyStats = () => {
  const { energyData, showEnergyPanel, setShowEnergyPanel } = useSmartHomeStore();

  if (!showEnergyPanel) return null;

  const totalUsage = energyData.reduce((sum, d) => sum + d.total, 0);

  const lineData = {
    labels: energyData.map((d) => d.date),
    datasets: [
      {
        label: '总用电量 (kWh)',
        data: energyData.map((d) => d.total),
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00d4ff',
        pointBorderColor: '#fff',
        pointRadius: 4,
      },
    ],
  };

  const deviceLabels: Record<string, string> = {
    light: '灯光',
    ac: '空调',
    curtain: '窗帘',
    speaker: '音响',
    humidifier: '加湿器',
    camera: '摄像头',
  };

  const latestData = energyData[energyData.length - 1]?.byDevice || {};
  const barData = {
    labels: Object.keys(latestData).map((k) => deviceLabels[k] || k),
    datasets: [
      {
        label: '今日用电量 (kWh)',
        data: Object.values(latestData),
        backgroundColor: [
          'rgba(0, 212, 255, 0.7)',
          'rgba(255, 107, 107, 0.7)',
          'rgba(78, 205, 196, 0.7)',
          'rgba(255, 230, 109, 0.7)',
          'rgba(149, 225, 211, 0.7)',
          'rgba(170, 150, 218, 0.7)',
        ],
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#9ca3af',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
      },
      y: {
        ticks: { color: '#6b7280' },
        grid: { color: 'rgba(107, 114, 128, 0.1)' },
      },
    },
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 max-w-full">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowEnergyPanel(false)} />
      <div className="absolute right-0 inset-y-0 w-full bg-gray-900/95 border-l border-gray-700 shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">能耗统计</h3>
                <p className="text-gray-400 text-sm">近7天用电数据</p>
              </div>
            </div>
            <button
              onClick={() => setShowEnergyPanel(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-900/40 to-cyan-800/20 border border-cyan-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                <TrendingUp className="w-4 h-4" />
                本周总用电
              </div>
              <div className="text-2xl font-bold text-white">
                {totalUsage.toFixed(1)}
                <span className="text-sm font-normal text-gray-400 ml-1">kWh</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 border border-emerald-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-emerald-400 text-sm mb-2">
                <BarChart3 className="w-4 h-4" />
                今日用电
              </div>
              <div className="text-2xl font-bold text-white">
                {energyData[energyData.length - 1]?.total.toFixed(1) || 0}
                <span className="text-sm font-normal text-gray-400 ml-1">kWh</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-white font-medium mb-4">每日用电量趋势</h4>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">今日设备用电分布</h4>
            <div className="p-4 bg-gray-800/50 rounded-xl">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

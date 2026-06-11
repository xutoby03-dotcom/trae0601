import { usePackageStore } from '@/store/usePackageStore';
import { TrendingUp, AlertTriangle, Clock, Package } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export default function Stats() {
  const getStats = usePackageStore((s) => s.getStats);
  const stats = getStats();

  const last7Days = stats.dailyArrivals.slice(-7);
  const chartData = last7Days.map((d) => ({
    ...d,
    date: d.date.slice(5),
  }));

  return (
    <div className="p-6 max-w-5xl">
      <h2 className="text-xl font-bold text-primary-800 mb-6">数据统计</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-warm-300/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-xs text-warm-500">总包裹数</span>
          </div>
          <p className="text-2xl font-bold text-primary-800">
            {usePackageStore.getState().packages.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-warm-300/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-coral-50 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-coral-600" />
            </div>
            <span className="text-xs text-warm-500">超时未取</span>
          </div>
          <p className="text-2xl font-bold text-coral-600">{stats.overdueCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-warm-300/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs text-warm-500">平均取件时长</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">
            {stats.avgPickupHours}<span className="text-sm font-medium ml-1">小时</span>
          </p>
        </div>
        <div className="bg-white rounded-xl border border-warm-300/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-ice-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-ice-600" />
            </div>
            <span className="text-xs text-warm-500">冷藏超时率</span>
          </div>
          <p className="text-2xl font-bold text-ice-600">
            {stats.coldChainOverdueRatio}<span className="text-sm font-medium ml-1">%</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-warm-300/50 p-5">
          <h3 className="text-sm font-semibold text-primary-700 mb-4">近7天到件量</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D3A8C" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2D3A8C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DD" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#AB9C86' }} />
                <YAxis tick={{ fontSize: 12, fill: '#AB9C86' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #EDE6DD',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2D3A8C"
                  strokeWidth={2}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-warm-300/50 p-5">
          <h3 className="text-sm font-semibold text-primary-700 mb-4">部门包裹排行</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE6DD" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#AB9C86' }} allowDecimals={false} />
                <YAxis
                  dataKey="department"
                  type="category"
                  tick={{ fontSize: 12, fill: '#2D3A8C' }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #EDE6DD',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#2D3A8C"
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

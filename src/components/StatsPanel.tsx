import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { useBatchStore } from '@/store/batchStore';
import { getLossRanking, getOvenUtilizations, getAverageOvertime } from '@/utils/stats';
import { TrendingDown, TrendingUp, PieChart as PieIcon, Award } from 'lucide-react';

export default function StatsPanel() {
  const { batches, ovens } = useBatchStore();
  const lossRanking = getLossRanking(batches).slice(0, 8);
  const ovenUtils = getOvenUtilizations(batches, ovens);
  const avgOvertime = getAverageOvertime(batches);

  const lossData = lossRanking.map((r) => ({
    name: r.productName,
    报损数: r.lossQuantity,
    报损率: +(r.lossRate * 100).toFixed(1),
  }));

  const pieData = ovenUtils.map((o) => ({
    name: o.ovenName,
    value: Math.max(1, Math.round(o.utilizationRate * 100)),
  }));

  const barColors = ['#D2691E', '#E29335', '#ECB159', '#FF8C42', '#F5D08A', '#D7CCC8', '#BCAAA4', '#8D6E63'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-danger to-red-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-espresso-800">报损排行 TOP</h3>
              <p className="text-xs text-espresso-500">今日各产品报损数量</p>
            </div>
          </div>
          {lossData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lossData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#5D4037' }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#5D4037' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #FDECC7',
                      background: '#FFF8E7',
                      color: '#3E2723',
                    }}
                    formatter={(v: number, n: string) => [
                      n === '报损率' ? `${v}%` : `${v} 个`,
                      n,
                    ]}
                  />
                  <Bar dataKey="报损数" radius={[0, 8, 8, 0]} barSize={20}>
                    {lossData.map((_, i) => (
                      <Cell key={i} fill={barColors[i % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-espresso-400 text-sm">
              暂无今日数据
            </div>
          )}
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-copper-400 to-copper-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-espresso-800">烤箱利用率</h3>
              <p className="text-xs text-espresso-500">今日每台烤箱使用情况</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={barColors[i % barColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, '利用率']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #FDECC7',
                    background: '#FFF8E7',
                    color: '#3E2723',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warn to-orange-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-espresso-800">超时分析</h3>
              <p className="text-xs text-espresso-500">今日平均超时情况</p>
            </div>
          </div>
          <div className="flex items-center justify-center h-56">
            <div className="text-center">
              <div
                className={`font-display text-7xl font-bold tabular-nums ${
                  avgOvertime > 3 ? 'text-danger' : avgOvertime > 0 ? 'text-warn' : 'text-success'
                }`}
              >
                {avgOvertime}
              </div>
              <div className="text-espresso-500 mt-2">分钟 / 每批平均超时</div>
              <div className="mt-4 text-sm text-espresso-500 max-w-xs mx-auto">
                {avgOvertime === 0
                  ? '🎉 太棒了！今日批次均未超时'
                  : avgOvertime < 2
                  ? '👍 控制良好，继续保持'
                  : '⚠️ 超时较多，建议加强巡视'}
              </div>
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-espresso-500 to-espresso-700 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-espresso-800">烤箱详情</h3>
              <p className="text-xs text-espresso-500">每台烤箱使用时长和利用率</p>
            </div>
          </div>
          <div className="space-y-3">
            {ovenUtils.map((o) => (
              <div key={o.ovenId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-espresso-700">{o.ovenName}</span>
                  <span className="text-espresso-500 tabular-nums">
                    {o.totalMinutes}分 · {(o.utilizationRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-espresso-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      o.utilizationRate > 0.7
                        ? 'bg-gradient-to-r from-success to-green-500'
                        : o.utilizationRate > 0.4
                        ? 'bg-gradient-to-r from-copper-400 to-copper-600'
                        : 'bg-gradient-to-r from-espresso-300 to-espresso-500'
                    }`}
                    style={{ width: `${Math.min(100, o.utilizationRate * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Activity, DollarSign, Footprints, ShoppingBag, BarChart2, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useShoeStore } from '@/store';
import { SURFACE_LABELS, Surface } from '@/types';
import LifeProgressBar from '@/components/LifeProgressBar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const SURFACE_CHART_COLORS: Record<Surface, string> = {
  asphalt: '#FF6B35',
  concrete: '#A0A0A0',
  track: '#FF4757',
  trail: '#2EC4B6',
  treadmill: '#60A5FA',
};

export default function Stats() {
  const getTotalStats = useShoeStore((s) => s.getTotalStats);
  const getShoesWithStats = useShoeStore((s) => s.getShoesWithStats);

  const stats = getTotalStats();
  const shoes = getShoesWithStats();

  const surfaceChartData = useMemo(() => {
    return (Object.keys(stats.surfaceComparison) as Surface[])
      .filter((s) => stats.surfaceComparison[s].distance > 0)
      .map((s) => ({
        name: SURFACE_LABELS[s],
        distance: Number(stats.surfaceComparison[s].distance.toFixed(1)),
        count: stats.surfaceComparison[s].count,
        color: SURFACE_CHART_COLORS[s],
      }));
  }, [stats.surfaceComparison]);

  const surfaceWearData = useMemo(() => {
    const entries = (Object.keys(stats.surfaceComparison) as Surface[])
      .filter((s) => stats.surfaceComparison[s].distance > 0)
      .map((s) => {
        const d = stats.surfaceComparison[s];
        return {
          key: s,
          name: SURFACE_LABELS[s],
          distance: Number(d.distance.toFixed(1)),
          count: d.count,
          lifeConsumed: Number(d.lifeConsumed.toFixed(2)),
          wearNotesCount: d.wearNotesCount,
          wearScore: Number(d.wearScore.toFixed(4)),
          color: SURFACE_CHART_COLORS[s],
        };
      });

    entries.sort((a, b) => b.wearScore - a.wearScore);

    const maxScore = entries.length > 0 ? entries[0].wearScore : 1;

    return entries.map((e) => ({
      ...e,
      wearPercent: maxScore > 0 ? Number(((e.wearScore / maxScore) * 100).toFixed(1)) : 0,
    }));
  }, [stats.surfaceComparison]);

  const wearConclusion = useMemo(() => {
    if (surfaceWearData.length < 2) return null;
    const worst = surfaceWearData[0];
    const best = surfaceWearData[surfaceWearData.length - 1];
    if (worst.wearScore === 0) return null;
    return { worst, best };
  }, [surfaceWearData]);

  const shoeCostData = useMemo(() => {
    return shoes
      .filter((s) => s.totalKilometers > 0)
      .sort((a, b) => b.costPerKilometer - a.costPerKilometer)
      .slice(0, 6)
      .map((s) => ({
        name: s.model.length > 10 ? s.model.slice(0, 10) + '...' : s.model,
        fullName: `${s.brand} ${s.model}`,
        cost: Number(s.costPerKilometer.toFixed(2)),
        km: Number(s.totalKilometers.toFixed(1)),
      }));
  }, [shoes]);

  const mostUsedShoe = shoes.length > 0
    ? [...shoes].sort((a, b) => b.totalKilometers - a.totalKilometers)[0]
    : null;

  const bestValueShoe = shoes.filter((s) => s.totalKilometers > 100).length > 0
    ? shoes.filter((s) => s.totalKilometers > 100).sort((a, b) => a.costPerKilometer - b.costPerKilometer)[0]
    : null;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-1">复盘统计</h1>
        <p className="text-gray-400">数据驱动，科学管理你的跑鞋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-energy-500/10 to-transparent border-energy-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-energy-500/20 flex items-center justify-center">
              <Footprints className="w-5 h-5 text-energy-400" />
            </div>
            <p className="text-sm text-gray-400">累计里程</p>
          </div>
          <p className="text-3xl font-display font-bold text-white">
            {stats.totalDistance.toFixed(1)}
            <span className="text-sm text-gray-400 ml-1">km</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-fresh-500/10 to-transparent border-fresh-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-fresh-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-fresh-400" />
            </div>
            <p className="text-sm text-gray-400">平均每公里成本</p>
          </div>
          <p className="text-3xl font-display font-bold text-white">
            ¥{stats.avgCostPerKm > 0 ? stats.avgCostPerKm.toFixed(2) : '-'}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-caution-500/10 to-transparent border-caution-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-caution-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-caution-400" />
            </div>
            <p className="text-sm text-gray-400">总投入 / 在役鞋</p>
          </div>
          <p className="text-3xl font-display font-bold text-white">
            ¥{stats.totalCost}
            <span className="text-sm text-gray-400 ml-1">/ {stats.activeShoes} 双</span>
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-gray-400">跑鞋总数</p>
          </div>
          <p className="text-3xl font-display font-bold text-white">
            {stats.totalShoes}
            <span className="text-sm text-gray-400 ml-1">双</span>
          </p>
        </div>
      </div>

      {(mostUsedShoe || bestValueShoe) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mostUsedShoe && (
            <div className="card border-night-500">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-energy-400" />
                <h3 className="font-display font-semibold text-white">里程冠军</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-400">{mostUsedShoe.brand}</p>
                  <p className="text-lg font-display font-bold text-white">{mostUsedShoe.model}</p>
                </div>
                <p className="text-2xl font-display font-bold text-energy-400">
                  {mostUsedShoe.totalKilometers.toFixed(1)} km
                </p>
              </div>
              <LifeProgressBar percentage={mostUsedShoe.lifePercentage} size="sm" showLabel={false} />
            </div>
          )}
          {bestValueShoe && (
            <div className="card border-night-500">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-fresh-400" />
                <h3 className="font-display font-semibold text-white">性价比之王</h3>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-400">{bestValueShoe.brand}</p>
                  <p className="text-lg font-display font-bold text-white">{bestValueShoe.model}</p>
                </div>
                <p className="text-2xl font-display font-bold text-fresh-400">
                  ¥{bestValueShoe.costPerKilometer.toFixed(2)}<span className="text-sm text-gray-400">/km</span>
                </p>
              </div>
              <LifeProgressBar percentage={bestValueShoe.lifePercentage} size="sm" showLabel={false} />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-energy-400" />
            <h3 className="font-display font-semibold text-white">路面里程分布</h3>
          </div>
          {surfaceChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
              暂无跑步数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={surfaceChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="distance"
                    nameKey="name"
                  >
                    {surfaceChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #3A3A3A',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number) => [`${value} km`, '里程']}
                  />
                  <Legend
                    wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-fresh-400" />
            <h3 className="font-display font-semibold text-white">每公里成本对比（Top 6）</h3>
          </div>
          {shoeCostData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
              暂无足够数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shoeCostData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" horizontal={false} />
                  <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 11 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6B7280"
                    tick={{ fontSize: 11 }}
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1A1A1A',
                      border: '1px solid #3A3A3A',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      name === 'cost' ? `¥${value}/km` : `${value} km`,
                      name === 'cost' ? '每公里成本' : '已跑里程',
                    ]}
                    labelFormatter={(label: string, payload: any) => payload?.[0]?.payload?.fullName || label}
                  />
                  <Bar dataKey="cost" fill="#FF6B35" radius={[0, 6, 6, 0]} name="cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
          <h3 className="font-display font-semibold text-white">路面磨损对比：哪个更费鞋？</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4">综合「每公里寿命消耗占比」和「磨损备注频率」计算磨损评分，评分越高越费鞋</p>

        {surfaceWearData.length < 2 ? (
          <p className="text-gray-500 text-sm">至少跑两种路面后，这里会显示磨损对比</p>
        ) : (
          <>
            {wearConclusion && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-danger-500/10 via-night-800 to-fresh-500/10 border border-night-600 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger-400" />
                    <span className="text-white font-semibold">{wearConclusion.worst.name}</span>
                    <span className="tag bg-danger-500/20 text-danger-400">更费鞋</span>
                  </div>
                  <span className="text-gray-500 mx-2">vs</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-fresh-400" />
                    <span className="text-white font-semibold">{wearConclusion.best.name}</span>
                    <span className="tag bg-fresh-500/20 text-fresh-400">更省鞋</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {surfaceWearData.map((s, idx) => (
                <div
                  key={s.key}
                  className={`p-4 rounded-xl bg-night-900 border ${
                    idx === 0 ? 'border-danger-500/40' : 'border-night-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: s.color }}
                      />
                      <p className="font-display font-semibold text-white">{s.name}</p>
                      {idx === 0 && <span className="tag bg-danger-500/20 text-danger-400">最费鞋</span>}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{s.distance} km</span>
                      <span>消耗寿命 {s.lifeConsumed}%</span>
                      <span>磨损备注 {s.wearNotesCount}/{s.count} 次</span>
                    </div>
                  </div>

                  <div className="progress-track h-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0
                          ? 'bg-gradient-to-r from-danger-500 to-red-400'
                          : 'bg-gradient-to-r from-fresh-500 to-emerald-400'
                      }`}
                      style={{ width: `${s.wearPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-gray-500">磨损评分 {s.wearScore}</span>
                    <span className="text-[10px] text-gray-500">{s.wearPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

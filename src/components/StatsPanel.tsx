import { useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useFishTankStore } from '@/store/useFishTankStore';
import {
  getMonthlyWaterChanges,
  getWaterQualityTrend,
  getMostProblematicFish,
  calculatePhStats,
} from '@/utils/stats';
import type { WaterChangeRecord } from '@/types';

interface Props {
  selectedMonth?: string;
}

export default function StatsPanel({ selectedMonth = 'all' }: Props) {
  const { waterChanges, observations, fishes } = useFishTankStore();

  const filteredChanges = useMemo<WaterChangeRecord[]>(() => {
    if (selectedMonth === 'all') return waterChanges;
    return waterChanges.filter((r) => {
      const d = new Date(r.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [waterChanges, selectedMonth]);

  const monthlyData = getMonthlyWaterChanges(filteredChanges).map((item) => {
    const [year, month] = item.month.split('-');
    const label = selectedMonth === 'all' ? item.month : `${year}年${Number(month)}月`;
    return { ...item, label };
  });
  const qualityTrend = getWaterQualityTrend(filteredChanges);
  const problematicFish = getMostProblematicFish(observations, fishes);
  const phStats = calculatePhStats(filteredChanges);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="text-purple-600" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">数据统计</h3>
            <p className="text-sm text-gray-500">
              {selectedMonth === 'all' ? '养护趋势一目了然' : '当前筛选月份统计'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Activity size={16} className="text-sky-500" />
            {selectedMonth === 'all' ? '每月换水次数' : '当月换水次数'}
          </h4>
          {filteredChanges.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              当前筛选无数据
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#999" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#999" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value: number) => [`${value} 次`, '换水次数']}
                    labelFormatter={(label: string) => `${label}`}
                  />
                  <Bar
                    dataKey="count"
                    fill="#0EA5E9"
                    radius={[4, 4, 0, 0]}
                    fillOpacity={1}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" />
            水质波动趋势
          </h4>
          {filteredChanges.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              当前筛选无数据
            </div>
          ) : (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityTrend} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#999" />
                  <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#999" />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#999" />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#F97316"
                    strokeWidth={2}
                    dot={{ fill: '#F97316', r: 3 }}
                    name="水温(°C)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ph"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: '#8B5CF6', r: 3 }}
                    name="PH值"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-sky-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-sky-700">{phStats.avg || '-'}</div>
            <div className="text-xs text-sky-500">平均PH</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-emerald-700">{phStats.range || '-'}</div>
            <div className="text-xs text-emerald-500">PH波动</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-amber-700">{filteredChanges.length}</div>
            <div className="text-xs text-amber-500">换水次数</div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Award size={16} className="text-rose-500" />
            最常出问题的鱼
          </h4>
          {problematicFish.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              暂无异常记录 🎉
            </div>
          ) : (
            <div className="space-y-2">
              {problematicFish.slice(0, 3).map((fish, index) => (
                <div
                  key={fish.fishId}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                >
                  <span className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0
                      ? 'bg-rose-200 text-rose-700'
                      : index === 1
                      ? 'bg-amber-200 text-amber-700'
                      : 'bg-sky-200 text-sky-700'
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-xl">{fish.avatar}</span>
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {fish.fishName}
                  </span>
                  <span className="text-sm text-rose-600 font-medium">
                    {fish.count} 次
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

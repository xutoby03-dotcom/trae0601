import { useEffect, useState, useMemo } from 'react';
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { TrendingUp, AlertTriangle, Clock, Calculator, Filter, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/store';
import { formatCurrency, getShiftLabel } from '@/utils/format';
import type { StatsResponse, Register } from '../../shared/types';

const PIE_COLORS = ['#0F766E', '#14B8A6', '#2DD4BF', '#99F6E4', '#D97706', '#F59E0B', '#DC2626', '#F87171'];

type ShiftFilterValue = 'all' | 'morning' | 'evening';

export default function Statistics() {
  const { statistics, fetchStatistics, registers, fetchRegisters } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [registerFilter, setRegisterFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<ShiftFilterValue>('all');

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (registerFilter !== 'all') p.registerId = registerFilter;
    if (shiftFilter !== 'all') p.shift = shiftFilter;
    return p;
  }, [registerFilter, shiftFilter]);

  useEffect(() => {
    fetchRegisters();
  }, [fetchRegisters]);

  useEffect(() => {
    setLoading(true);
    fetchStatistics(params).finally(() => setLoading(false));
  }, [fetchStatistics, params]);

  if (loading || !statistics) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-400">加载统计数据中...</div>
      </div>
    );
  }

  const data: StatsResponse = statistics;

  const shiftData = data.shiftDifferences.map((s) => ({
    name: getShiftLabel(s.shift),
    差额次数: s.count,
    差额总额: Math.abs(Number(s.totalAmount.toFixed(2))),
  }));

  const denominationData = data.denominationStats
    .map((d) => ({
      name: `¥${d.denomination}`,
      短缺: d.shortageCount,
      多出: d.surplusCount,
      total: d.shortageCount + d.surplusCount,
    }))
    .filter((d) => d.total > 0)
    .sort((a, b) => b.total - a.total);

  const pieData = denominationData.map((d) => ({
    name: d.name,
    value: d.total,
  }));

  const punctualityData = data.punctualityRate
    .filter((p) => p.total > 0)
    .map((p) => ({
      date: p.date.slice(5),
      准时率: p.rate,
      交接次数: p.total,
    }));

  const activeFilterCount = (registerFilter !== 'all' ? 1 : 0) + (shiftFilter !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setRegisterFilter('all');
    setShiftFilter('all');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">统计分析</h1>
          <p className="text-sm text-gray-500 mt-1">全方位了解备用金交接情况</p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <div className="absolute -top-1 -left-1 flex items-center justify-center">
              <Filter size={12} className="text-primary-600" />
            </div>
            <div className="flex flex-wrap gap-3 p-3 bg-warm-50 rounded-2xl border border-warm-200">
              <SelectField
                label="收银台"
                value={registerFilter}
                onChange={(v) => setRegisterFilter(v)}
                options={[
                  { value: 'all', label: '全部收银台' },
                  ...registers.map((r: Register) => ({
                    value: r.id,
                    label: `${r.code} · ${r.managerName}`,
                  })),
                ]}
              />
              <SelectField
                label="班次"
                value={shiftFilter}
                onChange={(v) => setShiftFilter(v as ShiftFilterValue)}
                options={[
                  { value: 'all', label: '全部班次' },
                  { value: 'morning', label: '早班' },
                  { value: 'evening', label: '晚班' },
                ]}
              />
              {(activeFilterCount > 0) && (
                <button
                  onClick={resetFilters}
                  className="self-end h-9 px-3 rounded-lg border border-warm-200 bg-white text-sm text-gray-500 hover:text-gray-700 hover:border-warm-300 transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw size={14} />
                  重置
                  <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
                    {activeFilterCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Calculator}
          label="收银台总数"
          value={data.overview.totalRegisters}
          suffix="台"
          gradient="bg-gradient-to-br from-sky-400 to-sky-600"
        />
        <StatCard
          icon={TrendingUp}
          label="今日交接"
          value={data.overview.todayHandovers}
          suffix="次"
          gradient="bg-gradient-to-br from-primary-400 to-primary-600"
        />
        <StatCard
          icon={AlertTriangle}
          label="未处理差额"
          value={data.overview.pendingDifferences}
          suffix="笔"
          gradient="bg-gradient-to-br from-amber-400 to-amber-600"
        />
        <StatCard
          icon={Clock}
          label="本周准时率"
          value={data.overview.weeklyPunctuality}
          suffix="%"
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">各班次差额统计</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DB" />
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fill: '#6B7280', fontSize: 12 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #E8E4DB',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  yAxisId="left"
                  dataKey="差额次数"
                  fill="#0F766E"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="差额总额"
                  fill="#D97706"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">常缺/多出面额分布</h2>
          {pieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #E8E4DB',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              暂无面额异常数据
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">本月交接准时率趋势</h2>
          {punctualityData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={punctualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DB" />
                  <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '准时率']}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #E8E4DB',
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="准时率"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    dot={{ fill: '#0F766E', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              本月暂无交接数据
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">未处理差额</h2>
          {data.pendingDifferences.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
              暂无未处理差额
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {data.pendingDifferences.map((p) => (
                <div
                  key={p.handoverId}
                  className={`p-3 rounded-xl border ${
                    Math.abs(p.amount) > 30
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{p.registerCode}</span>
                    <span
                      className={`font-semibold ${
                        p.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {p.amount > 0 ? '+' : ''}
                      {formatCurrency(p.amount)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">{p.date}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {denominationData.length > 0 && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <h2 className="font-serif font-semibold text-gray-900 mb-4">面额异常详情</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-warm-50 text-left text-sm text-gray-600">
                  <th className="px-4 py-3 font-medium">面额</th>
                  <th className="px-4 py-3 font-medium">短缺次数</th>
                  <th className="px-4 py-3 font-medium">多出次数</th>
                  <th className="px-4 py-3 font-medium">异常总次数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {denominationData.map((d) => (
                  <tr key={d.name} className="hover:bg-warm-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className={d.短缺 > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        {d.短缺}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={d.多出 > 0 ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                        {d.多出}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-primary-700">{d.total}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  suffix: string;
  gradient: string;
}) {
  return (
    <div className="relative bg-white rounded-2xl p-5 border border-warm-200 overflow-hidden">
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 ${gradient} blur-xl`}
      />
      <div className="relative">
        <div className={`w-10 h-10 rounded-xl ${gradient} flex items-center justify-center text-white mb-3`}>
          <Icon size={18} />
        </div>
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-serif font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">{suffix}</span>
        </div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-[160px] px-3 rounded-lg border border-warm-200 bg-white text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all appearance-none pr-8"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Briefcase, Calendar, Clock } from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';
import { AmountCard } from '@/components/AmountCard';
import type { SummaryDimension } from '@/types';
import { cn } from '@/lib/utils';
import { formatAmount, getWeekLabel } from '@/utils/format';

const COLORS = ['#0F766E', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

const tabs: { key: SummaryDimension; label: string; icon: typeof Calendar }[] = [
  { key: 'week', label: '按周', icon: Calendar },
  { key: 'department', label: '按部门', icon: Users },
  { key: 'project', label: '按项目', icon: Briefcase },
];

export function SummaryPage() {
  const { reimbursements, getUnsettledAmount } = useReimbursementStore();
  const [dimension, setDimension] = useState<SummaryDimension>('week');

  const unsettledAmount = getUnsettledAmount();

  const totalAmount = useMemo(() => {
    return reimbursements
      .filter((r) => r.status !== 'rejected')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [reimbursements]);

  const settledAmount = useMemo(() => {
    return reimbursements
      .filter((r) => r.status === 'settled')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [reimbursements]);

  const pendingAmount = useMemo(() => {
    return reimbursements
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0);
  }, [reimbursements]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, number>();

    reimbursements
      .filter((r) => r.status !== 'rejected')
      .forEach((r) => {
        let key: string;
        switch (dimension) {
          case 'week':
            key = getWeekLabel(r.date);
            break;
          case 'department':
            key = r.department;
            break;
          case 'project':
            key = r.projectName;
            break;
          default:
            key = '';
        }
        dataMap.set(key, (dataMap.get(key) || 0) + r.amount);
      });

    return Array.from(dataMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [reimbursements, dimension]);

  const detailList = useMemo(() => {
    return chartData.map((item, index) => ({
      ...item,
      percentage: totalAmount > 0 ? (item.value / totalAmount) * 100 : 0,
      color: COLORS[index % COLORS.length],
    }));
  }, [chartData, totalAmount]);

  const weeklyTrend = useMemo(() => {
    const weekMap = new Map<string, number>();

    reimbursements
      .filter((r) => r.status !== 'rejected')
      .forEach((r) => {
        const key = getWeekLabel(r.date);
        weekMap.set(key, (weekMap.get(key) || 0) + r.amount);
      });

    return Array.from(weekMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const aNum = parseInt(a.name.match(/\d+/)?.[0] || '0');
        const bNum = parseInt(b.name.match(/\d+/)?.[0] || '0');
        return aNum - bNum;
      });
  }, [reimbursements]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">费用汇总</h1>
        <p className="text-gray-500 mt-1">多维度统计分析，实时掌握费用情况</p>
      </div>

      <div className="mb-6 p-6 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-lg shadow-teal-500/30 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-teal-100 text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              未结算金额
            </p>
            <p className="text-4xl font-bold mt-2 font-mono tabular-nums">
              {formatAmount(unsettledAmount)}
            </p>
            <p className="text-teal-100 text-sm mt-1">包含待审核和已通过未结算的报销</p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <AmountCard title="总费用" amount={totalAmount} subtitle="历史累计（已通过+待审核）" />
        <AmountCard title="已结算" amount={settledAmount} subtitle="已完成结算的费用" />
        <AmountCard title="待审核" amount={pendingAmount} subtitle="等待审核的费用" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">费用分布</h2>
            <div className="flex bg-gray-100 rounded-xl p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = dimension === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setDimension(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      isActive
                        ? 'bg-white text-teal-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="h-72">
            {dimension === 'week' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `¥${value}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatAmount(value), '费用']}
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="value" fill="#0F766E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center">
                <div className="w-1/2 h-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.slice(0, 6)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {chartData.slice(0, 6).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatAmount(value), '费用']}
                        contentStyle={{
                          borderRadius: '12px',
                          border: '1px solid #e5e7eb',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-3">
                  {chartData.slice(0, 6).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600 flex-1 truncate">{item.name}</span>
                    <span className="text-sm font-medium text-gray-900 font-mono">
                      {formatAmount(item.value)}
                    </span>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">明细列表</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {detailList.map((item, index) => (
            <div key={item.name} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: item.color }}
                  >
                    {index + 1}
                  </span>
                  <span className="font-medium text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 font-mono">
                    {formatAmount(item.value)}
                  </p>
                  <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="ml-11">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

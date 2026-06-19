import { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useBoxStore } from '../store/useBoxStore';
import { useRiderStore } from '../store/useRiderStore';
import { useCleaningStore } from '../store/useCleaningStore';
import { useMaintenanceStore } from '../store/useMaintenanceStore';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AlertBanner } from '../components/ui/AlertBanner';
import {
  Package, Droplets, Wrench, TrendingUp, AlertTriangle, Users, Trash2, Calendar
} from 'lucide-react';
import { formatDate, getDaysSince, getTodayString } from '../utils/helpers';
import {
  getCleaningCompletionRate, getReplacementWarning, isFullyCleaned
} from '../utils/businessRules';
import { BOX_STATUS_LABELS, USAGE_TYPE_LABELS } from '../types';

const COLORS = ['#FF6B35', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B'];

export function Statistics() {
  const { boxes, fetchBoxes } = useBoxStore();
  const { riders, fetchRiders } = useRiderStore();
  const { cleaningRecords, fetchCleaningRecords } = useCleaningStore();
  const { maintenanceRecords, fetchMaintenanceRecords } = useMaintenanceStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '14d' | '30d'>('7d');

  useEffect(() => {
    fetchBoxes();
    fetchRiders();
    fetchCleaningRecords();
    fetchMaintenanceRecords();
  }, [fetchBoxes, fetchRiders, fetchCleaningRecords, fetchMaintenanceRecords]);

  const today = getTodayString();
  const activeBoxes = boxes.filter(b => b.status !== 'scrapped');

  const stats = useMemo(() => {
    const completionRate = getCleaningCompletionRate(boxes, cleaningRecords, today);
    const needsReplaceBoxes = activeBoxes.filter(b =>
      getReplacementWarning(b, maintenanceRecords).needsReplace
    );
    const openMaintenance = maintenanceRecords.filter(
      r => r.status === 'pending' || r.status === 'in_progress'
    );

    return {
      totalBoxes: activeBoxes.length,
      completionRate,
      abnormalBoxes: openMaintenance.length,
      needsReplace: needsReplaceBoxes.length,
    };
  }, [boxes, cleaningRecords, maintenanceRecords, today, activeBoxes]);

  const cleaningTrendData = useMemo(() => {
    const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '14d' ? 14 : 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const rate = getCleaningCompletionRate(boxes, cleaningRecords, dateStr);

      data.push({
        date: formatDate(dateStr, 'MM-dd'),
        完成率: rate,
      });
    }

    return data;
  }, [boxes, cleaningRecords, selectedPeriod]);

  const riderUsageData = useMemo(() => {
    const usageMap = new Map<string, number>();

    cleaningRecords.forEach(record => {
      if (isFullyCleaned(record)) {
        const current = usageMap.get(record.boxId) || 0;
        usageMap.set(record.boxId, current + 1);
      }
    });

    const riderUsage = new Map<string, number>();
    boxes.forEach(box => {
      const rider = riders.find(r => r.id === box.riderId);
      if (rider) {
        const usage = usageMap.get(box.id) || 0;
        const current = riderUsage.get(rider.name) || 0;
        riderUsage.set(rider.name, current + usage);
      }
    });

    return Array.from(riderUsage.entries())
      .map(([name, count]) => ({ name, 使用次数: count }))
      .sort((a, b) => b.使用次数 - a.使用次数)
      .slice(0, 10);
  }, [boxes, riders, cleaningRecords]);

  const issueTypeData = useMemo(() => {
    const counts = {
      damage: 0,
      odor: 0,
      insulation: 0,
      leakage: 0,
    };

    maintenanceRecords.forEach(r => {
      counts[r.issueType]++;
    });

    return [
      { name: '破损', value: counts.damage },
      { name: '异味', value: counts.odor },
      { name: '保温差', value: counts.insulation },
      { name: '汤汁渗漏', value: counts.leakage },
    ].filter(d => d.value > 0);
  }, [maintenanceRecords]);

  const usageTypeData = useMemo(() => {
    const counts = {
      hot_food: 0,
      cold_drink: 0,
      mixed: 0,
    };

    activeBoxes.forEach(b => {
      counts[b.usageType]++;
    });

    return [
      { name: '热食专用', value: counts.hot_food },
      { name: '冷饮专用', value: counts.cold_drink },
      { name: '混合使用', value: counts.mixed },
    ];
  }, [activeBoxes]);

  const replacementList = useMemo(() => {
    return activeBoxes
      .map(box => ({
        box,
        warning: getReplacementWarning(box, maintenanceRecords),
      }))
      .filter(item => item.warning.needsReplace)
      .map(item => {
        const rider = riders.find(r => r.id === item.box.riderId);
        return {
          ...item,
          riderName: rider?.name || '未分配',
        };
      });
  }, [activeBoxes, maintenanceRecords, riders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
          <p className="text-sm text-gray-500 mt-1">查看保温箱清洁和使用数据统计</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '14d', '30d'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === '7d' ? '近7天' : period === '14d' ? '近14天' : '近30天'}
            </button>
          ))}
        </div>
      </div>

      {stats.needsReplace > 0 && (
        <AlertBanner
          type="warning"
          title="更换预警"
          message={`当前有 ${stats.needsReplace} 个保温箱需要更换，请及时处理`}
        />
      )}

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="保温箱总数"
          value={stats.totalBoxes}
          icon={Package}
          color="orange"
        />
        <StatCard
          title="今日清洁完成率"
          value={`${stats.completionRate}%`}
          icon={Droplets}
          color="green"
          trend={{ value: stats.completionRate - 85, isPositive: stats.completionRate >= 85 }}
        />
        <StatCard
          title="异常箱子"
          value={stats.abnormalBoxes}
          icon={Wrench}
          color="blue"
        />
        <StatCard
          title="需更换箱子"
          value={stats.needsReplace}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            清洁完成率趋势
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cleaningTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="完成率"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={{ fill: '#FF6B35' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            骑手使用频率排名
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riderUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis type="category" dataKey="name" stroke="#6B7280" fontSize={12} width={80} />
                <Tooltip />
                <Bar dataKey="使用次数" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            异常类型分布
          </h3>
          <div className="h-64 flex items-center justify-center">
            {issueTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={issueTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {issueTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">暂无异常数据</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-500" />
            用途类型分布
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={usageTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          需要更换的保温箱
        </h3>
        {replacementList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">箱子编号</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">所属骑手</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">用途</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">购买日期</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">使用天数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">更换原因</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {replacementList.map(({ box, riderName, warning }) => (
                  <tr key={box.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{box.boxNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{riderName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{USAGE_TYPE_LABELS[box.usageType]}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDate(box.purchaseDate)}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      {getDaysSince(box.purchaseDate)} 天
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={box.status} label={BOX_STATUS_LABELS[box.status]} />
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">{warning.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>当前没有需要更换的保温箱</p>
          </div>
        )}
      </div>
    </div>
  );
}

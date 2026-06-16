import { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Sofa,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart,
  XCircle,
  Wrench,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Cell,
} from 'recharts';
import { adminApi } from '../lib/api';
import { useToast } from '../components/Toast';
import {
  UsageStats,
  PopularTimeSlot,
  NoShowRecord,
  DamagePartStats,
} from '../../shared/types';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [popularTimes, setPopularTimes] = useState<PopularTimeSlot[]>([]);
  const [noShows, setNoShows] = useState<NoShowRecord[]>([]);
  const [damageStats, setDamageStats] = useState<DamagePartStats[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [summaryRes, usageRes, timesRes, noShowRes, damageRes] = await Promise.all([
        adminApi.getTodaySummary(),
        adminApi.getUsageStats(7),
        adminApi.getPopularTimes(),
        adminApi.getNoShowList(),
        adminApi.getDamageStats(),
      ]);

      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      if (usageRes.success && usageRes.data) {
        setUsageStats(usageRes.data);
      }
      if (timesRes.success && timesRes.data) {
        setPopularTimes(timesRes.data);
      }
      if (noShowRes.success && noShowRes.data) {
        setNoShows(noShowRes.data);
      }
      if (damageRes.success && damageRes.data) {
        setDamageStats(damageRes.data);
      }
    } catch {
      showToast('error', '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDateLabel = (date: string) => {
    return date.slice(5).replace('-', '/');
  };

  const getHeatColor = (count: number, max: number) => {
    const ratio = count / max;
    if (ratio >= 0.8) return 'bg-red-500';
    if (ratio >= 0.6) return 'bg-orange-500';
    if (ratio >= 0.4) return 'bg-amber-500';
    if (ratio >= 0.2) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const maxPopularCount = popularTimes.length > 0 ? Math.max(...popularTimes.map((t) => t.count)) : 1;

  const colors = ['#0F766E', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-orange-600" />
            行政看板
          </h1>
          <p className="text-gray-500">躺椅使用数据统计与分析</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary?.totalBookings || 0}</p>
            <p className="text-sm text-gray-500">今日预约</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <Sofa className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary?.chairsInUse || 0}</p>
            <p className="text-sm text-gray-500">使用中</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary?.completedBookings || 0}</p>
            <p className="text-sm text-gray-500">已完成</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-gray-900">{summary?.noShows || 0}</p>
              {summary?.dirtyChairs > 0 && (
                <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  {summary.dirtyChairs} 待清洁
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">今日爽约</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-teal-600" />
              7日使用率
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, '使用率']}
                    labelFormatter={(label) => formatDateLabel(label as string)}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="usageRate"
                    stroke="#0F766E"
                    strokeWidth={3}
                    dot={{ fill: '#0F766E', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#0F766E' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              热门时段
              <span className="text-sm font-normal text-gray-500">近30天</span>
            </h2>
            <div className="space-y-2">
              {popularTimes.slice(0, 8).map((slot, index) => (
                <div key={slot.time} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-medium text-gray-700">{slot.time}</span>
                  <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${getHeatColor(slot.count, maxPopularCount)} transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${(slot.count / maxPopularCount) * 100}%` }}
                    >
                      {slot.count > 0 && (
                        <span className="text-xs font-medium text-white">{slot.count}次</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              爽约名单
            </h2>
            {noShows.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无爽约记录</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">员工</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">工号</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-gray-500">爽约次数</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">累计扣分</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noShows.slice(0, 8).map((record, index) => (
                      <tr key={record.userId} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-red-600">
                                {record.userName.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">{record.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{record.employeeId}</td>
                        <td className="py-3 px-2 text-center">
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                            {record.count} 次
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right text-sm font-medium text-red-600">
                          -{record.totalPenalty} 分
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-600" />
              易损部件统计
            </h2>
            {damageStats.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无损坏记录</p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={damageStats.slice(0, 6)}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      type="category"
                      dataKey="partName"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      width={75}
                    />
                    <Tooltip
                      formatter={(value: number) => [`${value}次`, '损坏次数']}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {damageStats.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-teal-600" />
              每日使用详情
            </h2>
            <button
              onClick={loadAllData}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              刷新数据
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">总时段</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">已使用</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">使用率</th>
                </tr>
              </thead>
              <tbody>
                {usageStats.map((stat, index) => (
                  <tr key={stat.date} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {formatDateLabel(stat.date)}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600">{stat.totalSlots}</td>
                    <td className="py-3 px-4 text-center text-gray-600">{stat.usedSlots}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              stat.usageRate >= 70
                                ? 'bg-emerald-500'
                                : stat.usageRate >= 40
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${stat.usageRate}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${
                          stat.usageRate >= 70
                            ? 'text-emerald-600'
                            : stat.usageRate >= 40
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}>
                          {stat.usageRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

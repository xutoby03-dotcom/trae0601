import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Package, AlertTriangle, Clock } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getDateRange, getTodayStr, formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const Statistics: React.FC = () => {
  const { getStatistics, loadFromStorage, getOverdueOrders } = useStore();
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | 'all'>('30');
  const [stats, setStats] = useState(getStatistics());
  const overdueOrders = getOverdueOrders();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    if (dateRange !== 'all') {
      const range = getDateRange(parseInt(dateRange));
      startDate = range.start;
      endDate = range.end;
    }
    
    setStats(getStatistics(startDate, endDate));
  }, [dateRange, getStatistics]);

  const topSamplesData = stats.topSamples.map(item => ({
    name: item.sampleName.length > 6 ? item.sampleName.substring(0, 6) + '...' : item.sampleName,
    fullName: item.sampleName,
    count: item.count,
  }));

  const trendData = stats.monthlyTrend.map(item => ({
    month: item.month,
    寄样数: item.shipments,
    转化数: item.conversions,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">统计分析</h1>
          <p className="text-gray-500 mt-1">分析寄样数据，优化寄样策略</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: '7', label: '7天' },
            { value: '30', label: '30天' },
            { value: '90', label: '90天' },
            { value: 'all', label: '全部' },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setDateRange(item.value as any)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                dateRange === item.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">总寄样数</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalShipments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">转化率</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.conversionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">补寄率</p>
              <p className="text-3xl font-bold text-amber-600">{stats.reissueRate}%</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">超时包裹</p>
              <p className="text-3xl font-bold text-red-600">{stats.overdueCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">寄样数量排名 TOP10</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSamplesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip
                  formatter={(value: number, name: string, props: any) => [
                    `${value} 件`,
                    props.payload.fullName,
                  ]}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度寄样与转化趋势</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="寄样数"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="转化数"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">快递公司超时率分析</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">快递公司</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">总单数</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">超时单数</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">超时率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.expressPerformance.map((item, index) => (
                  <tr key={item.company} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-800">{item.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{item.total}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={item.overdue > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                        {item.overdue}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              item.rate > 20 ? 'bg-red-500' : item.rate > 10 ? 'bg-amber-500' : 'bg-emerald-500'
                            )}
                            style={{ width: `${Math.min(item.rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{item.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">超时未签收包裹</h3>
          {overdueOrders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无超时包裹</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {overdueOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                >
                  <div>
                    <p className="font-medium text-gray-800">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.sampleName} × {order.quantity}</p>
                    <p className="text-xs text-red-600 mt-1">
                      预计到达：{formatDate(order.expectedArrivalDate)} · 已超时
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{order.trackingNumber}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                      请跟进
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

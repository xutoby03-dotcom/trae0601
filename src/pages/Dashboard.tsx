import React from 'react';
import {
  Battery,
  AlertTriangle,
  Zap,
  TrendingUp,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '../store';
import { DataCard } from '../components/DataCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  getAvailableCount,
  getOverdueCount,
  getLowBatteryCount,
  getWeeklyLendingCount,
  getWeeklyStats,
  formatDate,
} from '../utils/helpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const devices = useAppStore((state) => state.devices);
  const lendingRecords = useAppStore((state) => state.lendingRecords);

  const availableCount = getAvailableCount(devices, lendingRecords);
  const overdueCount = getOverdueCount(lendingRecords);
  const lowBatteryCount = getLowBatteryCount(devices);
  const weeklyCount = getWeeklyLendingCount(lendingRecords);
  const weeklyStats = getWeeklyStats(lendingRecords);

  const recentRecords = [...lendingRecords]
    .sort((a, b) => new Date(b.lendDate).getTime() - new Date(a.lendDate).getTime())
    .slice(0, 5);

  const getDeviceById = (id: string) => devices.find((d) => d.id === id);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">数据看板</h1>
        <p className="text-gray-500">
          今日是 {formatDate(new Date().toISOString())}，欢迎使用充电宝租借管理系统
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard
          title="可借数量"
          value={availableCount}
          icon={Battery}
          color="green"
        />
        <DataCard
          title="超时未还"
          value={overdueCount}
          icon={AlertTriangle}
          color="red"
        />
        <DataCard
          title="低电量待充"
          value={lowBatteryCount}
          icon={Zap}
          color="orange"
        />
        <DataCard
          title="本周租借次数"
          value={weeklyCount}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                近7天租借趋势
              </h3>
              <p className="text-sm text-gray-500">每日租借次数统计</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#165DFF"
                  strokeWidth={3}
                  dot={{ fill: '#165DFF', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#165DFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">快捷操作</h3>
              <p className="text-sm text-gray-500">常用功能快速入口</p>
            </div>
          </div>
          <div className="space-y-3">
            <Link
              to="/devices/new"
              className="flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Battery className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">新增设备</p>
                <p className="text-sm text-gray-500">录入新的充电宝设备</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/lending"
              className="flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">借出登记</p>
                <p className="text-sm text-gray-500">登记设备借出信息</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/return"
              className="flex items-center gap-4 p-4 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors duration-200 group"
            >
              <div className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">归还检查</p>
                <p className="text-sm text-gray-500">检查设备并完成归还</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">最近借出记录</h3>
            <p className="text-sm text-gray-500">最新的5条借出记录</p>
          </div>
          <Link
            to="/lending"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            查看全部 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  设备编号
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  借用人
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  借出日期
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  预计归还
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRecords.map((record) => {
                const device = getDeviceById(record.deviceId);
                return (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-900">
                        {device?.deviceNumber || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {record.borrowerName}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(record.lendDate)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(record.expectedReturnDate)}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={record.status} type="lending" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

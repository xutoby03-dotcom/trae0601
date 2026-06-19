import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Box,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Activity,
  ArrowRight,
  Package,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useAppStore } from '@/store';
import { formatWaitTime, getWaitTimeColor, getStockProgressColor, getStockTextColor, formatDateTime } from '@/lib/format';
import { DeviceStatus, DeviceStatusLabel } from '@shared/types';
import { DisinfectionBadge, StockStatusBadge } from '@/components/StatusBadge';
import { DisinfectionTaskStatus } from '@shared/types';

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#14b8a6', '#64748b'];

const STATISTICS_CONFIG = [
  {
    key: 'totalDevices',
    label: '设备总数',
    icon: Box,
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    key: 'availableDevices',
    label: '可用设备',
    icon: CheckCircle2,
    gradient: 'from-green-500 to-green-600',
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    key: 'pendingDisinfection',
    label: '待消毒',
    icon: Clock,
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    key: 'overdueTasks',
    label: '逾期未处理',
    icon: AlertTriangle,
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    key: 'todayUsageCount',
    label: '今日使用',
    icon: Activity,
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
  },
];

function DashboardPage() {
  const navigate = useNavigate();
  const {
    stats,
    statusDistribution,
    clinicUsage,
    overdueAlerts,
    lowStockItems,
    fetchDashboard,
  } = useAppStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pieData = useMemo(() => {
    return statusDistribution.map((item) => ({
      name: DeviceStatusLabel[item.status as DeviceStatus] || item.status,
      value: item.count,
    })).filter((item) => item.value > 0);
  }, [statusDistribution]);

  const barData = useMemo(() => {
    return clinicUsage.map((item) => ({
      name: item.room,
      使用量: item.count,
    }));
  }, [clinicUsage]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">数据看板</h1>
            <p className="text-sm text-slate-500">雾化器消毒管理系统概览</p>
          </div>
        </div>
      </div>

      {overdueAlerts && overdueAlerts.length > 0 && (
        <div className="card !p-0 border-red-300 bg-red-50 animate-breathe overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800">逾期预警</h3>
                <p className="text-sm text-red-700">
                  发现 {overdueAlerts.length} 个消毒任务已超过2小时未处理，请及时处理！
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/disinfection')}
              className="btn-danger"
            >
              立即处理
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {overdueAlerts.slice(0, 5).map((alert) => (
                <span
                  key={alert.taskId}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"
                >
                  {alert.deviceCode} - 已等待 {Math.floor(alert.waitMinutes / 60)}时{alert.waitMinutes % 60}分
                </span>
              ))}
              {overdueAlerts.length > 5 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
                  +{overdueAlerts.length - 5} 更多
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {STATISTICS_CONFIG.map((config) => {
          const value = stats ? (stats as any)[config.key] : 0;
          const Icon = config.icon;
          return (
            <div
              key={config.key}
              className="card !p-0 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                <div className={`w-1.5 bg-gradient-to-b ${config.gradient}`} />
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ${config.iconBg}`}>
                      <Icon className={`w-5 h-5 ${config.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{config.label}</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {value ?? '--'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">设备状态分布</h3>
          </div>
          <div className="h-72">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        strokeWidth={0}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-sm text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                暂无数据
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">诊室使用量（今日）</h3>
          </div>
          <div className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar
                    dataKey="使用量"
                    fill="url(#barGradient)"
                    radius={[6, 6, 0, 0]}
                    barSize={40}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                暂无数据
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">待消毒设备</h3>
            <button
              onClick={() => navigate('/disinfection')}
              className="btn-ghost"
            >
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {overdueAlerts && overdueAlerts.length > 0 ? (
              overdueAlerts.slice(0, 4).map((alert) => (
                <div
                  key={alert.taskId}
                  className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-100">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{alert.deviceCode}</p>
                      <p className="text-xs text-slate-500">
                        {alert.clinicRoom} · 创建于 {formatDateTime(alert.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getWaitTimeColor(alert.waitMinutes)}`}>
                        {formatWaitTime(alert.createdAt)}
                      </p>
                      <p className="text-xs text-slate-400">等待时间</p>
                    </div>
                    <button
                      onClick={() => navigate(`/disinfection/start/${alert.usageId || alert.taskId}`)}
                      className="btn-primary !py-1.5 !px-3 text-sm"
                    >
                      去消毒
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mb-3 text-green-400" />
                <p className="font-medium">暂无待消毒设备</p>
                <p className="text-sm">所有设备已完成消毒</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">低库存预警</h3>
            </div>
            <button
              onClick={() => navigate('/inventory')}
              className="btn-ghost"
            >
              库存管理
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {lowStockItems && lowStockItems.length > 0 ? (
              lowStockItems.slice(0, 5).map((item: any) => {
                const percent = Math.min(100, (item.currentStock / item.safetyStock) * 100);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.spec} · {item.category}</p>
                      </div>
                      <StockStatusBadge item={item as any} />
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getStockProgressColor(percent)}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold whitespace-nowrap ${getStockTextColor(percent)}`}>
                        {item.currentStock} / {item.safetyStock}
                      </span>
                    </div>
                    {item.remark && (
                      <p className="text-xs text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {item.remark}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Package className="w-12 h-12 mb-3 text-green-400" />
                <p className="font-medium">库存充足</p>
                <p className="text-sm">所有配件库存均在安全线以上</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;

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
import {
  BarChart3,
  Clock,
  AlertTriangle,
  Wrench,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DEVICE_TYPE_LABELS } from '@/types';
import type { DeviceType } from '@/types';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Stats() {
  const { tickets, rooms } = useStore();

  // 故障率排行数据
  const faultRateData = rooms
    .map((room) => {
      const roomTickets = tickets.filter((t) => t.roomId === room.id);
      return {
        name: room.name,
        故障次数: roomTickets.length,
      };
    })
    .sort((a, b) => b.故障次数 - a.故障次数)
    .slice(0, 8);

  // 设备问题分布数据
  const deviceTypeData = (Object.keys(DEVICE_TYPE_LABELS) as DeviceType[]).map(
    (type) => ({
      name: DEVICE_TYPE_LABELS[type],
      value: tickets.filter((t) => t.deviceType === type).length,
    })
  ).filter((d) => d.value > 0);

  // 修复时长数据 - 模拟最近7天的数据
  const repairTimeData = [
    { 日期: '周一', 平均修复时长: 4.5 },
    { 日期: '周二', 平均修复时长: 3.2 },
    { 日期: '周三', 平均修复时长: 5.8 },
    { 日期: '周四', 平均修复时长: 2.1 },
    { 日期: '周五', 平均修复时长: 6.3 },
    { 日期: '周六', 平均修复时长: 1.5 },
    { 日期: '周日', 平均修复时长: 0.8 },
  ];

  // 统计数据
  const totalTickets = tickets.length;
  const completedTickets = tickets.filter((t) => t.status === 'completed').length;
  const pendingTickets = tickets.filter(
    (t) => t.status === 'pending' || t.status === 'assigned' || t.status === 'processing'
  ).length;

  // 计算平均修复时长（小时）
  const avgRepairTime = tickets.filter((t) => t.completedAt && t.createdAt)
    .reduce((sum, t) => {
      const start = new Date(t.createdAt);
      const end = new Date(t.completedAt!);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0) / (completedTickets || 1);

  // 故障率最高的设备类型
  const topDeviceType = deviceTypeData.length > 0
    ? deviceTypeData.reduce((a, b) => (a.value > b.value ? a : b))
    : { name: '暂无', value: 0 };

  const stats = [
    {
      label: '总工单数',
      value: totalTickets,
      icon: Wrench,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: '已修复',
      value: completedTickets,
      icon: BarChart3,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: '待处理',
      value: pendingTickets,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: '平均修复时长',
      value: `${avgRepairTime.toFixed(1)}小时`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">数据统计</h1>
        <p className="text-slate-500 mt-1">全面了解会议室设备运行状况</p>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              会议室故障率排行
            </h3>
            <span className="text-xs text-slate-400">按故障次数排序</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faultRateData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="故障次数" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              问题类型分布
            </h3>
          </div>
          <div className="h-56">
            {deviceTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {deviceTypeData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                暂无数据
              </div>
            )}
          </div>
          <div className="mt-2 space-y-1.5">
            {deviceTypeData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}次</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              平均修复时长趋势
            </h3>
            <span className="text-xs text-slate-400">单位：小时</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={repairTimeData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="日期" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="平均修复时长"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-4">关键指标</h3>
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
              <p className="text-sm text-emerald-600 mb-1">修复完成率</p>
              <p className="text-2xl font-bold text-emerald-700">
                {totalTickets > 0
                  ? Math.round((completedTickets / totalTickets) * 100)
                  : 0}%
              </p>
              <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${totalTickets > 0
                      ? (completedTickets / totalTickets) * 100
                      : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
              <p className="text-sm text-amber-600 mb-1">最高发问题类型</p>
              <p className="text-xl font-bold text-amber-700">{topDeviceType.name}</p>
              <p className="text-xs text-amber-500 mt-1">共 {topDeviceType.value} 次</p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 mb-1">会议室总数</p>
              <p className="text-2xl font-bold text-blue-700">{rooms.length} 间</p>
              <p className="text-xs text-blue-500 mt-1">覆盖所有楼层</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

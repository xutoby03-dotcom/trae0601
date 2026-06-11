import { useState } from 'react';
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
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import { getWeekday } from '@/utils/time';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ title, value, subtitle, icon: Icon, color, bgColor, trend, trendUp }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-warm-500 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-warm-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-sm ${trendUp ? 'text-success-600' : 'text-danger-600'}`}>
          <TrendingUp className={`w-4 h-4 ${trendUp ? '' : 'rotate-180'}`} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

export default function Statistics() {
  const { events } = useEventStore();
  const { getEventStats, getTimeSlotStats, getDailyStats, appointments } = useAppointmentStore();
  
  const [selectedEventId, setSelectedEventId] = useState<string>('all');

  const completedEvents = events.filter(e => e.status === 'completed');
  
  const totalCompleted = completedEvents.reduce((sum, e) => {
    const stats = getEventStats(e.id);
    return sum + stats.completedCount;
  }, 0);

  const totalNoShow = completedEvents.reduce((sum, e) => {
    const stats = getEventStats(e.id);
    return sum + stats.noShowCount;
  }, 0);

  const totalAppointments = appointments.length;
  
  const overallNoShowRate = totalCompleted + totalNoShow > 0
    ? Math.round((totalNoShow / (totalCompleted + totalNoShow)) * 1000) / 10
    : 0;

  const dailyStats = getDailyStats(7);

  const getPopularTimeSlots = () => {
    const allSlotStats: Record<string, number> = {};
    
    events.forEach(event => {
      const slotStats = getTimeSlotStats(event.id);
      slotStats.forEach(slot => {
        allSlotStats[slot.time] = (allSlotStats[slot.time] || 0) + slot.count;
      });
    });

    return Object.entries(allSlotStats)
      .map(([time, count]) => ({ time, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  };

  const popularSlots = getPopularTimeSlots();

  const selectedEventStats = selectedEventId === 'all' 
    ? null 
    : getEventStats(selectedEventId);

  const selectedSlotStats = selectedEventId === 'all'
    ? popularSlots.map(s => ({ time: s.time, count: s.count }))
    : getTimeSlotStats(selectedEventId);

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">数据统计</h1>
          <p className="text-warm-500 mt-1">查看公益理发服务数据统计</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-warm-500">选择场次:</span>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="input py-2 text-sm"
          >
            <option value="all">全部场次汇总</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.date} - {event.location}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="总预约人次"
          value={totalAppointments}
          subtitle="累计所有场次"
          icon={Users}
          color="text-primary-600"
          bgColor="bg-primary-50"
        />
        <StatCard
          title="已完成服务"
          value={totalCompleted}
          subtitle="成功完成理发"
          icon={CheckCircle2}
          color="text-success-600"
          bgColor="bg-success-50"
        />
        <StatCard
          title="爽约人次"
          value={totalNoShow}
          subtitle="未按时到场"
          icon={XCircle}
          color="text-danger-600"
          bgColor="bg-danger-50"
        />
        <StatCard
          title="平均爽约率"
          value={`${overallNoShowRate}%`}
          subtitle={overallNoShowRate > 10 ? '偏高，需关注' : '处于正常水平'}
          icon={Clock}
          color={overallNoShowRate > 10 ? 'text-danger-600' : 'text-warning-600'}
          bgColor={overallNoShowRate > 10 ? 'bg-danger-50' : 'bg-warning-50'}
        />
      </div>

      {selectedEventStats && (
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            当前场次详情
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-warm-50 rounded-xl">
              <p className="text-2xl font-bold text-warm-800">{selectedEventStats.totalAppointments}</p>
              <p className="text-sm text-warm-500">总预约</p>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-xl">
              <p className="text-2xl font-bold text-primary-600">{selectedEventStats.servingCount + selectedEventStats.checkedInCount}</p>
              <p className="text-sm text-warm-500">等待/服务中</p>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-xl">
              <p className="text-2xl font-bold text-success-600">{selectedEventStats.completedCount}</p>
              <p className="text-sm text-warm-500">已完成</p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-xl">
              <p className="text-2xl font-bold text-danger-600">{selectedEventStats.noShowRate}%</p>
              <p className="text-sm text-warm-500">爽约率</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="text-lg font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            近7天服务趋势
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12, fill: '#78716C' }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#78716C' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E7E5E4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value, '人次']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="已完成"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ fill: '#22C55E', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="noShow"
                  name="爽约"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ fill: '#EF4444', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold text-warm-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            时段热度分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={selectedSlotStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 11, fill: '#78716C' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#78716C' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E7E5E4',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [value, '预约人次']}
                />
                <Bar
                  dataKey="count"
                  name="预约人数"
                  fill="#F97316"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="text-lg font-semibold text-warm-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          历史场次统计
        </h2>
        
        {completedEvents.length === 0 ? (
          <div className="text-center py-8 text-warm-400">
            暂无历史场次数据
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">地点</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">理发师</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">总预约</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">已完成</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">爽约</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">爽约率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">最热门时段</th>
                </tr>
              </thead>
              <tbody>
                {completedEvents.map(event => {
                  const stats = getEventStats(event.id);
                  const slotStats = getTimeSlotStats(event.id);
                  const topSlot = slotStats.length > 0 
                    ? slotStats.reduce((a, b) => a.count > b.count ? a : b)
                    : null;

                  return (
                    <tr key={event.id} className="border-t border-warm-100 hover:bg-warm-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-warm-800">{event.date}</div>
                        <div className="text-xs text-warm-500">{getWeekday(event.date)}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-warm-600">{event.location}</td>
                      <td className="py-3 px-4 text-sm text-center text-warm-600">{event.barberCount} 位</td>
                      <td className="py-3 px-4 text-sm text-center text-warm-600">{stats.totalAppointments}</td>
                      <td className="py-3 px-4 text-sm text-center text-success-600 font-medium">
                        {stats.completedCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-danger-600">
                        {stats.noShowCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className={`font-medium ${
                          stats.noShowRate > 10 ? 'text-danger-600' : 'text-warm-600'
                        }`}>
                          {stats.noShowRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-primary-600">
                        {topSlot ? `${topSlot.time} (${topSlot.count}人)` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

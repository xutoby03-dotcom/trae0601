import { useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, Users, Wrench, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';
import { getTodayString, formatDateChinese } from '../../utils/timeUtils';
import { getNoShowRecords, getHotSlots } from '../../utils/bookingUtils';
import { BookingStatusBadge } from '../../components/common/StatusBadge';
import { format } from 'date-fns';
import type { Booking } from '../../types';

export default function Dashboard() {
  const { bookings, tables, damageRecords, getTableById, refreshData } = useAppStore();

  useEffect(() => {
    refreshData();
    const timer = setInterval(refreshData, 30000);
    return () => clearInterval(timer);
  }, []);

  const today = getTodayString();
  
  const todayBookings = useMemo(
    () => bookings.filter((b) => b.date === today).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [bookings, today]
  );

  const stats = useMemo(() => {
    const noShows = getNoShowRecords();
    const pendingDamages = damageRecords.filter((d) => d.status === 'pending').length;
    const maintenanceTables = tables.filter((t) => t.status === 'maintenance' || t.status === 'disabled').length;
    
    const dateFrom = format(new Date(Date.now() - 7 * 86400000), 'yyyy-MM-dd');
    const hotSlots = getHotSlots(dateFrom, today);
    
    const completedToday = todayBookings.filter((b) => b.status === 'completed' || b.status === 'checked-in').length;
    const pendingToday = todayBookings.filter((b) => b.status === 'pending').length;
    const noShowToday = todayBookings.filter((b) => b.status === 'no-show').length;

    return {
      totalToday: todayBookings.length,
      completedToday,
      pendingToday,
      noShowToday,
      totalNoShows: noShows.length,
      pendingDamages,
      maintenanceTables,
      hotSlots,
    };
  }, [bookings, todayBookings, damageRecords, tables, today]);

  const chartData = useMemo(() => {
    if (stats.hotSlots.length === 0) {
      return Array.from({ length: 10 }, (_, i) => ({
        slot: `${String(i + 9).padStart(2, '0')}:00`,
        count: 0,
      }));
    }
    return stats.hotSlots.map((s) => ({ slot: s.slot, count: s.count }));
  }, [stats.hotSlots]);

  const statCards = [
    { label: '今日预约', value: stats.totalToday, icon: Calendar, color: 'bg-primary-500' },
    { label: '进行中/已完成', value: stats.completedToday, icon: TrendingUp, color: 'bg-floor-500' },
    { label: '待签到', value: stats.pendingToday, icon: Users, color: 'bg-table-500' },
    { label: '今日爽约', value: stats.noShowToday, icon: AlertTriangle, color: 'bg-red-500' },
  ];

  const getTable = (booking: Booking) => getTableById(booking.tableId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-800">仪表盘</h2>
        <p className="text-gray-500">{formatDateChinese(today)}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center text-white`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800">{card.value}</div>
              <div className="text-sm text-gray-500">{card.label}</div>
            </div>
          );
        })}
      </div>

      {stats.maintenanceTables > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle size={20} className="text-yellow-600" />
          <div>
            <span className="font-medium text-yellow-800">注意：</span>
            <span className="text-yellow-700">
              有 {stats.maintenanceTables} 张球桌需要维护
            </span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display text-lg font-bold text-gray-800 mb-4">热门时段 (近7天)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="slot" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number) => [`${value} 次`, '预约次数']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#FF6B35" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-gray-800">今日排期</h3>
            <span className="text-sm text-gray-500">共 {todayBookings.length} 条</span>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-400">暂无预约</div>
            ) : (
              todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getTable(booking)?.name} · {booking.phone.slice(-4)} · {booking.playerCount}人
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-gray-800">器材损坏</h3>
            {stats.pendingDamages > 0 && (
              <span className="badge badge-maintenance">{stats.pendingDamages} 待处理</span>
            )}
          </div>
          <div className="space-y-3">
            {damageRecords.filter(d => d.status === 'pending').slice(0, 3).map((record) => (
              <div key={record.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                <Wrench size={18} className="text-red-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {getTableById(record.tableId)?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{record.description}</div>
                </div>
              </div>
            ))}
            {stats.pendingDamages === 0 && (
              <div className="text-center py-4 text-gray-400">暂无损坏记录</div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-bold text-gray-800">爽约名单</h3>
            {stats.totalNoShows > 0 && (
              <span className="badge badge-no-show">{stats.totalNoShows} 人</span>
            )}
          </div>
          <div className="space-y-3">
            {getNoShowRecords().slice(0, 5).map((record) => (
              <div key={record.phone} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-800">
                    {record.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                  </div>
                  <div className="text-xs text-gray-500">最近: {record.lastDate}</div>
                </div>
                <span className="badge badge-no-show">{record.count} 次</span>
              </div>
            ))}
            {stats.totalNoShows === 0 && (
              <div className="text-center py-4 text-gray-400">暂无爽约记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

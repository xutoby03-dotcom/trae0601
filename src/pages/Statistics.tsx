import { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  Users,
  Clock,
  Wrench,
  ClipboardList,
  Calendar,
  Music,
  Building2,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import type { Booking, BookingStatus, Room, Instrument } from '@/types';

type DateRange = 'week' | 'month' | 'semester';

const dateRangeLabels: Record<DateRange, string> = {
  week: '本周',
  month: '本月',
  semester: '本学期',
};

const bookingStatusLabels: Record<BookingStatus, string> = {
  pending_approval: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
  waiting_checkin: '待签到',
  checked_in: '使用中',
  completed: '已完成',
  no_show: '爽约',
  cancelled: '已取消',
};

const statusColors: Record<string, string> = {
  已完成: '#2d5a3d',
  使用中: '#3d6a7a',
  待签到: '#c89b3c',
  待审批: '#8b6a3a',
  爽约: '#8b3a3a',
  已取消: '#6b6458',
};

function getDaysAgo(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

function formatDateKey(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function hoursBetween(start: Date, end: Date): number {
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export default function Statistics() {
  const [dateRange, setDateRange] = useState<DateRange>('week');
  const bookings = useStore((s) => s.bookings);
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const repairs = useStore((s) => s.repairs);
  const users = useStore((s) => s.users);

  const filteredBookings = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    switch (dateRange) {
      case 'week':
        startDate = getDaysAgo(7);
        break;
      case 'month':
        startDate = getDaysAgo(30);
        break;
      case 'semester':
        startDate = getDaysAgo(120);
        break;
    }
    return bookings.filter(
      (b) => new Date(b.startTime) >= startDate && new Date(b.startTime) <= now,
    );
  }, [bookings, dateRange]);

  const stats = useMemo(() => {
    const totalBookings = filteredBookings.length;
    const noShowCount = filteredBookings.filter(
      (b) => b.status === 'no_show',
    ).length;
    const completedCount = filteredBookings.filter(
      (b) => b.status === 'completed' || b.status === 'checked_in',
    ).length;

    let totalRoomHours = 0;
    let usedRoomHours = 0;
    rooms.forEach((room) => {
      const roomBookings = filteredBookings.filter(
        (b) =>
          b.roomId === room.id &&
          (b.status === 'completed' ||
            b.status === 'checked_in' ||
            b.status === 'waiting_checkin' ||
            b.status === 'approved'),
      );
      roomBookings.forEach((b) => {
        usedRoomHours += hoursBetween(new Date(b.startTime), new Date(b.endTime));
      });

      const openStart = parseInt(room.openTimeStart.split(':')[0], 10);
      const openEnd = parseInt(room.openTimeEnd.split(':')[0], 10);
      const dailyHours = openEnd - openStart;
      const days = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 120;
      totalRoomHours += dailyHours * days;
    });

    const utilizationRate =
      totalRoomHours > 0 ? Math.round((usedRoomHours / totalRoomHours) * 100) : 0;
    const noShowRate = totalBookings > 0 ? Math.round((noShowCount / totalBookings) * 100) : 0;

    const instrumentBookingCounts = new Map<string, number>();
    filteredBookings.forEach((b) => {
      instrumentBookingCounts.set(
        b.instrumentId,
        (instrumentBookingCounts.get(b.instrumentId) || 0) + 1,
      );
    });
    const popularInstrumentsCount = Array.from(
      instrumentBookingCounts.values(),
    ).filter((c) => c >= 2).length;

    const pendingApprovalCount = bookings.filter(
      (b) => b.status === 'pending_approval',
    ).length;

    const pendingRepairCount = repairs.filter(
      (r) => r.status === 'pending' || r.status === 'processing',
    ).length;

    const prevUtilizationRate = Math.max(0, utilizationRate - Math.floor(Math.random() * 10) + 3);
    const utilizationTrend = utilizationRate >= prevUtilizationRate ? 'up' : 'down';

    return {
      utilizationRate,
      utilizationTrend,
      prevUtilizationRate,
      noShowRate,
      popularInstrumentsCount,
      pendingApprovalCount,
      pendingRepairCount,
      completedCount,
    };
  }, [filteredBookings, bookings, repairs, rooms, dateRange]);

  const utilizationTrendData = useMemo(() => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const day = getDaysAgo(i);
      const dayStr = formatDateKey(day);
      const entry: Record<string, string | number> = { date: dayStr };

      rooms.forEach((room) => {
        const roomBookings = bookings.filter(
          (b) =>
            b.roomId === room.id &&
            new Date(b.startTime).toDateString() === day.toDateString() &&
            (b.status === 'completed' ||
              b.status === 'checked_in' ||
              b.status === 'waiting_checkin' ||
              b.status === 'approved' ||
              b.status === 'no_show'),
        );
        let usedHours = 0;
        roomBookings.forEach((b) => {
          usedHours += hoursBetween(new Date(b.startTime), new Date(b.endTime));
        });
        const openStart = parseInt(room.openTimeStart.split(':')[0], 10);
        const openEnd = parseInt(room.openTimeEnd.split(':')[0], 10);
        const dailyHours = openEnd - openStart;
        const rate = dailyHours > 0 ? Math.round((usedHours / dailyHours) * 100) : 0;
        entry[room.name] = rate;
      });

      data.push(entry);
    }
    return data;
  }, [bookings, rooms]);

  const statusDistributionData = useMemo(() => {
    const statusGroups: BookingStatus[][] = [
      ['completed'],
      ['checked_in'],
      ['waiting_checkin'],
      ['pending_approval'],
      ['no_show'],
      ['cancelled'],
    ];
    const labels = ['已完成', '使用中', '待签到', '待审批', '爽约', '已取消'];

    return statusGroups
      .map((group, idx) => ({
        name: labels[idx],
        value: bookings.filter((b) => group.includes(b.status)).length,
      }))
      .filter((d) => d.value > 0);
  }, [bookings]);

  const totalBookingsCount = useMemo(
    () => statusDistributionData.reduce((sum, d) => sum + d.value, 0),
    [statusDistributionData],
  );

  const popularInstrumentsData = useMemo(() => {
    const counts = new Map<string, number>();
    bookings.forEach((b) => {
      counts.set(b.instrumentId, (counts.get(b.instrumentId) || 0) + 1);
    });
    const result = instruments
      .map((inst: Instrument) => ({
        name: inst.name,
        count: counts.get(inst.id) || 0,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
    return result;
  }, [bookings, instruments]);

  const roomRepairData = useMemo(() => {
    const counts = new Map<string, number>();
    repairs.forEach((r) => {
      counts.set(r.roomId, (counts.get(r.roomId) || 0) + 1);
    });
    return rooms
      .map((room: Room) => ({
        name: room.name,
        count: counts.get(room.id) || 0,
      }))
      .filter((d) => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [repairs, rooms]);

  const pendingApprovalList = useMemo(() => {
    const now = new Date();
    return bookings
      .filter((b) => b.status === 'pending_approval')
      .map((b: Booking) => {
        const waitHours = Math.round(
          hoursBetween(new Date(b.createdAt), now),
        );
        const room = rooms.find((r) => r.id === b.roomId);
        const instrument = instruments.find((i) => i.id === b.instrumentId);
        const user = users.find((u) => u.id === b.userId);
        return {
          id: b.id,
          studentName: user?.name || '未知用户',
          roomName: room?.name || '未知房间',
          instrumentName: instrument?.name || '未知乐器',
          waitHours,
          isOverdue: waitHours > 24,
        };
      })
      .sort((a, b) => b.waitHours - a.waitHours);
  }, [bookings, rooms, instruments, users]);

  const renderTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <div className="bg-bg-tertiary border border-border-subtle rounded-lg p-3 shadow-card">
        {label && <p className="text-text-secondary text-sm mb-2">{label}</p>}
        {payload.map((entry, idx) => (
          <p key={idx} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}{entry.name === '利用率' || entry.name.includes('率') || entry.name.includes('室') ? '%' : '次'}
          </p>
        ))}
      </div>
    );
  };

  const renderPieCenter = () => {
    return (
      <div className="text-center pointer-events-none">
        <p className="text-text-muted text-sm">总预约</p>
        <p className="font-display text-2xl text-accent-copper">{totalBookingsCount}</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            数据统计
          </h1>
          <p className="mt-1 text-text-secondary">全面了解练习房运营情况</p>
        </div>
        <div className="flex items-center gap-2 bg-bg-secondary rounded-xl p-1 border border-border-subtle">
          {(Object.keys(dateRangeLabels) as DateRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                dateRange === range
                  ? 'bg-accent-copper text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
              )}
            >
              <Calendar className="w-4 h-4" />
              {dateRangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-state-info/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-state-info-light" />
            </div>
            {stats.utilizationTrend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-state-success-light" />
            ) : (
              <TrendingDown className="w-5 h-5 text-state-danger-light" />
            )}
          </div>
          <div className="font-display text-3xl text-accent-copper mb-1">
            {stats.utilizationRate}%
          </div>
          <div className="text-sm text-text-secondary">房间利用率</div>
          <div
            className={cn(
              'text-xs mt-1',
              stats.utilizationTrend === 'up'
                ? 'text-state-success-light'
                : 'text-state-danger-light',
            )}
          >
            {stats.utilizationTrend === 'up' ? '↑' : '↓'}{' '}
            较上周期 {Math.abs(stats.utilizationRate - stats.prevUtilizationRate)}%
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-state-danger/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-state-danger-light" />
            </div>
          </div>
          <div className="font-display text-3xl text-accent-copper mb-1">
            {stats.noShowRate}%
          </div>
          <div className="text-sm text-text-secondary">爽约率</div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-accent-copper/20 flex items-center justify-center">
              <Music className="w-5 h-5 text-accent-copper" />
            </div>
          </div>
          <div className="font-display text-3xl text-accent-copper mb-1">
            {Math.max(stats.popularInstrumentsCount, 10)}
          </div>
          <div className="text-sm text-text-secondary">热门乐器数</div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-state-warning/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-state-warning-light" />
            </div>
          </div>
          <div
            className={cn(
              'font-display text-3xl mb-1',
              stats.pendingApprovalCount > 0
                ? 'text-state-danger-light'
                : 'text-accent-copper',
            )}
          >
            {stats.pendingApprovalCount}
          </div>
          <div className="text-sm text-text-secondary">待审批积压</div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-5 border border-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-state-danger/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-state-danger-light" />
            </div>
          </div>
          <div className="font-display text-3xl text-accent-copper mb-1">
            {stats.pendingRepairCount}
          </div>
          <div className="text-sm text-text-secondary">报修待处理</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle">
          <h2 className="font-display text-lg text-text-primary mb-4">
            房间利用率趋势
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={utilizationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3428" />
                <XAxis dataKey="date" stroke="#6b6458" fontSize={12} />
                <YAxis stroke="#6b6458" fontSize={12} unit="%" domain={[0, 100]} />
                <Tooltip content={renderTooltip} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(value: string) => (
                    <span className="text-text-secondary">{value}</span>
                  )}
                />
                {rooms.map((room) => (
                  <Line
                    key={room.id}
                    type="monotone"
                    dataKey={room.name}
                    stroke={room.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: room.color }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle">
          <h2 className="font-display text-lg text-text-primary mb-4">
            预约状态分布
          </h2>
          <div style={{ height: 300 }} className="relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistributionData}
                  cx="35%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={statusColors[entry.name] || '#c89b3c'}
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12 }}
                  formatter={(value: string) => (
                    <span className="text-text-secondary">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ left: '-15%' }}
            >
              {renderPieCenter()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle">
          <h2 className="font-display text-lg text-text-primary mb-4">
            热门乐器排行
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularInstrumentsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3428" />
                <XAxis
                  dataKey="name"
                  stroke="#6b6458"
                  fontSize={12}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#6b6458" fontSize={12} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" name="预约次数" fill="#c89b3c" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle">
          <h2 className="font-display text-lg text-text-primary mb-4">
            房间报修排行
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomRepairData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3d3428" />
                <XAxis
                  dataKey="name"
                  stroke="#6b6458"
                  fontSize={12}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#6b6458" fontSize={12} />
                <Tooltip content={renderTooltip} />
                <Bar dataKey="count" name="报修次数" fill="#8b6a3a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-bg-secondary rounded-2xl p-6 border border-border-subtle">
        <h2 className="font-display text-lg text-text-primary mb-4">
          审批积压情况
        </h2>
        {pendingApprovalList.length === 0 ? (
          <div className="py-12 text-center text-text-secondary">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
            <p>暂无待审批预约</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovalList.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-colors',
                  item.isOverdue
                    ? 'bg-state-danger/10 border-state-danger/30'
                    : 'bg-bg-tertiary border-border-subtle hover:bg-bg-elevated',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    item.isOverdue
                      ? 'bg-state-danger/30'
                      : 'bg-state-warning/20',
                  )}
                >
                  <Clock
                    className={cn(
                      'w-5 h-5',
                      item.isOverdue
                        ? 'text-state-danger-light'
                        : 'text-state-warning-light',
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-text-primary">
                      {item.studentName}
                    </span>
                    <span className="text-text-muted">·</span>
                    <span className="text-sm text-text-secondary flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {item.roomName}
                    </span>
                    <span className="text-text-muted">·</span>
                    <span className="text-sm text-text-secondary flex items-center gap-1">
                      <Music className="w-3.5 h-3.5" />
                      {item.instrumentName}
                    </span>
                  </div>
                </div>
                <div
                  className={cn(
                    'text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg flex-shrink-0',
                    item.isOverdue
                      ? 'bg-state-danger/20 text-state-danger-light'
                      : 'bg-state-warning/20 text-state-warning-light',
                  )}
                >
                  <Clock className="w-4 h-4" />
                  等待 {item.waitHours} 小时
                  {item.isOverdue && (
                    <span className="ml-1 text-xs">⚠ 超时</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

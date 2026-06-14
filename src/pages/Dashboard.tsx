import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  UserX,
  Building2,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { StatsCard } from '../components/StatsCard';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { formatTime, formatDateTime } from '../utils/helpers';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const {
    classrooms,
    getDashboardStats,
    getPendingReservations,
    getTodayReservations,
  } = useStore();

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats]);
  const pendingReservations = useMemo(() => getPendingReservations(), [getPendingReservations]);
  const todayReservations = useMemo(() => getTodayReservations(), [getTodayReservations]);

  const classroomStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return classrooms.map((classroom) => {
      const classReservations = todayReservations.filter(
        (r) => r.classroomId === classroom.id
      );
      const reserved = classReservations.filter(
        (r) => r.status === 'checked_in' || r.status === 'pending'
      ).length;
      const available = classroom.seatCount - reserved;
      const usageRate =
        classroom.seatCount > 0
          ? Math.round((reserved / classroom.seatCount) * 100)
          : 0;
      return {
        ...classroom,
        reserved,
        available,
        usageRate,
      };
    });
  }, [classrooms, todayReservations]);

  const pendingColumns = [
    {
      key: 'studentName',
      header: '学生姓名',
      cell: (item: (typeof pendingReservations)[0]) => (
        <div className="font-medium text-slate-800">{item.studentName}</div>
      ),
    },
    {
      key: 'className',
      header: '班级',
    },
    {
      key: 'classroomId',
      header: '教室',
      cell: (item: (typeof pendingReservations)[0]) => {
        const classroom = classrooms.find((c) => c.id === item.classroomId);
        return `${classroom?.building} ${classroom?.roomNumber}`;
      },
    },
    {
      key: 'seatId',
      header: '座位号',
      cell: (item: (typeof pendingReservations)[0]) => {
        const seat = useStore.getState().seats.find((s) => s.id === item.seatId);
        return seat ? `${seat.seatNumber}号` : '-';
      },
    },
    {
      key: 'timeSlot',
      header: '时段',
    },
    {
      key: 'expiresAt',
      header: '超时时间',
      cell: (item: (typeof pendingReservations)[0]) => (
        <span className="text-amber-600 font-medium">{formatTime(item.expiresAt)}</span>
      ),
    },
    {
      key: 'status',
      header: '状态',
      cell: (item: (typeof pendingReservations)[0]) => (
        <StatusBadge status={item.status} />
      ),
    },
  ];

  const noShowColumns = [
    {
      key: 'name',
      header: '学生姓名',
      cell: (item: (typeof stats.frequentNoShows)[0]) => (
        <div className="font-medium text-slate-800">{item.name}</div>
      ),
    },
    {
      key: 'className',
      header: '班级',
    },
    {
      key: 'count',
      header: '爽约次数',
      cell: (item: (typeof stats.frequentNoShows)[0]) => (
        <span className="text-red-600 font-bold">{item.count}次</span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 font-display mb-2">
          <LayoutDashboard className="inline-block w-8 h-8 mr-3 text-primary-500" />
          实时看板
        </h1>
        <p className="text-slate-500">实时监控各教室座位使用情况</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="总座位数"
          value={stats.totalSeats}
          icon={Building2}
          gradient="from-primary-500 to-primary-700"
        />
        <StatsCard
          title="当前空位"
          value={stats.availableSeats}
          icon={Users}
          gradient="from-emerald-500 to-emerald-700"
          trend="可预约"
          trendUp={stats.availableSeats > stats.totalSeats * 0.3}
        />
        <StatsCard
          title="已签到"
          value={stats.checkedInCount}
          icon={Clock}
          gradient="from-accent-500 to-accent-700"
          trend={`待签到: ${stats.pendingCount}`}
          trendUp
        />
        <StatsCard
          title="未签到"
          value={stats.noShowCount}
          icon={AlertTriangle}
          gradient="from-red-500 to-red-700"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-primary-100 rounded-xl">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display">各教室空位情况</h2>
          </div>
          <div className="space-y-4">
            {classroomStats.map((classroom, index) => (
              <div
                key={classroom.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-slate-800">
                      {classroom.building} {classroom.roomNumber}
                    </span>
                    <span className="text-sm text-slate-400 ml-2">
                      共{classroom.seatCount}座
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-emerald-600 font-medium">
                      空{classroom.available}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600">{classroom.usageRate}%</span>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500 bg-gradient-to-r',
                      classroom.usageRate >= 80
                        ? 'from-red-400 to-red-500'
                        : classroom.usageRate >= 50
                        ? 'from-amber-400 to-amber-500'
                        : 'from-emerald-400 to-emerald-500'
                    )}
                    style={{ width: `${classroom.usageRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-accent-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display">各班使用率排行</h2>
          </div>
          <div className="space-y-4">
            {stats.classUsage.length === 0 ? (
              <div className="text-center py-8 text-slate-400">暂无数据</div>
            ) : (
              stats.classUsage.slice(0, 7).map((item, index) => (
                <div
                  key={item.className}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
                            : index === 1
                            ? 'bg-slate-200 text-slate-600'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-500'
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">{item.className}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">
                        {item.used}/{item.total}人
                      </span>
                      <span className="text-accent-600 font-bold">{item.usageRate}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-500"
                      style={{ width: `${item.usageRate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-amber-100 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 font-display">待签到名单</h2>
          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
            {pendingReservations.length}人
          </span>
        </div>
        <DataTable
          columns={pendingColumns}
          data={pendingReservations}
          emptyMessage="暂无待签到的预约"
        />
      </div>

      {stats.frequentNoShows.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-100 rounded-xl">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 font-display">连续爽约学生</h2>
            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
              {stats.frequentNoShows.length}人
            </span>
          </div>
          <DataTable
            columns={noShowColumns}
            data={stats.frequentNoShows}
            emptyMessage="暂无连续爽约学生"
          />
        </div>
      )}
    </div>
  );
}

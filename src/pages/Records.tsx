import { useMemo, useState } from 'react';
import {
  FileText,
  CalendarClock,
  User,
  Building2,
  Clock,
  LogOut,
  MoveRight,
  CalendarX,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import type { ChangeRecord } from '../types';
import { TIME_SLOTS } from '../types';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDate } from '../utils/helpers';

export default function Records() {
  const { changeRecords, classrooms, seats, reservations } = useStore();
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecords = useMemo(() => {
    let result = [...changeRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filterType !== 'all') {
      result = result.filter((r) => r.changeType === filterType);
    }
    return result;
  }, [changeRecords, filterType]);

  const getReservationInfo = (reservationId: string) => {
    return reservations.find((r) => r.id === reservationId);
  };

  const getClassroomInfo = (classroomId: string) => {
    return classrooms.find((c) => c.id === classroomId);
  };

  const getSeatNumber = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    return seat?.seatNumber || '-';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'leave':
        return <CalendarX className="w-4 h-4 text-orange-600" />;
      case 'seat_change':
        return <MoveRight className="w-4 h-4 text-blue-600" />;
      case 'early_leave':
        return <LogOut className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  const statistics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = changeRecords.filter((r) => r.createdAt.startsWith(today));
    return {
      total: changeRecords.length,
      today: todayRecords.length,
      leave: changeRecords.filter((r) => r.changeType === 'leave').length,
      seatChange: changeRecords.filter((r) => r.changeType === 'seat_change').length,
      earlyLeave: changeRecords.filter((r) => r.changeType === 'early_leave').length,
    };
  }, [changeRecords]);

  const columns = [
    {
      key: 'createdAt',
      header: '时间',
      cell: (item: ChangeRecord) => (
        <div className="text-slate-600">
          <div className="font-medium">{formatDate(item.createdAt)}</div>
          <div className="text-xs text-slate-400">{formatDateTime(item.createdAt).split(' ')[1]}</div>
        </div>
      ),
    },
    {
      key: 'changeType',
      header: '类型',
      cell: (item: ChangeRecord) => (
        <div className="flex items-center gap-2">
          {getTypeIcon(item.changeType)}
          <StatusBadge status={item.changeType} type="change" />
        </div>
      ),
    },
    {
      key: 'student',
      header: '学生信息',
      cell: (item: ChangeRecord) => {
        const reservation = getReservationInfo(item.reservationId);
        if (!reservation) return <span className="text-slate-400">-</span>;
        return (
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              {reservation.studentName}
            </div>
            <div className="text-xs text-slate-500">{reservation.className}</div>
          </div>
        );
      },
    },
    {
      key: 'classroom',
      header: '教室',
      cell: (item: ChangeRecord) => {
        const reservation = getReservationInfo(item.reservationId);
        if (!reservation) return <span className="text-slate-400">-</span>;
        const classroom = getClassroomInfo(reservation.classroomId);
        return (
          <div>
            <div className="font-medium text-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              {classroom?.building} {classroom?.roomNumber}
            </div>
            <div className="text-xs text-slate-500">{reservation.timeSlot}</div>
          </div>
        );
      },
    },
    {
      key: 'seats',
      header: '座位变动',
      cell: (item: ChangeRecord) => {
        if (item.changeType === 'seat_change') {
          return (
            <div className="flex items-center gap-2 text-slate-700">
              <span className="font-medium">{getSeatNumber(item.fromSeatId || '')}号</span>
              <MoveRight className="w-4 h-4 text-slate-400" />
              <span className="font-medium text-accent-600">{getSeatNumber(item.toSeatId || '')}号</span>
            </div>
          );
        }
        const reservation = getReservationInfo(item.reservationId);
        return reservation ? (
          <span className="text-slate-700">{getSeatNumber(reservation.seatId)}号</span>
        ) : (
          <span className="text-slate-400">-</span>
        );
      },
    },
    {
      key: 'reason',
      header: '原因',
      cell: (item: ChangeRecord) => (
        <div className="max-w-xs">
          <p className="text-sm text-slate-600 line-clamp-2">{item.reason}</p>
        </div>
      ),
    },
  ];

  const filterTypes = [
    { value: 'all', label: '全部', count: statistics.total },
    { value: 'leave', label: '临时请假', count: statistics.leave },
    { value: 'seat_change', label: '更换座位', count: statistics.seatChange },
    { value: 'early_leave', label: '提前离开', count: statistics.earlyLeave },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 font-display mb-2">
            <FileText className="inline-block w-8 h-8 mr-3 text-primary-500" />
            异动记录
          </h1>
          <p className="text-slate-500">查看请假、换座和提前离开的历史记录</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <Filter className="w-4 h-4" />
          筛选
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-4 animate-fade-in">
          <p className="text-sm text-slate-500 mb-1">总计记录</p>
          <p className="text-2xl font-bold text-slate-800 font-display">{statistics.total}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <p className="text-sm text-slate-500 mb-1">今日新增</p>
          <p className="text-2xl font-bold text-accent-600 font-display">{statistics.today}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm text-slate-500 mb-1">临时请假</p>
          <p className="text-2xl font-bold text-orange-600 font-display">{statistics.leave}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <p className="text-sm text-slate-500 mb-1">换座/离开</p>
          <p className="text-2xl font-bold text-blue-600 font-display">
            {statistics.seatChange + statistics.earlyLeave}
          </p>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl shadow-card p-4 animate-scale-in">
          <div className="flex flex-wrap gap-2">
            {filterTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                  filterType === type.value
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {type.label}
                <span
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs',
                    filterType === type.value
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredRecords}
          emptyMessage="暂无异动记录"
        />
      </div>
    </div>
  );
}

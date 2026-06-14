import { useMemo, useState } from 'react';
import {
  FileText,
  User,
  Building2,
  LogOut,
  MoveRight,
  CalendarX,
  Filter,
  ChevronDown,
  Search,
  CalendarRange,
  RotateCcw,
  Users,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { DataTable } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import type { ChangeRecord } from '../types';
import { CLASS_LIST } from '../types';
import { cn } from '@/lib/utils';
import { formatDateTime, formatDate } from '../utils/helpers';

export default function Records() {
  const { changeRecords, classrooms, seats, reservations } = useStore();

  const [showFilters, setShowFilters] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterName, setFilterName] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

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

  const filteredRecords = useMemo(() => {
    let result = [...changeRecords].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filterType !== 'all') {
      result = result.filter((r) => r.changeType === filterType);
    }

    if (filterName.trim()) {
      const keyword = filterName.trim();
      result = result.filter((r) => {
        const reservation = getReservationInfo(r.reservationId);
        return reservation?.studentName?.includes(keyword);
      });
    }

    if (filterClass) {
      result = result.filter((r) => {
        const reservation = getReservationInfo(r.reservationId);
        return reservation?.className === filterClass;
      });
    }

    if (filterDateStart) {
      const start = new Date(filterDateStart);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.createdAt) >= start);
    }

    if (filterDateEnd) {
      const end = new Date(filterDateEnd);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.createdAt) <= end);
    }

    return result;
  }, [changeRecords, filterType, filterName, filterClass, filterDateStart, filterDateEnd, reservations]);

  const statistics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = filteredRecords.filter((r) => r.createdAt.startsWith(today));
    return {
      total: filteredRecords.length,
      today: todayRecords.length,
      leave: filteredRecords.filter((r) => r.changeType === 'leave').length,
      seatChange: filteredRecords.filter((r) => r.changeType === 'seat_change').length,
      earlyLeave: filteredRecords.filter((r) => r.changeType === 'early_leave').length,
    };
  }, [filteredRecords]);

  const hasActiveFilters =
    filterType !== 'all' ||
    filterName.trim() !== '' ||
    filterClass !== '' ||
    filterDateStart !== '' ||
    filterDateEnd !== '';

  const resetFilters = () => {
    setFilterType('all');
    setFilterName('');
    setFilterClass('');
    setFilterDateStart('');
    setFilterDateEnd('');
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

  const getEmptyMessage = () => {
    if (hasActiveFilters) {
      return '当前筛选条件下没有记录';
    }
    return '暂无异动记录';
  };

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
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          )}
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
        <div className="bg-white rounded-2xl shadow-card p-6 animate-scale-in space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Search className="w-4 h-4 text-primary-500" />
                  学生姓名
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="输入姓名搜索"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Users className="w-4 h-4 text-primary-500" />
                  班级
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
                >
                  <option value="">全部班级</option>
                  {CLASS_LIST.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <CalendarRange className="w-4 h-4 text-primary-500" />
                  开始日期
                </label>
                <input
                  type="date"
                  value={filterDateStart}
                  onChange={(e) => setFilterDateStart(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <CalendarRange className="w-4 h-4 text-primary-500" />
                  结束日期
                </label>
                <input
                  type="date"
                  value={filterDateEnd}
                  onChange={(e) => setFilterDateEnd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredRecords}
          emptyMessage={getEmptyMessage()}
        />
      </div>
    </div>
  );
}

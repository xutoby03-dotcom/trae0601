import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Plane,
  CalendarDays,
  Users,
  ChevronRight,
  Trash2,
  Package,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, daysUntil } from '@/utils/date';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import type { TripStatus } from '@/types';
import { clsx } from 'clsx';

export default function TripList() {
  const navigate = useNavigate();
  const { trips, tripItems, familyMembers, deleteTrip } = useAppStore();

  const enrichedTrips = useMemo(() => {
    const sorted = [...trips].sort((a, b) => {
      const order: Record<TripStatus, number> = { ongoing: 0, planning: 1, completed: 2 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return sorted.map((t) => {
      const items = tripItems.filter((ti) => ti.tripId === t.id);
      const packed = items.filter((i) => i.isPacked).length;
      const percent = items.length > 0 ? Math.round((packed / items.length) * 100) : 0;
      const companions = familyMembers.filter((fm) => t.companionIds.includes(fm.id));
      const daysTo = daysUntil(t.startDate);
      return { ...t, items, packed, percent, companions, daysTo };
    });
  }, [trips, tripItems, familyMembers]);

  const statusConfig: Record<TripStatus, { label: string; cls: string; icon: any }> = {
    planning: { label: '待出发', cls: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock },
    ongoing: { label: '进行中', cls: 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse-soft', icon: Sparkles },
    completed: { label: '已完成', cls: 'bg-slate-100 text-slate-600 border-slate-200', icon: CheckCircle2 },
  };

  if (trips.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="section-title">我的旅行</h2>
            <p className="section-desc !mb-0">管理每次旅行的药品准备和消耗记录</p>
          </div>
        </div>
        <EmptyState
          icon={<Plane size={32} />}
          title="还没有旅行计划"
          description="创建一次新旅行，让系统为你智能推荐药品清单，确保全家出行无忧"
          action={
            <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/trips/new')}>
              规划第一次旅行
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="section-title">我的旅行</h2>
          <p className="section-desc !mb-0">
            共 {trips.length} 次旅行，{enrichedTrips.filter((t) => t.status === 'planning').length} 次待出发
          </p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => navigate('/trips/new')}>
          新建旅行
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedTrips.map((trip, idx) => {
          const config = statusConfig[trip.status];
          const StatusIcon = config.icon;
          return (
            <div
              key={trip.id}
              className="card card-hover group animate-fade-in-up overflow-hidden"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={clsx(
                      'w-12 h-12 rounded-2xl flex items-center justify-center',
                      trip.status === 'planning' &&
                        'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-lg shadow-brand-200/40',
                      trip.status === 'ongoing' &&
                        'bg-gradient-to-br from-sand-400 to-sand-500 text-white shadow-lg shadow-sand-200/40',
                      trip.status === 'completed' &&
                        'bg-slate-100 text-slate-500'
                    )}
                  >
                    <Plane size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
                      {trip.destination}
                      <Badge variant="default" className={clsx('border', config.cls)}>
                        <StatusIcon size={10} />
                        {config.label}
                      </Badge>
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {formatDate(trip.startDate)}
                      </span>
                      <span>· {trip.days} 天</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`删除「${trip.destination}」旅行及其清单？`)) {
                      deleteTrip(trip.id);
                    }
                  }}
                  className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge variant="default" className="border border-slate-200">
                  <Users size={10} /> {trip.companions.length} 人同行
                </Badge>
                {trip.companions.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    className="chip !text-xs !py-1"
                  >
                    {c.name}
                  </span>
                ))}
                {trip.companions.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{trip.companions.length - 3}
                  </span>
                )}
              </div>

              {trip.items.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Package size={11} /> 打包进度
                    </span>
                    <span className="font-bold text-slate-700">
                      {trip.packed}/{trip.items.length} · {trip.percent}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all',
                        trip.percent === 100
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : 'bg-gradient-to-r from-brand-400 to-brand-500'
                      )}
                      style={{ width: `${trip.percent}%` }}
                    />
                  </div>
                </div>
              )}

              {trip.status === 'planning' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-sand-50 to-brand-50 border border-sand-100/60 mb-4">
                  <p className="text-xs text-slate-700 flex items-center gap-2">
                    <MapPin size={12} className="text-brand-500" />
                    <span>
                      {trip.daysTo > 0
                        ? `距离出发还有 ${trip.daysTo} 天`
                        : trip.daysTo === 0
                        ? '今天就要出发啦！'
                        : '已超过出发日期'}
                    </span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Link
                  to={`/trips/${trip.id}`}
                  className="flex-1"
                >
                  <Button
                    variant={trip.status === 'completed' ? 'secondary' : 'primary'}
                    className="!w-full"
                    rightIcon={<ChevronRight size={16} />}
                  >
                    {trip.status === 'completed' ? '查看记录' : trip.percent === 100 ? '打包完成' : '继续打包'}
                  </Button>
                </Link>
                {trip.items.length > 0 && (
                  <Link to={`/trips/${trip.id}/summary`}>
                    <Button variant="secondary" leftIcon={
                      trip.status === 'completed' ? <Sparkles size={16} /> : null
                    }>
                      {trip.status === 'completed' ? '补货' : '统计'}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

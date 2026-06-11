import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Clock, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
import type { EquipmentStatus } from '@/types';
import { STATUS_META } from '@/types';
import { useStore } from '@/store/useStore';
import { formatCountdown, formatDateTime, formatWeight, formatVolume } from '@/utils/formatters';
import { getCompletionRate, getTotalWeight, getTotalVolume } from '@/utils/statistics';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EmptyState from '@/components/common/EmptyState';

const STATUS_ORDER: EquipmentStatus[] = ['unassigned', 'at_risk', 'packed', 'in_car'];

export default function Dashboard() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const peopleAll = useStore((s) => s.people);
  const equipmentAll = useStore((s) => s.equipment);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);
  const allEquipment = useMemo(() => equipmentAll.filter((e) => e.tripId === currentTripId), [equipmentAll, currentTripId]);

  const equipmentByStatus = useMemo(() => {
    const result: Record<EquipmentStatus, typeof allEquipment> = {
      unassigned: [],
      packed: [],
      in_car: [],
      at_risk: [],
    };
    allEquipment.forEach((e) => {
      result[e.status].push(e);
    });
    return result;
  }, [allEquipment]);

  const completion = useMemo(() => getCompletionRate(allEquipment), [allEquipment]);
  const totalWeight = useMemo(() => getTotalWeight(allEquipment), [allEquipment]);
  const totalVolume = useMemo(() => getTotalVolume(allEquipment), [allEquipment]);

  if (!trip) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <EmptyState
          icon={MapPin}
          title="还没有露营计划"
          description="先创建一个露营计划，开始组织你的装备吧！"
        />
        <div className="flex justify-center mt-6">
          <Link to="/plan" className="btn-primary">
            <Sparkles size={18} />
            创建露营计划
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card p-6 bg-gradient-to-br from-forest-600 via-forest-700 to-forest-800 text-white border-0 shadow-card overflow-hidden relative">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-20 top-20 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 text-forest-100/80 text-sm mb-1">
                <MapPin size={14} />
                <span>即将出发</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl mb-2">{trip.location}</h1>
              <div className="flex flex-wrap items-center gap-4 text-forest-100/90">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {trip.days}天{trip.days + 1}晚
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} />
                  {people.length}人
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {formatDateTime(trip.meetingTime)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-forest-100/70 text-xs mb-1">集合倒计时</div>
              <div className="font-display text-4xl md:text-5xl text-warmorange-300">
                {formatCountdown(trip.meetingTime)}
              </div>
              <Link
                to="/plan"
                className="inline-flex items-center gap-1 mt-2 text-sm text-forest-100/80 hover:text-white transition-colors"
              >
                编辑计划 <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-forest-100/80">打包进度</span>
              <span className="font-semibold">
                {completion.packed}/{completion.total} 件装备 ({completion.rate}%)
              </span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-warmorange-400 to-warmorange-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${completion.rate}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-forest-100/70">
              <span>总重量: {formatWeight(totalWeight)}</span>
              <span>总体积: {formatVolume(totalVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      {equipmentByStatus.at_risk.length > 0 && (
        <div className="card p-4 border-warmorange-300/40 bg-warmorange-50/50">
          <div className="flex items-center gap-2 text-warmorange-700 mb-2">
            <AlertTriangle size={18} />
            <span className="font-semibold">有 {equipmentByStatus.at_risk.length} 件装备有遗漏风险</span>
          </div>
          <p className="text-sm text-warmorange-700/80">
            请特别留意这些装备，建议尽快分配负责人并确认打包状态。
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => {
          const meta = STATUS_META[status];
          const items = equipmentByStatus[status];
          return (
            <div
              key={status}
              className={`rounded-2xl border ${meta.bgColor} p-4`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{meta.emoji}</span>
                  <h3 className={`font-semibold ${meta.color}`}>{meta.label}</h3>
                </div>
                <span className={`badge bg-white/70 ${meta.color}`}>{items.length}</span>
              </div>
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto scroll-area pr-1">
                {items.length === 0 ? (
                  <div className="text-center py-6 text-sm text-bark-500/40">
                    暂无装备
                  </div>
                ) : (
                  items.map((eq) => (
                    <EquipmentCard key={eq.id} equipment={eq} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

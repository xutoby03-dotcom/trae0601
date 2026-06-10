import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { FaultTicket } from '@/shared/types';
import { STATUS_CONFIG, BUILDINGS } from '@/shared/constants';
import StatusBadge from './StatusBadge';
import { relativeTime } from '@/utils/time';
import { PHENOMENON_OPTIONS } from '@/shared/constants';
import { buildElevatorCountMap, elevatorKey } from '@/utils/statistics';
import {
  Building2,
  Clock,
  User,
  Users,
  ArrowUpRight,
  Wrench,
  Repeat,
  Highlighter,
  Camera,
  AlertOctagon,
} from 'lucide-react';

interface Props {
  ticket: FaultTicket;
  compact?: boolean;
}

export default function FaultCard({ ticket, compact = false }: Props) {
  const nav = useNavigate();
  const { currentRole, subscriptions, tickets } = useAppStore();

  const historyCount = useMemo(() => {
    const map = buildElevatorCountMap(tickets);
    return map[elevatorKey(ticket.elevator)] || 0;
  }, [tickets, ticket.elevator]);

  const cfg = STATUS_CONFIG[ticket.status];
  const building = BUILDINGS.find((b) => b.code === ticket.elevator.building);
  const isHighRise = (ticket.elevator.floorCount || 0) >= 20;
  const subscribed = subscriptions.buildings.includes(ticket.elevator.building);
  const phenom = PHENOMENON_OPTIONS.find((p) => p.value === ticket.phenomenon);
  const isUrgentHighlight = ticket.hasTrapped || (ticket.status === 'urgent' && isHighRise);

  const border = isUrgentHighlight
    ? 'border-l-4 border-l-red-500 ring-1 ring-red-100'
    : ticket.status === 'urgent'
      ? 'border-l-4 border-l-orange-400'
      : '';

  return (
    <article
      onClick={() => nav(`/fault/${ticket.id}`)}
      className={`card-hover cursor-pointer p-5 relative overflow-hidden animate-slide-up ${border}`}
    >
      {isUrgentHighlight && (
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full bg-gradient-to-br from-red-500/10 to-transparent pointer-events-none" />
      )}

      <header className="flex items-start justify-between gap-3 relative">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
              <Building2 size={18} className="text-brand-500" />
              {building?.name || ticket.elevator.building} {ticket.elevator.unit}{ticket.elevator.elevatorNo}
            </h3>
            <StatusBadge status={ticket.status} />
            {ticket.hasTrapped && (
              <span className="tag bg-red-500 text-white animate-pulse-slow">
                <AlertOctagon size={12} />
                有人被困
                {ticket.trappedCount ? ` ${ticket.trappedCount}人` : ''}
              </span>
            )}
            {isHighRise && ticket.status !== 'recovered' && !ticket.hasTrapped && (
              <span className="tag bg-orange-50 text-orange-700 border border-orange-200">
                <Highlighter size={12} />
                高层停运
              </span>
            )}
            {historyCount >= 2 && (
              <span className="tag bg-yellow-50 text-yellow-700 border border-yellow-200">
                <Repeat size={12} />
                历史 {historyCount} 次
              </span>
            )}
            {subscribed && (
              <span className="tag bg-brand-50 text-brand-600 border border-brand-200">
                已订阅
              </span>
            )}
          </div>
        </div>
        <ArrowUpRight size={18} className="text-slate-400 group-hover:text-brand-500 shrink-0 mt-1" />
      </header>

      {!compact && (
        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <User size={13} />
            {ticket.reportedBy}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} />
            {relativeTime(ticket.occurredAt)}发生
          </span>
          {ticket.handler && currentRole === 'property' && (
            <span className="inline-flex items-center gap-1 text-orange-600">
              <Wrench size={13} />
              {ticket.handler}处理中
            </span>
          )}
          {ticket.photos.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Camera size={13} />
              {ticket.photos.length}张照片
            </span>
          )}
        </div>
      )}

      <div className="mt-3">
        <div className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 mb-2">
          {phenom?.label}
        </div>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
          {ticket.description}
        </p>
      </div>

      {ticket.estimatedRecoverAt && ticket.status !== 'recovered' && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          <Clock size={12} className={cfg.color} />
          <span className="text-slate-500">预计恢复时间：</span>
          <span className={`font-medium ${cfg.color}`}>
            {new Date(ticket.estimatedRecoverAt).toLocaleString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      )}

      {ticket.detourTip && ticket.status !== 'recovered' && (
        <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200/60 text-xs text-amber-800">
          <span className="font-semibold">绕行提示：</span>
          {ticket.detourTip}
        </div>
      )}
    </article>
  );
}

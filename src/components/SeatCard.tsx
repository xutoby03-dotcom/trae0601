import type { Seat } from '../types';
import { SeatStatus, SEAT_STATUS_COLORS } from '../types';
import { StatusBadge } from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, User, Phone, AlertTriangle, Coffee, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatDateTime, formatCountdown } from '../utils/time';

interface SeatCardProps {
  seat: Seat;
}

export function SeatCard({ seat }: SeatCardProps) {
  const navigate = useNavigate();
  const colors = SEAT_STATUS_COLORS[seat.status];

  return (
    <div
      onClick={() => navigate(`/seat/${seat.id}`)}
      className={cn(
        'group relative bg-white rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2',
        colors.border,
      )}
    >
      <div className="absolute top-3 right-3">
        <StatusBadge status={seat.status} size="sm" />
      </div>

      <div className="flex items-start gap-3 pr-16">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', colors.bg)}>
          <MapPin className={cn('w-6 h-6', colors.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="font-bold text-slate-800 truncate">
              {seat.building} {seat.room}
            </h3>
          </div>
          <p className={cn('text-sm font-semibold mt-0.5', colors.text)}>座位 {seat.seatNumber}号</p>
        </div>
      </div>

      {seat.status !== SeatStatus.EMPTY && (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{seat.registeredBy}</span>
          </div>
          {seat.contact && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{seat.contact}</span>
            </div>
          )}
          {seat.expectedLeaveAt && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              {seat.status === SeatStatus.SUSPECTED ? (
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              ) : seat.status === SeatStatus.TEMP_LEAVE ? (
                <Coffee className="w-4 h-4 text-amber-500" />
              ) : (
                <Clock className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {seat.status === SeatStatus.TEMP_LEAVE && seat.tempLeaveUntil
                  ? `短暂离开 ${formatCountdown(seat.tempLeaveUntil)}`
                  : seat.status === SeatStatus.SUSPECTED
                  ? `预计离开: ${formatDateTime(seat.expectedLeaveAt)} 已超时`
                  : `预计 ${formatCountdown(seat.expectedLeaveAt)}离开`}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-end text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>查看详情</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </div>
  );
}

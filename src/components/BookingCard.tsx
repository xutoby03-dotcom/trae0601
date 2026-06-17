import { useNavigate } from 'react-router-dom';
import { Clock, Users, Wrench, X, QrCode } from 'lucide-react';
import type { Booking } from '@/types';
import { useStore } from '@/store/useStore';
import StatusBadge from './StatusBadge';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
  });
}

export default function BookingCard({ booking, showActions = false }: BookingCardProps) {
  const navigate = useNavigate();
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const checkInBooking = useStore((s) => s.checkInBooking);

  const room = rooms.find((r) => r.id === booking.roomId);
  const instrument = instruments.find((i) => i.id === booking.instrumentId);

  const showCheckIn = booking.status === 'waiting_checkin';
  const showRepair = booking.status === 'checked_in' || booking.status === 'waiting_checkin';
  const showCancel =
    booking.status === 'approved' ||
    booking.status === 'waiting_checkin' ||
    booking.status === 'pending_approval';

  const handleRepair = () => {
    navigate(
      `/repairs?bookingId=${encodeURIComponent(booking.id)}&roomId=${encodeURIComponent(booking.roomId)}`,
    );
  };

  const handleCheckIn = () => {
    checkInBooking(booking.id);
  };

  const handleCancel = () => {
    // TODO: 接入取消预约功能
  };

  return (
    <div
      className={cn(
        'bg-bg-tertiary rounded-xl p-4 transition-shadow duration-200',
        'hover:shadow-card-hover'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            {room?.name || '未知房间'}
          </h3>
          <p className="text-sm text-text-secondary">{booking.piece}</p>
        </div>
        <StatusBadge status={booking.status} size="sm" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Clock className="w-4 h-4 text-text-muted" />
          <span>
            {formatDate(booking.startTime)} {formatTime(booking.startTime)} -{' '}
            {formatTime(booking.endTime)}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: room?.color }} />
            <span>{instrument?.name || '未知乐器'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-text-muted" />
            <span>{booking.peopleCount}人</span>
          </div>
        </div>
      </div>

      {showActions && (showCheckIn || showRepair || showCancel) && (
        <div className="flex items-center gap-2 pt-3 border-t border-border-subtle">
          {showCheckIn && (
            <button
              onClick={handleCheckIn}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-accent-copper text-white text-sm font-medium hover:bg-accent-copper-dark transition-colors"
            >
              <QrCode className="w-4 h-4" />
              签到
            </button>
          )}
          {showRepair && (
            <button
              onClick={handleRepair}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-bg-elevated text-text-secondary text-sm font-medium hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              <Wrench className="w-4 h-4" />
              报修
            </button>
          )}
          {showCancel && !showCheckIn && !showRepair && (
            <button
              onClick={handleCancel}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-state-danger/20 text-state-danger-light text-sm font-medium hover:bg-state-danger/30 transition-colors"
            >
              <X className="w-4 h-4" />
              取消预约
            </button>
          )}
          {showCancel && (showCheckIn || showRepair) && (
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg bg-state-danger/20 text-state-danger-light hover:bg-state-danger/30 transition-colors"
              title="取消预约"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarPlus, LogIn, LogOut, Sparkles, Clock, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore, practiceTypeLabels } from '../store';
import RoomCard from '../components/RoomCard';
import type { Booking } from '../types';
import { format } from 'date-fns';

interface Props {
  onOpenFeedback: (bookingId: string) => void;
}

export default function HomePage({ onOpenFeedback }: Props) {
  const navigate = useNavigate();
  const {
    getBookingsGroupedByStatus,
    rooms,
    checkInBooking,
    checkOutBooking,
    isAdmin,
    isBookingOverdue,
    checkOverdueBookings,
  } = useStore(s => ({
    getBookingsGroupedByStatus: s.getBookingsGroupedByStatus,
    rooms: s.rooms,
    checkInBooking: s.checkInBooking,
    checkOutBooking: s.checkOutBooking,
    isAdmin: s.isAdmin,
    isBookingOverdue: s.isBookingOverdue,
    checkOverdueBookings: s.checkOverdueBookings,
  }));

  const grouped = useMemo(() => getBookingsGroupedByStatus(), [getBookingsGroupedByStatus]);
  const [, setTick] = useState(0);

  useEffect(() => {
    checkOverdueBookings();
    const interval = setInterval(() => {
      checkOverdueBookings();
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, [checkOverdueBookings]);

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name || roomId;

  const today = format(new Date(), 'yyyy年MM月dd日 EEEE');

  const BookingInfo = ({ booking, showActions = true }: { booking: Booking; showActions?: boolean }) => {
    const overdue = isBookingOverdue(booking.id);

    return (
    <div className="text-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="font-medium text-gray-800">{booking.userName}</span>
        <span className="text-gray-500">·</span>
        <span className="text-gray-600">
          <Clock size={12} className="inline -mt-0.5 mr-0.5" />
          {booking.startTime} - {booking.endTime}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
          {practiceTypeLabels[booking.practiceType]}
        </span>
        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
          {booking.peopleCount}人
        </span>
        {booking.needMusicStand && (
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">需谱架</span>
        )}
        {booking.hasExternalSpeaker && (
          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">带外放</span>
        )}
      </div>
      {overdue.overdue && booking.status === 'in_use' && (
        <div className="mt-3 mb-2 p-3 bg-red-50 border-2 border-red-400 rounded-lg flex items-start gap-2 animate-pulse">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold text-sm">
              ⚠️ 已超时 {overdue.overdueMinutes} 分钟未签退！
            </p>
            <p className="text-red-600 text-xs mt-0.5">
              预约 {booking.startTime}-{booking.endTime} 已结束，请及时签退释放房间
            </p>
          </div>
        </div>
      )}
      {showActions && booking.status === 'pending' && (
        <button
          onClick={(e) => { e.stopPropagation(); checkInBooking(booking.id); }}
          className="mt-3 btn-success w-full flex items-center justify-center gap-1.5 py-2 text-sm"
        >
          <LogIn size={16} />
          签到使用
        </button>
      )}
      {showActions && booking.status === 'in_use' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); checkOutBooking(booking.id); }}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-sm"
          >
            <LogOut size={16} />
            签退
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenFeedback(booking.id); checkOutBooking(booking.id); }}
            className="btn-secondary flex-1 flex items-center justify-center gap-1.5 py-2 text-sm"
          >
            <Sparkles size={16} />
            签退并评价
          </button>
        </div>
      )}
      {showActions && booking.status === 'needs_cleaning' && isAdmin && (
        <button
          onClick={(e) => { e.stopPropagation(); onOpenFeedback(booking.id); }}
          className="mt-3 btn-primary w-full flex items-center justify-center gap-1.5 py-2 text-sm"
        >
          <Sparkles size={16} />
          打扫并完成
        </button>
      )}
    </div>
  );
};

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">今日预约概览</h1>
        <p className="text-gray-500 text-sm">{today}</p>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 className="text-green-500" />} label="空闲" value={grouped.availableToday.length} color="green" />
        <StatCard icon={<Clock className="text-yellow-500" />} label="即将开始" value={grouped.upcoming.length} color="yellow" />
        <StatCard icon={<AlertCircle className="text-red-500" />} label="使用中" value={grouped.inUse.length} color="red" />
        <StatCard icon={<Sparkles className="text-orange-500" />} label="待打扫" value={grouped.needsCleaning.length} color="orange" />
      </div>

      <Section title="🔴 使用中" subtitle={`共 ${grouped.inUse.length} 间`} emptyText="暂无房间正在使用">
        {grouped.inUse.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          if (!room) return null;
          return (
            <RoomCard
              key={booking.id}
              room={room}
              status="in_use"
              bookingInfo={<BookingInfo booking={booking} />}
              onClick={() => navigate(`/booking/${booking.id}`)}
            />
          );
        })}
      </Section>

      <Section title="🟡 即将开始" subtitle="1小时内的预约" emptyText="暂无即将开始的预约">
        {grouped.upcoming.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          if (!room) return null;
          return (
            <RoomCard
              key={booking.id}
              room={room}
              status="upcoming"
              bookingInfo={<BookingInfo booking={booking} />}
              onClick={() => navigate(`/booking/${booking.id}`)}
            />
          );
        })}
      </Section>

      <Section title="🟠 待打扫" subtitle="使用结束等待清洁" emptyText="所有房间清洁完毕 ✨">
        {grouped.needsCleaning.map(booking => {
          const room = rooms.find(r => r.id === booking.roomId);
          if (!room) return null;
          return (
            <RoomCard
              key={booking.id}
              room={room}
              status="needs_cleaning"
              bookingInfo={<BookingInfo booking={booking} />}
              onClick={() => navigate(`/booking/${booking.id}`)}
            />
          );
        })}
      </Section>

      <Section
        title="🟢 今日空闲"
        subtitle={`共 ${grouped.availableToday.length} 间可预约`}
        emptyText="所有房间已被预约"
        action={
          <Link to="/booking" className="btn-primary text-sm flex items-center gap-1.5 px-3 py-1.5">
            <CalendarPlus size={16} />
            立即预约
          </Link>
        }
      >
        {grouped.availableToday.map(room => (
          <RoomCard
            key={room.id}
            room={room}
            status="available"
            onClick={() => window.location.href = `/booking?roomId=${room.id}`}
          />
        ))}
      </Section>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-50 border-green-100',
    yellow: 'bg-yellow-50 border-yellow-100',
    red: 'bg-red-50 border-red-100',
    orange: 'bg-orange-50 border-orange-100',
  };
  return (
    <div className={`card p-3 border ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-1">
        {icon}
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function Section({
  title, subtitle, emptyText, children, action,
}: {
  title: string;
  subtitle?: string;
  emptyText?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  const count = React.Children.count(children);
  const actualHasContent = count > 0 && !(count === 1 && children === null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      {actualHasContent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {children}
        </div>
      ) : (
        <div className="card p-8 text-center text-gray-400 text-sm">
          {emptyText || '暂无数据'}
        </div>
      )}
    </div>
  );
}

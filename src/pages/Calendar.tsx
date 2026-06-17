import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  LayoutGrid,
  List,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Booking, Room, Instrument, User } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { cn } from '@/lib/utils';

type ViewMode = 'day' | 'week';

const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 40;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getDate()}日`;
  }
  return `${start.getFullYear()}年${start.getMonth() + 1}月${start.getDate()}日 - ${end.getMonth() + 1}月${end.getDate()}日`;
}

function formatSingleDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function getMinutesFromStart(date: Date): number {
  return date.getHours() * 60 + date.getMinutes() - START_HOUR * 60;
}

function getWeekDays(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

interface BookingPosition {
  booking: Booking;
  top: number;
  height: number;
  dayIndex: number;
  room: Room;
  instrument: Instrument | undefined;
  user: User | undefined;
}

interface TooltipData {
  booking: Booking;
  room: Room;
  instrument: Instrument | undefined;
  user: User | undefined;
  x: number;
  y: number;
}

export default function Calendar() {
  const navigate = useNavigate();
  const { rooms, bookings, instruments, users } = useStore();

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-17'));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const dateRange = useMemo(() => {
    if (viewMode === 'day') {
      return { start: currentDate, end: currentDate };
    }
    const start = startOfWeek(currentDate);
    return { start, end: addDays(start, 6) };
  }, [viewMode, currentDate]);

  const weekDays = useMemo(() => {
    if (viewMode === 'day') {
      return [currentDate];
    }
    return getWeekDays(startOfWeek(currentDate));
  }, [viewMode, currentDate]);

  const timeSlots = useMemo(() => {
    const slots: { label: string; minutes: number }[] = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
        const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ label, minutes: (hour - START_HOUR) * 60 + minute });
      }
    }
    return slots;
  }, []);

  const totalHeight = ((END_HOUR - START_HOUR) * 60 / SLOT_MINUTES) * SLOT_HEIGHT;

  const bookingsWithPosition = useMemo<BookingPosition[]>(() => {
    const positions: BookingPosition[] = [];

    for (const booking of bookings) {
      const room = rooms.find((r) => r.id === booking.roomId);
      if (!room) continue;

      const instrument = instruments.find((i) => i.id === booking.instrumentId);
      const user = users.find((u) => u.id === booking.userId);

      for (let dayIndex = 0; dayIndex < weekDays.length; dayIndex++) {
        const day = weekDays[dayIndex];
        if (!isSameDay(booking.startTime, day)) continue;

        const startMinutes = getMinutesFromStart(booking.startTime);
        const endMinutes = getMinutesFromStart(booking.endTime);

        if (endMinutes <= 0 || startMinutes >= (END_HOUR - START_HOUR) * 60) {
          continue;
        }

        const clampedStart = Math.max(0, startMinutes);
        const clampedEnd = Math.min((END_HOUR - START_HOUR) * 60, endMinutes);
        const clampedDuration = clampedEnd - clampedStart;

        positions.push({
          booking,
          top: (clampedStart / SLOT_MINUTES) * SLOT_HEIGHT,
          height: (clampedDuration / SLOT_MINUTES) * SLOT_HEIGHT,
          dayIndex,
          room,
          instrument,
          user,
        });
      }
    }

    return positions;
  }, [bookings, rooms, instruments, users, weekDays]);

  const handlePrev = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    } else {
      setCurrentDate(addDays(currentDate, -7));
    }
  };

  const handleNext = () => {
    if (viewMode === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-06-17'));
  };

  const handleSlotClick = (date: Date, hour: number, minute: number) => {
    const start = new Date(date);
    start.setHours(hour, minute, 0, 0);
    navigate('/booking/new', { state: { startTime: start.toISOString() } });
  };

  const handleBookingHover = (
    e: React.MouseEvent,
    booking: Booking,
    room: Room,
    instrument: Instrument | undefined,
    user: User | undefined,
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.calendar-grid-container')?.getBoundingClientRect();
    if (!parentRect) return;

    setTooltip({
      booking,
      room,
      instrument,
      user,
      x: rect.left - parentRect.left + rect.width + 8,
      y: rect.top - parentRect.top,
    });
  };

  const getBookingStatusClasses = (status: Booking['status']) => {
    const base: string[] = [];

    if (status === 'pending_approval') {
      base.push('border-2', 'border-dashed');
    }

    if (status === 'no_show' || status === 'cancelled' || status === 'rejected') {
      base.push('opacity-40', 'line-through');
    }

    return base;
  };

  const showNowLine = useMemo(() => {
    const inRange = weekDays.some((d) => isSameDay(d, now));
    const minutes = now.getHours() * 60 + now.getMinutes();
    return inRange && minutes >= START_HOUR * 60 && minutes <= END_HOUR * 60;
  }, [weekDays, now]);

  const nowLineTop = useMemo(() => {
    const minutes = now.getHours() * 60 + now.getMinutes() - START_HOUR * 60;
    return (minutes / SLOT_MINUTES) * SLOT_HEIGHT;
  }, [now]);

  const nowDayIndex = useMemo(() => {
    return weekDays.findIndex((d) => isSameDay(d, now));
  }, [weekDays, now]);

  return (
    <div className="h-full flex flex-col bg-bg-secondary rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-sm font-medium transition-colors"
          >
            今日
          </button>
          <div className="flex items-center gap-2 ml-2">
            <CalendarDays className="w-5 h-5 text-accent-copper" />
            <span className="text-lg font-semibold text-text-primary">
              {viewMode === 'day'
                ? formatSingleDate(dateRange.start)
                : formatDateRange(dateRange.start, dateRange.end)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-bg-tertiary rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'day'
                  ? 'bg-accent-copper text-white'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <List className="w-4 h-4" />
              日视图
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                viewMode === 'week'
                  ? 'bg-accent-copper text-white'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              周视图
            </button>
          </div>
          <button
            onClick={() => navigate('/booking/new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-copper text-white text-sm font-medium hover:bg-accent-copper-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建预约
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative calendar-grid-container">
        <div className="min-w-full" style={{ minWidth: `${120 + rooms.length * 180}px` }}>
          <div className="flex sticky top-0 z-20 bg-bg-secondary">
            <div
              className="flex-shrink-0 border-b border-r border-border-subtle bg-bg-secondary"
              style={{ width: '120px' }}
            />
            <div className="flex flex-1">
              {viewMode === 'week' ? (
                weekDays.map((day, dayIdx) => {
                  const isToday = isSameDay(day, now);
                  return (
                    <div
                      key={dayIdx}
                      className="flex-1 border-b border-r border-border-subtle last:border-r-0"
                      style={{ minWidth: '180px' }}
                    >
                      <div
                        className={cn(
                          'flex items-center justify-center py-3',
                          isToday && 'bg-accent-copper/10'
                        )}
                      >
                        <div className="text-center">
                          <div
                            className={cn(
                              'text-xs mb-0.5',
                              isToday ? 'text-accent-copper' : 'text-text-muted'
                            )}
                          >
                            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'][dayIdx]}
                          </div>
                          <div
                            className={cn(
                              'text-base font-medium',
                              isToday ? 'text-accent-copper' : 'text-text-primary'
                            )}
                          >
                            {day.getDate()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 border-b border-border-subtle">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex-1 border-b border-r border-border-subtle last:border-r-0 py-3 text-center"
                      style={{
                        minWidth: '180px',
                        backgroundColor: hexToRgba(room.color, 0.15),
                      }}
                    >
                      <div className="text-text-primary font-medium">{room.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{room.location}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {viewMode === 'week' && (
            <div className="flex sticky top-[73px] z-10 bg-bg-secondary border-b border-border-subtle">
              <div
                className="flex-shrink-0 border-r border-border-subtle bg-bg-secondary"
                style={{ width: '120px' }}
              />
              <div className="flex flex-1">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex-1 border-r border-border-subtle last:border-r-0 py-2 text-center"
                    style={{
                      minWidth: '180px',
                      backgroundColor: hexToRgba(room.color, 0.1),
                    }}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: room.color }}
                      />
                      <span className="text-sm font-medium text-text-primary">{room.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex relative">
            <div
              className="flex-shrink-0 border-r border-border-subtle"
              style={{ width: '120px' }}
            >
              {timeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-end pr-3 text-xs text-text-muted border-b border-border-subtle/50"
                  style={{ height: `${SLOT_HEIGHT}px` }}
                >
                  <span className="-mt-2">{slot.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-1 relative" style={{ height: `${totalHeight}px` }}>
              {(viewMode === 'week' ? weekDays : rooms).map((_, colIdx) => (
                <div
                  key={colIdx}
                  className="relative flex-1 border-r border-border-subtle last:border-r-0"
                  style={{ minWidth: '180px' }}
                >
                  {timeSlots.map((slot, rowIdx) => {
                    const hour = START_HOUR + Math.floor(slot.minutes / 60);
                    const minute = slot.minutes % 60;
                    return (
                      <div
                        key={rowIdx}
                        className="border-b border-border-subtle/50 hover:bg-accent-copper/5 cursor-pointer transition-colors"
                        style={{ height: `${SLOT_HEIGHT}px` }}
                        onClick={() => {
                          const day =
                            viewMode === 'week' ? weekDays[colIdx] : currentDate;
                          handleSlotClick(day, hour, minute);
                        }}
                      />
                    );
                  })}

                  {bookingsWithPosition
                    .filter((bp) => {
                      if (viewMode === 'week') {
                        return bp.dayIndex === colIdx;
                      }
                      return bp.room.id === rooms[colIdx]?.id;
                    })
                    .map(({ booking, room, instrument, user, top, height }) => (
                      <div
                        key={booking.id}
                        className={cn(
                          'absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer overflow-hidden transition-all duration-150 hover:shadow-lg hover:z-10',
                          ...getBookingStatusClasses(booking.status),
                          booking.status === 'checked_in' && 'animate-pulse-slow'
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height, 28)}px`,
                          backgroundColor: hexToRgba(room.color, 0.35),
                          borderLeft: `3px solid ${room.color}`,
                          borderColor: booking.status === 'pending_approval' ? room.color : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                        onMouseEnter={(e) => handleBookingHover(e, booking, room, instrument, user)}
                        onMouseLeave={() => setTooltip(null)}
                      >
                        <div className="text-xs font-medium text-white truncate">
                          {instrument?.name || '未知乐器'}
                        </div>
                        <div className="text-xs text-white/80 truncate">
                          {user?.name || '未知用户'}
                        </div>
                      </div>
                    ))}

                  {viewMode === 'week' &&
                    showNowLine &&
                    nowDayIndex === colIdx && (
                      <div
                        className="absolute left-0 right-0 z-10 pointer-events-none"
                        style={{ top: `${nowLineTop}px` }}
                      >
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-state-danger -ml-1" />
                          <div className="flex-1 h-0.5 bg-state-danger" />
                        </div>
                      </div>
                    )}

                  {viewMode === 'day' && showNowLine && (
                    <div
                      className="absolute left-0 right-0 z-10 pointer-events-none"
                      style={{ top: `${nowLineTop}px` }}
                    >
                      <div className="flex items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-state-danger -ml-1" />
                        <div className="flex-1 h-0.5 bg-state-danger" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {tooltip && (
          <div
            className="absolute z-30 w-64 bg-bg-tertiary rounded-xl border border-border-subtle shadow-card p-4 pointer-events-none animate-fade-in"
            style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tooltip.room.color }}
                />
                <span className="text-sm font-semibold text-text-primary">
                  {tooltip.room.name}
                </span>
              </div>
              <StatusBadge status={tooltip.booking.status} size="sm" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-text-secondary">
                <span className="text-text-muted">乐器：</span>
                {tooltip.instrument?.name || '未知'}
              </div>
              <div className="text-text-secondary">
                <span className="text-text-muted">学生：</span>
                {tooltip.user?.name || '未知'}
              </div>
              <div className="text-text-secondary">
                <span className="text-text-muted">时间：</span>
                {formatTime(tooltip.booking.startTime)} - {formatTime(tooltip.booking.endTime)}
              </div>
              <div className="text-text-secondary">
                <span className="text-text-muted">曲目：</span>
                {tooltip.booking.piece}
              </div>
              <div className="text-text-secondary">
                <span className="text-text-muted">人数：</span>
                {tooltip.booking.peopleCount}人
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-bg-secondary rounded-2xl border border-border-subtle shadow-card-hover w-full max-w-md mx-4 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const booking = selectedBooking;
              const room = rooms.find((r) => r.id === booking.roomId);
              const instrument = instruments.find((i) => i.id === booking.instrumentId);
              const user = users.find((u) => u.id === booking.userId);

              return (
                <>
                  <div className="flex items-center justify-between p-5 border-b border-border-subtle">
                    <h3 className="text-lg font-semibold text-text-primary">预约详情</h3>
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="p-1.5 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: room?.color }}
                        />
                        <span className="text-base font-medium text-text-primary">
                          {room?.name}
                        </span>
                      </div>
                      <StatusBadge status={booking.status} size="sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-text-muted mb-1">乐器</div>
                        <div className="text-sm text-text-primary">
                          {instrument?.name || '未知'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">学生</div>
                        <div className="text-sm text-text-primary">
                          {user?.name || '未知'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">日期</div>
                        <div className="text-sm text-text-primary">
                          {formatSingleDate(booking.startTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">时间</div>
                        <div className="text-sm text-text-primary">
                          {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">人数</div>
                        <div className="text-sm text-text-primary">
                          {booking.peopleCount}人
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-muted mb-1">谱架</div>
                        <div className="text-sm text-text-primary">
                          {booking.needMusicStand ? '需要' : '不需要'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-text-muted mb-1">曲目</div>
                      <div className="text-sm text-text-primary">{booking.piece}</div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 p-5 border-t border-border-subtle">
                    <button
                      onClick={() => setSelectedBooking(null)}
                      className="px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated text-sm font-medium transition-colors"
                    >
                      关闭
                    </button>
                    {(booking.status === 'approved' ||
                      booking.status === 'waiting_checkin' ||
                      booking.status === 'pending_approval') && (
                      <button className="px-4 py-2 rounded-lg bg-state-danger/20 text-state-danger-light hover:bg-state-danger/30 text-sm font-medium transition-colors">
                        取消预约
                      </button>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

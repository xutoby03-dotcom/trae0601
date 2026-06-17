import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  ClipboardList,
  QrCode,
  Wrench,
  Plus,
  Clock,
  Building2,
  Music,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge, BookingCard } from '@/components';
import type { Booking } from '@/types';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const currentUser = useStore((s) => s.currentUser);
  const bookings = useStore((s) => s.bookings);
  const repairs = useStore((s) => s.repairs);
  const rooms = useStore((s) => s.rooms);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const stats = useMemo(() => {
    const isToday = (date: Date) => {
      const d = new Date(date);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    };
    const todayBookings = bookings.filter(
      (b) =>
        isToday(b.startTime) &&
        b.status !== 'cancelled' &&
        b.status !== 'rejected' &&
        b.status !== 'no_show' &&
        b.status !== 'waitlisted',
    );
    const pendingApproval = bookings.filter((b) => b.status === 'pending_approval');
    const waitingCheckin = bookings.filter((b) => b.status === 'waiting_checkin');
    const pendingRepairs = repairs.filter(
      (r) => r.status === 'pending' || r.status === 'processing',
    );
    return {
      todayBookings: todayBookings.length,
      pendingApproval: pendingApproval.length,
      waitingCheckin: waitingCheckin.length,
      pendingRepairs: pendingRepairs.length,
    };
  }, [bookings, repairs, today]);

  const myBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings
      .filter(
        (b) =>
          b.userId === currentUser.id &&
          (b.status === 'waiting_checkin' ||
            b.status === 'checked_in' ||
            b.status === 'pending_approval'),
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .slice(0, 3);
  }, [bookings, currentUser]);

  const todoReminders = useMemo(() => {
    const reminders: Array<{
      id: string;
      type: 'approval' | 'checkin';
      title: string;
      subtitle: string;
      time?: Date;
    }> = [];

    bookings
      .filter((b) => b.status === 'pending_approval')
      .forEach((b) => {
        const room = rooms.find((r) => r.id === b.roomId);
        reminders.push({
          id: `approval-${b.id}`,
          type: 'approval',
          title: `审批申请：${room?.name || '未知房间'}`,
          subtitle: b.piece,
          time: b.startTime,
        });
      });

    bookings
      .filter((b) => b.status === 'waiting_checkin')
      .forEach((b) => {
        const room = rooms.find((r) => r.id === b.roomId);
        reminders.push({
          id: `checkin-${b.id}`,
          type: 'checkin',
          title: `待签到：${room?.name || '未知房间'}`,
          subtitle: b.piece,
          time: b.startTime,
        });
      });

    return reminders.sort(
      (a, b) =>
        new Date(a.time || 0).getTime() - new Date(b.time || 0).getTime(),
    );
  }, [bookings, rooms]);

  const formatDate = () => {
    return today.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            你好，{currentUser?.name || '同学'}
          </h1>
          <p className="mt-1 text-text-secondary">{formatDate()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-state-info/20 flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-state-info-light" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {stats.todayBookings}
          </div>
          <div className="text-sm text-text-secondary">今日预约数</div>
        </div>

        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-state-warning/20 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-state-warning-light" />
            </div>
          </div>
          <div
            className={cn(
              'text-3xl font-semibold mb-1',
              stats.pendingApproval > 0
                ? 'text-state-danger-light'
                : 'text-text-primary',
            )}
          >
            {stats.pendingApproval}
          </div>
          <div className="text-sm text-text-secondary">待审批数</div>
        </div>

        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-accent-copper/20 flex items-center justify-center">
              <QrCode className="w-6 h-6 text-accent-copper" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {stats.waitingCheckin}
          </div>
          <div className="text-sm text-text-secondary">待签到数</div>
        </div>

        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-state-danger/20 flex items-center justify-center">
              <Wrench className="w-6 h-6 text-state-danger-light" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-text-primary mb-1">
            {stats.pendingRepairs}
          </div>
          <div className="text-sm text-text-secondary">待修设备数</div>
        </div>
      </div>

      <div
        className={cn(
          'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
          'hover:shadow-glow transition-all duration-300',
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">快速预约</h2>
            <p className="text-sm text-text-secondary mt-1">
              立即发起一个新的练习房预约
            </p>
          </div>
          <Link
            to="/booking/new"
            className={cn(
              'flex items-center gap-2 px-5 py-2.5 rounded-xl',
              'bg-accent-copper text-white font-medium',
              'hover:bg-accent-copper-dark transition-colors',
            )}
          >
            <Plus className="w-5 h-5" />
            发起预约
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            我的预约
          </h2>
          {myBookings.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <Music className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
              <p>暂无进行中的预约</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking: Booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'hover:shadow-glow transition-all duration-300',
          )}
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            待办提醒
          </h2>
          {todoReminders.length === 0 ? (
            <div className="py-12 text-center text-text-secondary">
              <ClipboardList className="w-12 h-12 mx-auto mb-3 text-text-muted opacity-50" />
              <p>暂无待办事项</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todoReminders.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-4 rounded-xl bg-bg-tertiary hover:bg-bg-elevated transition-colors"
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      item.type === 'approval'
                        ? 'bg-state-warning/20'
                        : 'bg-accent-copper/20',
                    )}
                  >
                    {item.type === 'approval' ? (
                      <ClipboardList
                        className={cn('w-5 h-5 text-state-warning-light')}
                      />
                    ) : (
                      <QrCode className="w-5 h-5 text-accent-copper" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-text-primary truncate">
                        {item.title}
                      </span>
                      <StatusBadge
                        status={
                          item.type === 'approval'
                            ? 'pending_approval'
                            : 'waiting_checkin'
                        }
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {item.subtitle}
                    </p>
                    {item.time && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-muted">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(item.time).toLocaleDateString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          {formatTime(item.time)}
                        </span>
                        <span className="mx-1">·</span>
                        <Building2 className="w-3.5 h-3.5" />
                        <span>
                          {rooms.find(
                            (r) =>
                              r.id ===
                              (bookings.find((b) =>
                                item.id.includes(b.id),
                              )?.roomId || ''),
                          )?.name || '未知房间'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

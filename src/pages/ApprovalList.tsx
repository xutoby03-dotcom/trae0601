import { useState, useMemo } from 'react';
import {
  ClipboardList,
  User,
  Clock,
  Music,
  Users,
  Volume2,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge, Empty } from '@/components';
import type { BookingStatus } from '@/types';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'pending_approval' | 'approved' | 'rejected';

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'pending_approval', label: '待审批' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
];

const noiseLevelLabels: Record<string, string> = {
  low: '低音量',
  medium: '中音量',
  high: '高音量',
  extreme: '极高音量',
};

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ApprovalList() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const bookings = useStore((s) => s.bookings);
  const users = useStore((s) => s.users);
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const approveBooking = useStore((s) => s.approveBooking);
  const rejectBooking = useStore((s) => s.rejectBooking);

  const filteredBookings = useMemo(() => {
    const relevantStatuses: BookingStatus[] = [
      'pending_approval',
      'approved',
      'rejected',
    ];
    let result = bookings.filter((b) => relevantStatuses.includes(b.status));

    if (activeFilter !== 'all') {
      result = result.filter((b) => b.status === activeFilter);
    }

    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [bookings, activeFilter]);

  const handleApprove = (id: string) => {
    approveBooking(id);
  };

  const handleReject = (id: string) => {
    rejectBooking(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            审批管理
          </h1>
          <p className="mt-1 text-text-secondary">管理预约申请的审批流程</p>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl border border-border-subtle w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              activeFilter === tab.key
                ? 'bg-accent-copper text-white shadow-glow'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <Empty
          icon={ClipboardList}
          title="暂无审批记录"
          description="当前筛选条件下没有审批记录"
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const user = users.find((u) => u.id === booking.userId);
            const room = rooms.find((r) => r.id === booking.roomId);
            const instrument = instruments.find(
              (i) => i.id === booking.instrumentId,
            );
            const duration = Math.round(
              (new Date(booking.endTime).getTime() -
                new Date(booking.startTime).getTime()) /
                (1000 * 60),
            );

            return (
              <div
                key={booking.id}
                className={cn(
                  'bg-bg-secondary rounded-xl p-5 border border-border-subtle',
                  'hover:shadow-card-hover transition-all duration-300',
                  'animate-slide-up',
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-accent-copper/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-copper" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {user?.name || '未知用户'}
                      </h3>
                      <p className="text-sm text-text-secondary">
                        {user?.role === 'student'
                          ? '学生'
                          : user?.role === 'teacher'
                          ? '教师'
                          : '管理员'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: room?.color }}
                      />
                      <span className="font-medium text-text-primary">
                        {room?.name || '未知房间'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Music className="w-4 h-4 text-text-muted" />
                      <span>{instrument?.name || '未知乐器'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span>
                        {formatDate(booking.startTime)}{' '}
                        {formatTime(booking.startTime)} -{' '}
                        {formatTime(booking.endTime)}
                      </span>
                      <span className="text-text-muted">
                        ({duration}分钟)
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2 text-sm text-text-secondary">
                      <Music className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{booking.piece}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Users className="w-4 h-4 text-text-muted" />
                      <span>{booking.peopleCount}人</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Volume2 className="w-4 h-4 text-text-muted" />
                      <span>
                        {noiseLevelLabels[booking.expectedVolume] ||
                          booking.expectedVolume}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                  <div className="text-xs text-text-muted">
                    提交时间：{formatDateTime(booking.createdAt)}
                  </div>

                  {booking.status === 'pending_approval' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReject(booking.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-lg',
                          'bg-state-danger text-white font-medium text-sm',
                          'hover:bg-state-danger-light transition-colors duration-200',
                          'active:scale-95 transition-transform',
                        )}
                      >
                        <X className="w-4 h-4" />
                        拒绝
                      </button>
                      <button
                        onClick={() => handleApprove(booking.id)}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-lg',
                          'bg-state-success text-white font-medium text-sm',
                          'hover:bg-state-success-light transition-colors duration-200',
                          'active:scale-95 transition-transform',
                        )}
                      >
                        <Check className="w-4 h-4" />
                        通过
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

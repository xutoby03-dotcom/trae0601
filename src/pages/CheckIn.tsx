import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Clock,
  Music,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { StatusBadge, Empty } from '@/components';
import { cn } from '@/lib/utils';

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getCountdown(startTime: Date, now: number): {
  text: string;
  isOverdue: boolean;
  isSoon: boolean;
} {
  const start = new Date(startTime).getTime();
  const diff = start - now;
  const overdueThreshold = 15 * 60 * 1000;

  if (diff < -overdueThreshold) {
    return { text: '已超时', isOverdue: true, isSoon: false };
  }

  if (diff < 0) {
    const overdueMinutes = Math.floor(Math.abs(diff) / (1000 * 60));
    return {
      text: `已过 ${overdueMinutes} 分钟`,
      isOverdue: true,
      isSoon: true,
    };
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return {
      text: `${hours}小时${remainingMinutes}分钟后开始`,
      isOverdue: false,
      isSoon: hours < 1,
    };
  }

  if (minutes > 0) {
    return {
      text: `${minutes}分钟后开始`,
      isOverdue: false,
      isSoon: minutes < 30,
    };
  }

  return { text: '即将开始', isOverdue: false, isSoon: true };
}

export default function CheckIn() {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const bookings = useStore((s) => s.bookings);
  const rooms = useStore((s) => s.rooms);
  const instruments = useStore((s) => s.instruments);
  const checkInBooking = useStore((s) => s.checkInBooking);
  const processBookingStatusUpdates = useStore(
    (s) => s.processBookingStatusUpdates,
  );

  const handleProcessStatus = useCallback(() => {
    processBookingStatusUpdates();
  }, [processBookingStatusUpdates]);

  useEffect(() => {
    handleProcessStatus();
    const timer = setInterval(() => {
      setNow(Date.now());
      handleProcessStatus();
    }, 30000);
    return () => clearInterval(timer);
  }, [handleProcessStatus]);

  const today = useMemo(() => {
    const n = new Date(now);
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }, [now]);

  const isToday = useCallback(
    (date: Date) => {
      const d = new Date(date);
      return (
        d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate()
      );
    },
    [today],
  );

  const waitingCheckinBookings = useMemo(() => {
    return bookings
      .filter(
        (b) => b.status === 'waiting_checkin' && isToday(b.startTime),
      )
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [bookings, isToday]);

  const checkedInBookings = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          (b.status === 'checked_in' || b.status === 'completed') &&
          isToday(b.startTime),
      )
      .sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      );
  }, [bookings, isToday]);

  const noShowBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'no_show' && isToday(b.startTime))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      );
  }, [bookings, isToday]);

  const handleCheckIn = (id: string) => {
    checkInBooking(id);
  };

  const handleRepair = () => {
    navigate('/repairs');
  };

  const handleManualRefresh = () => {
    setNow(Date.now());
    handleProcessStatus();
  };

  const qrPattern = useMemo(() => {
    const size = 21;
    const pattern: boolean[][] = [];
    for (let i = 0; i < size; i++) {
      pattern[i] = [];
      for (let j = 0; j < size; j++) {
        pattern[i][j] = Math.random() > 0.5;
      }
    }
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const isFinderBorder =
          i === 0 || i === 6 || j === 0 || j === 6;
        const isFinderInner =
          i >= 2 && i <= 4 && j >= 2 && j <= 4;
        pattern[i][j] = isFinderBorder || isFinderInner;
        pattern[i][size - 1 - j] = isFinderBorder || isFinderInner;
        pattern[size - 1 - i][j] = isFinderBorder || isFinderInner;
      }
    }
    return pattern;
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold text-text-primary">
            签到中心
          </h1>
          <p className="mt-1 text-text-secondary">
            管理今日预约的签到流程
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-all text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          刷新状态
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'transition-shadow duration-300 hover:shadow-card-hover',
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent-copper/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-accent-copper" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                今日待签到
              </h2>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-accent-copper/20 text-accent-copper text-xs font-medium">
                {waitingCheckinBookings.length}
              </span>
            </div>

            {waitingCheckinBookings.length === 0 ? (
              <Empty
                icon={Clock}
                title="暂无待签到预约"
                description="今日所有预约已完成签到或已超时"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {waitingCheckinBookings.map((booking) => {
                  const room = rooms.find((r) => r.id === booking.roomId);
                  const instrument = instruments.find(
                    (i) => i.id === booking.instrumentId,
                  );
                  const countdown = getCountdown(booking.startTime, now);

                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        'p-4 rounded-xl bg-bg-tertiary border border-border-subtle',
                        'hover:bg-bg-elevated transition-all duration-200',
                        'animate-slide-up',
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: room?.color }}
                            />
                            <h3 className="font-semibold text-text-primary">
                              {room?.name || '未知房间'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Music className="w-3.5 h-3.5 text-text-muted" />
                            <span>{instrument?.name || '未知乐器'}</span>
                            <span className="text-text-muted">·</span>
                            <span>
                              {formatTime(booking.startTime)} -{' '}
                              {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {countdown.isOverdue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-state-danger text-white text-xs font-medium">
                              <AlertTriangle className="w-3 h-3" />
                              {countdown.text}
                            </span>
                          ) : (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                                countdown.isSoon
                                  ? 'bg-state-warning/20 text-state-warning-light'
                                  : 'bg-state-info/20 text-state-info-light',
                              )}
                            >
                              <Clock className="w-3 h-3" />
                              {countdown.text}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleCheckIn(booking.id)}
                        className={cn(
                          'w-full flex items-center justify-center gap-2 py-3 rounded-xl',
                          'bg-accent-copper text-white font-medium text-base',
                          'hover:bg-accent-copper-dark transition-colors duration-200',
                          'active:scale-[0.98] transition-transform',
                          'shadow-glow hover:shadow-glow-strong',
                        )}
                      >
                        <QrCode className="w-5 h-5" />
                        签到
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            className={cn(
              'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
              'transition-shadow duration-300 hover:shadow-card-hover',
            )}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-state-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-state-success-light" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">
                今日已签到 / 使用中
              </h2>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-state-success/20 text-state-success-light text-xs font-medium">
                {checkedInBookings.length}
              </span>
            </div>

            {checkedInBookings.length === 0 ? (
              <Empty
                icon={CheckCircle2}
                title="暂无签到记录"
                description="今日还没有用户完成签到"
                className="py-8"
              />
            ) : (
              <div className="space-y-3">
                {checkedInBookings.map((booking) => {
                  const room = rooms.find((r) => r.id === booking.roomId);
                  const instrument = instruments.find(
                    (i) => i.id === booking.instrumentId,
                  );

                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        'p-4 rounded-xl bg-bg-tertiary border border-border-subtle',
                        'hover:bg-bg-elevated transition-all duration-200',
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: room?.color }}
                            />
                            <h3 className="font-semibold text-text-primary truncate">
                              {room?.name || '未知房间'}
                            </h3>
                            <StatusBadge
                              status={booking.status}
                              size="sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-secondary">
                            <Music className="w-3.5 h-3.5 text-text-muted" />
                            <span className="truncate">
                              {instrument?.name || '未知乐器'}
                            </span>
                            <span className="text-text-muted">·</span>
                            <span>
                              {formatTime(booking.startTime)} -{' '}
                              {formatTime(booking.endTime)}
                            </span>
                          </div>
                          <div className="mt-1.5 text-xs text-text-muted flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            签到时间：{formatDateTime(booking.createdAt)}
                          </div>
                        </div>

                        <button
                          onClick={() => handleRepair()}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-2 rounded-lg ml-3',
                            'bg-bg-elevated text-text-secondary text-sm font-medium',
                            'hover:bg-state-danger/20 hover:text-state-danger-light transition-colors duration-200',
                            'active:scale-95 transition-transform',
                          )}
                        >
                          <Wrench className="w-4 h-4" />
                          报修
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {noShowBookings.length > 0 && (
            <div
              className={cn(
                'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
                'transition-shadow duration-300 hover:shadow-card-hover',
              )}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-state-danger/20 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-state-danger-light" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary">
                  今日爽约
                </h2>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-state-danger/20 text-state-danger-light text-xs font-medium">
                  {noShowBookings.length}
                </span>
              </div>

              <div className="space-y-3">
                {noShowBookings.map((booking) => {
                  const room = rooms.find((r) => r.id === booking.roomId);
                  const instrument = instruments.find(
                    (i) => i.id === booking.instrumentId,
                  );

                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        'p-4 rounded-xl bg-bg-tertiary/50 border border-border-subtle/50',
                        'opacity-70',
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-2.5 h-2.5 rounded-full opacity-50"
                              style={{ backgroundColor: room?.color }}
                            />
                            <h3 className="font-medium text-text-secondary line-through">
                              {room?.name || '未知房间'}
                            </h3>
                            <StatusBadge
                              status={booking.status}
                              size="sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Music className="w-3.5 h-3.5" />
                            <span>{instrument?.name || '未知乐器'}</span>
                            <span>·</span>
                            <span>
                              {formatTime(booking.startTime)} -{' '}
                              {formatTime(booking.endTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div
          className={cn(
            'bg-bg-secondary rounded-2xl p-6 border border-border-subtle',
            'transition-shadow duration-300 hover:shadow-card-hover',
            'h-fit',
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-state-info/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-state-info-light" />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">
              扫码签到
            </h2>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-4 bg-white rounded-2xl shadow-card animate-pulse-slow">
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(21, 1fr)`,
                  width: '200px',
                  height: '200px',
                }}
              >
                {qrPattern.flatMap((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={cn(
                        cell ? 'bg-bg-primary' : 'bg-white',
                      )}
                    />
                  )),
                )}
              </div>
            </div>

            <p className="mt-4 text-sm text-text-secondary text-center">
              使用手机扫描二维码即可快速签到
            </p>
            <p className="mt-1 text-xs text-text-muted text-center">
              请在预约开始前15分钟内完成签到
            </p>

            <div className="mt-6 w-full p-4 rounded-xl bg-bg-tertiary border border-border-subtle">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-state-warning-light flex-shrink-0 mt-0.5" />
                <div className="text-xs text-text-secondary space-y-1">
                  <p className="font-medium text-text-primary">签到须知</p>
                  <p>• 超过预约开始时间15分钟未签到将自动取消</p>
                  <p>• 取消后候补充位，按候补顺序自动转正</p>
                  <p>• 签到后请保持安静，遵守练习室规则</p>
                  <p>• 如设备有故障请点击"报修"按钮上报</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

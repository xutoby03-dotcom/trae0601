import { X, User, MapPin, Phone, CalendarClock, HandHelping, Lightbulb, Clock, Trash2, Undo2, LogOut } from 'lucide-react';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import { LadderStatus, ReservationStatus } from '@/types';
import { formatDateTime, formatRelativeTime } from '@/utils/helpers';

interface DetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  ladderId: string | null;
  onOpenReturn?: (ladderId: string) => void;
  onOpenBorrow?: (ladderId: string) => void;
}

export default function DetailDrawer({
  isOpen,
  onClose,
  ladderId,
  onOpenReturn,
  onOpenBorrow,
}: DetailDrawerProps) {
  const {
    ladders,
    reservations,
    borrowRecords,
    getLadderCurrentReservation,
    getLadderCurrentBorrow,
    cancelReservation,
    getLadderStatus,
  } = useStore();
  const { showToast } = useToast();

  if (!isOpen || !ladderId) return null;

  const ladder = ladders.find((l) => l.id === ladderId);
  if (!ladder) return null;

  const status = getLadderStatus(ladderId);
  const reservation = getLadderCurrentReservation(ladderId);
  const borrow = getLadderCurrentBorrow(ladderId);
  const borrowReservation = borrow
    ? reservations.find((r) => r.id === borrow.reservationId)
    : null;

  const activeReservation = reservation || borrowReservation;

  const statusConfig = {
    [LadderStatus.AVAILABLE]: {
      label: '可借',
      text: 'text-mint-700',
      bg: 'bg-mint-50',
      border: 'border-mint-200',
      dot: 'bg-mint-500',
      gradient: 'from-mint-400 via-mint-500 to-mint-600',
    },
    [LadderStatus.RESERVED]: {
      label: '已预约',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
      gradient: 'from-amber-400 via-amber-500 to-amber-600',
    },
    [LadderStatus.BORROWED]: {
      label: '借出中',
      text: 'text-sky-700',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      dot: 'bg-sky-500',
      gradient: 'from-sky-400 via-sky-500 to-sky-600',
    },
    [LadderStatus.OVERDUE]: {
      label: '逾期未还',
      text: 'text-danger-700',
      bg: 'bg-danger-50',
      border: 'border-danger-200',
      dot: 'bg-danger-500',
      gradient: 'from-danger-400 via-danger-500 to-danger-600',
    },
  } as const;

  const config = statusConfig[status];

  const handleCancelReservation = (reservationId: string) => {
    if (!confirm('确定要取消该预约吗？')) return;
    const result = cancelReservation(reservationId);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
      onClose();
    }
  };

  const handleOpenReturn = () => {
    onClose();
    onOpenReturn?.(ladderId);
  };

  const handleOpenBorrow = () => {
    onClose();
    onOpenBorrow?.(ladderId);
  };

  const now = new Date();
  const overdueMins = borrowReservation
    ? Math.floor(
        (now.getTime() - new Date(borrowReservation.expectedEndTime).getTime()) / 60000
      )
    : 0;
  const overdueHours = Math.floor(overdueMins / 60);

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[440px] max-w-full bg-white shadow-[0_0_50px_rgba(0,0,0,0.15)] border-l border-slate-100 flex flex-col animate-slide-up animate-fade-in" style={{ animationDuration: '0.3s' }}>
        <div className={`bg-gradient-to-r ${config.gradient} px-6 py-5`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                <span className={`w-2.5 h-2.5 rounded-full bg-white/80 ${status === LadderStatus.OVERDUE ? 'animate-blink' : ''}`} />
                <span>{config.label}</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white truncate">
                {ladder.name}
              </h2>
              <p className="text-white/80 text-sm mt-0.5">{ladder.type}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {ladder.description && (
          <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
            <p className="text-sm text-slate-600">{ladder.description}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {activeReservation ? (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${config.bg} ${config.border} border flex items-center justify-center`}>
                  <User className={`w-5 h-5 ${config.text}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">借用人</div>
                  <div className="font-semibold text-slate-800">{activeReservation.borrowerName}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <InfoCard icon={MapPin} label="楼栋" value={activeReservation.building} />
                <InfoCard icon={Phone} label="联系电话" value={activeReservation.phone} />
              </div>

              <div className="space-y-3">
                <InfoCard
                  icon={CalendarClock}
                  label="预约时段"
                  value={`${formatDateTime(activeReservation.startTime)} ~ ${formatDateTime(activeReservation.expectedEndTime)}`}
                  fullWidth
                />

                {borrow && (
                  <InfoCard
                    icon={Clock}
                    label="借出时间"
                    value={`${formatDateTime(borrow.borrowTime)}（${formatRelativeTime(borrow.borrowTime)}）`}
                    fullWidth
                  />
                )}

                <InfoCard
                  icon={CalendarClock}
                  label={status === LadderStatus.OVERDUE ? '应还时间（已逾期）' : '预计可取时间'}
                  value={formatDateTime(activeReservation.expectedEndTime)}
                  fullWidth
                  highlight={status === LadderStatus.OVERDUE}
                />

                {status === LadderStatus.OVERDUE && (
                  <div className="p-4 rounded-xl bg-danger-50 border border-danger-100 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-danger-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4.5 h-4.5 text-danger-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-danger-800">
                        已逾期 {overdueHours > 0 ? `${overdueHours} 小时` : `${Math.max(1, overdueMins)} 分钟`}
                      </div>
                      <div className="text-xs text-danger-600 mt-0.5">请尽快联系借用人归还</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Lightbulb className="w-4.5 h-4.5 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-amber-700 mb-1">借用用途</div>
                    <div className="text-sm font-semibold text-amber-900">{activeReservation.purpose}</div>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-4 rounded-xl border ${activeReservation.needHelp ? 'bg-mint-50 border-mint-100' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${activeReservation.needHelp ? 'bg-mint-100' : 'bg-slate-200'}`}>
                    <HandHelping className={`w-4.5 h-4.5 ${activeReservation.needHelp ? 'text-mint-700' : 'text-slate-500'}`} />
                  </div>
                  <div>
                    <div className={`text-xs font-medium mb-1 ${activeReservation.needHelp ? 'text-mint-700' : 'text-slate-600'}`}>
                      搬移协助
                    </div>
                    <div className={`text-sm font-semibold ${activeReservation.needHelp ? 'text-mint-900' : 'text-slate-700'}`}>
                      {activeReservation.needHelp ? '需要物业帮忙搬运' : '自行取用'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="text-center py-12">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center`}>
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">该梯子当前没有预约或借用记录</p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-5 bg-slate-50/80 backdrop-blur">
          <div className="flex gap-3">
            {status === LadderStatus.RESERVED && activeReservation && (
              <>
                <button
                  onClick={() => handleCancelReservation(activeReservation.id)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 hover:border-danger-200 hover:text-danger-600 transition-all duration-200 shadow-soft"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                  取消预约
                </button>
                <button
                  onClick={handleOpenBorrow}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  借出登记
                </button>
              </>
            )}

            {(status === LadderStatus.BORROWED || status === LadderStatus.OVERDUE) && (
              <button
                onClick={handleOpenReturn}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
              >
                <Undo2 className="w-4.5 h-4.5" />
                登记归还
              </button>
            )}

            {status === LadderStatus.AVAILABLE && (
              <div className="w-full text-center py-2 text-sm text-slate-500">
                该梯子当前可借，去首页点击"立即预约"
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  fullWidth,
  highlight,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  fullWidth?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3.5 rounded-xl border ${fullWidth ? 'col-span-2' : ''} ${highlight ? 'bg-danger-50 border-danger-100' : 'bg-white border-slate-100'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-danger-100' : 'bg-slate-100'}`}>
          <Icon className={`w-4 h-4 ${highlight ? 'text-danger-600' : 'text-slate-500'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[11px] mb-0.5 ${highlight ? 'text-danger-600' : 'text-slate-400'}`}>{label}</div>
          <div className={`text-sm font-medium truncate ${highlight ? 'text-danger-800' : 'text-slate-700'}`}>{value}</div>
        </div>
      </div>
    </div>
  );
}

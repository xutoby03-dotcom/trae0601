import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { useToast } from '@/components/Toast';
import BorrowModal from '@/components/BorrowModal';
import ReturnModal from '@/components/ReturnModal';
import DetailDrawer from '@/components/DetailDrawer';
import { LadderStatus, ReservationStatus } from '@/types';
import {
  CheckCircle2,
  Clock,
  HandCoins,
  AlertTriangle,
  ClipboardList,
  LogOut,
  Undo2,
  ChevronRight,
  Sparkles,
  Plus,
  User,
  MapPin,
  Phone,
  CalendarClock,
  HandHelping,
  Bell,
  AlertOctagon,
  Loader2,
} from 'lucide-react';
import { formatDateTime, formatRelativeTime, getDefaultStartTime, getDefaultEndTime } from '@/utils/helpers';

const statusConfig = {
  [LadderStatus.AVAILABLE]: {
    label: '可借',
    bgGradient: 'from-mint-400 via-mint-500 to-mint-600',
    bgSoft: 'bg-mint-50',
    border: 'border-mint-200',
    text: 'text-mint-700',
    dot: 'bg-mint-500',
    icon: CheckCircle2,
    emptyText: '暂无可用梯子',
  },
  [LadderStatus.RESERVED]: {
    label: '已预约',
    bgGradient: 'from-amber-400 via-amber-500 to-amber-600',
    bgSoft: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    icon: Clock,
    emptyText: '暂无预约',
  },
  [LadderStatus.BORROWED]: {
    label: '借出中',
    bgGradient: 'from-sky-400 via-sky-500 to-sky-600',
    bgSoft: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-700',
    dot: 'bg-sky-500',
    icon: HandCoins,
    emptyText: '暂无借出',
  },
  [LadderStatus.OVERDUE]: {
    label: '逾期未还',
    bgGradient: 'from-danger-400 via-danger-500 to-danger-600',
    bgSoft: 'bg-danger-50',
    border: 'border-danger-200',
    text: 'text-danger-700',
    dot: 'bg-danger-500',
    icon: AlertTriangle,
    emptyText: '暂无逾期，真好！',
  },
} as const;

export default function Home() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    ladders,
    reservations,
    borrowRecords,
    getLadderCurrentReservation,
    getLadderCurrentBorrow,
    getReservationBorrowRecord,
    getOverdueBorrowRecords,
    initSampleData,
    refreshLadderStatuses,
  } = useStore();

  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedLadderForBorrow, setSelectedLadderForBorrow] = useState<string | undefined>();
  const [selectedLadderForReturn, setSelectedLadderForReturn] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLadderId, setDrawerLadderId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
      refreshLadderStatuses();
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshLadderStatuses]);

  useEffect(() => {
    if (!initialized && reservations.length === 0 && borrowRecords.length === 0) {
      setTimeout(() => {
        initSampleData();
        setInitialized(true);
        showToast('已加载示例数据，方便您体验功能', 'info');
      }, 500);
    } else {
      setInitialized(true);
    }
  }, [initialized, reservations.length, borrowRecords.length, initSampleData, showToast]);

  const overdueItems = getOverdueBorrowRecords();

  const laddersByStatus = Object.values(LadderStatus).reduce((acc, status) => {
    acc[status] = ladders.filter((l) => l.status === status);
    return acc;
  }, {} as Record<LadderStatus, typeof ladders>);

  const statusOrder: LadderStatus[] = [
    LadderStatus.AVAILABLE,
    LadderStatus.RESERVED,
    LadderStatus.BORROWED,
    LadderStatus.OVERDUE,
  ];

  const handleQuickReserve = (ladderId: string) => {
    navigate(
      `/reserve?ladderId=${ladderId}&start=${encodeURIComponent(
        getDefaultStartTime().replace('T', ' ')
      )}&end=${encodeURIComponent(getDefaultEndTime().replace('T', ' '))}`
    );
  };

  const openBorrowModalFor = (ladderId?: string) => {
    setSelectedLadderForBorrow(ladderId);
    setBorrowModalOpen(true);
  };

  const openReturnModalFor = (ladderId?: string) => {
    setSelectedLadderForReturn(ladderId);
    setReturnModalOpen(true);
  };

  const openDetailDrawer = (ladderId: string) => {
    setDrawerLadderId(ladderId);
    setDrawerOpen(true);
  };

  const closeDetailDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setDrawerLadderId(null), 300);
  };

  const totalLadders = ladders.length;
  const availableCount = laddersByStatus[LadderStatus.AVAILABLE].length;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="section-title mb-1">
              今日梯况<span className="gradient-text"> · 一目了然</span>
            </h2>
            <p className="text-sm text-slate-500">
              当前时间 {now.toLocaleString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <QuickAction
              icon={ClipboardList}
              label="新建预约"
              onClick={() => navigate('/reserve')}
              variant="primary"
            />
            <QuickAction
              icon={LogOut}
              label="借出登记"
              onClick={() => openBorrowModalFor()}
            />
            <QuickAction
              icon={Undo2}
              label="归还登记"
              onClick={() => openReturnModalFor()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            icon={Sparkles}
            label="梯子总数"
            value={totalLadders}
            gradient="from-slate-500 to-slate-700"
          />
          <StatCard
            icon={CheckCircle2}
            label="当前可借"
            value={availableCount}
            gradient="from-mint-400 to-mint-600"
            highlight
          />
          <StatCard
            icon={HandCoins}
            label="使用中"
            value={laddersByStatus[LadderStatus.BORROWED].length}
            gradient="from-sky-400 to-sky-600"
          />
          <StatCard
            icon={AlertOctagon}
            label="逾期未还"
            value={overdueItems.length}
            gradient={overdueItems.length > 0 ? 'from-danger-400 to-danger-600' : 'from-slate-300 to-slate-500'}
          />
        </div>

        {overdueItems.length > 0 && (
          <div className="rounded-2xl overflow-hidden mb-6 shadow-card border border-danger-200 animate-slide-up">
            <div className="bg-gradient-to-r from-danger-500 via-danger-500 to-danger-600 px-5 py-3.5 flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-3 text-white">
                <div className="relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white animate-blink" />
                </div>
                <div>
                  <span className="font-semibold">逾期提醒</span>
                  <span className="ml-2 text-sm opacity-90">
                    · 共 {overdueItems.length} 项需关注
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <span>请尽快联系</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="bg-danger-50/70 px-5 py-4 space-y-2.5">
              {overdueItems.map(({ borrow, reservation, ladder }) => {
                const overdueMins = Math.floor(
                  (now.getTime() - new Date(reservation.expectedEndTime).getTime()) / 60000
                );
                const overdueHours = Math.floor(overdueMins / 60);
                return (
                  <div
                    key={borrow.id}
                    onClick={() => openDetailDrawer(ladder.id)}
                    className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white border border-danger-100 shadow-sm cursor-pointer hover:shadow-md hover:border-danger-200 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-danger-100 flex items-center justify-center flex-shrink-0">
                        <AlertOctagon className="w-4 h-4 text-danger-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">
                            {reservation.borrowerName}
                          </span>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {ladder.name}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          <span>{reservation.building}</span>
                          <span>·</span>
                          <span>📞 {reservation.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-danger-600 font-semibold">
                          逾期 {overdueHours > 0 ? `${overdueHours} 小时` : `${overdueMins} 分钟`}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          应还 {formatDateTime(reservation.expectedEndTime)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openReturnModalFor(ladder.id);
                        }}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-danger-200 text-danger-600 hover:bg-danger-50 hover:border-danger-300 transition-colors"
                      >
                        催还/登记
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {statusOrder.map((status, idx) => {
          const config = statusConfig[status];
          const list = laddersByStatus[status];
          const Icon = config.icon;
          return (
            <div
              key={status}
              className="card animate-slide-up"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              <div className={`bg-gradient-to-r ${config.bgGradient} px-5 py-4 flex items-center justify-between`}>
                <div className="flex items-center gap-3 text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <div>
                    <div className="text-sm opacity-90">{config.label}</div>
                    <div className="font-serif text-2xl font-bold leading-tight">
                      {list.length}
                      <span className="text-sm font-normal ml-1 opacity-80">台</span>
                    </div>
                  </div>
                </div>
                {status === LadderStatus.AVAILABLE && list.length > 0 && (
                  <button
                    onClick={() => navigate('/reserve')}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/25 hover:bg-white/35 backdrop-blur text-white transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    快速预约
                  </button>
                )}
              </div>

              <div className="p-4 sm:p-5 max-h-[380px] overflow-y-auto">
                {list.length === 0 ? (
                  <div className="py-8 text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl ${config.bgSoft} flex items-center justify-center`}>
                      <Icon className={`w-7 h-7 ${config.text} opacity-50`} />
                    </div>
                    <p className={`text-sm ${config.text} opacity-60`}>{config.emptyText}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {list.map((ladder) => {
                      const reservation = getLadderCurrentReservation(ladder.id);
                      const borrow = getLadderCurrentBorrow(ladder.id);
                      const borrowReservation = borrow
                        ? reservations.find((r) => r.id === borrow.reservationId)
                        : null;

                      const isClickable = status !== LadderStatus.AVAILABLE;
                      return (
                        <div
                          key={ladder.id}
                          onClick={() => isClickable && openDetailDrawer(ladder.id)}
                          className={`p-4 rounded-xl border ${config.border} ${config.bgSoft} hover:shadow-md transition-all duration-200 ${isClickable ? 'cursor-pointer hover:border-amber-300' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`status-dot ${config.dot} ${status === LadderStatus.OVERDUE ? 'animate-blink' : ''}`} />
                                <h4 className="font-semibold text-slate-800">{ladder.name}</h4>
                              </div>
                              <p className="text-xs text-slate-500">{ladder.type}</p>
                              {ladder.description && (
                                <p className="text-xs text-slate-400 mt-1">{ladder.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5 items-end">
                              {status === LadderStatus.AVAILABLE && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickReserve(ladder.id);
                                  }}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-mint-500 to-mint-600 text-white hover:shadow-md transition-all"
                                >
                                  立即预约
                                </button>
                              )}
                              {status === LadderStatus.BORROWED && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openReturnModalFor(ladder.id);
                                  }}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 transition-colors"
                                >
                                  登记归还
                                </button>
                              )}
                              {status === LadderStatus.OVERDUE && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openReturnModalFor(ladder.id);
                                  }}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-danger-200 text-danger-600 hover:bg-danger-50 transition-colors"
                                >
                                  立即催还
                                </button>
                              )}
                            </div>
                          </div>

                          {(reservation || borrowReservation) && (
                            <div className="pt-3 border-t border-white/60">
                              {status === LadderStatus.RESERVED && reservation && (
                                <ReservationInfo reservation={reservation} now={now} />
                              )}
                              {(status === LadderStatus.BORROWED || status === LadderStatus.OVERDUE) &&
                                borrowReservation && (
                                  <BorrowInfo
                                    reservation={borrowReservation}
                                    borrow={borrow!}
                                    now={now}
                                    onBorrowClick={() => openBorrowModalFor()}
                                    onReturnClick={() => openReturnModalFor(ladder.id)}
                                    ladderId={ladder.id}
                                    status={status}
                                  />
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BorrowModal
        isOpen={borrowModalOpen}
        onClose={() => setBorrowModalOpen(false)}
        ladderId={selectedLadderForBorrow}
      />
      <ReturnModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        ladderId={selectedLadderForReturn}
      />
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={closeDetailDrawer}
        ladderId={drawerLadderId}
        onOpenReturn={openReturnModalFor}
        onOpenBorrow={openBorrowModalFor}
      />
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: React.ComponentType<any>;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'default';
}) {
  const baseClass =
    'inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-medium text-sm transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-0.5 active:translate-y-0';
  const variantClass =
    variant === 'primary'
      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:shadow-glow-amber'
      : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-300';

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
      <span>{label}</span>
    </button>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  highlight,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  gradient: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-white border border-slate-100 shadow-soft ${
        highlight ? 'ring-2 ring-amber-200' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs sm:text-sm text-slate-500 mb-1.5">{label}</div>
          <div className={`font-serif text-3xl sm:text-4xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-none`}>
            {value}
          </div>
        </div>
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}>
          <Icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" strokeWidth={2.2} />
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-5 blur-xl`} />
    </div>
  );
}

function ReservationInfo({ reservation, now }: { reservation: ReturnType<typeof useStore.getState>['reservations'][number]; now: Date }) {
  const startDate = new Date(reservation.startTime);
  const startsSoon = startDate.getTime() - now.getTime() < 3600000 && startDate.getTime() > now.getTime();
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
          <User className="w-3 h-3" />
          {reservation.borrowerName}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white/60 px-2 py-0.5 rounded-md">
          <MapPin className="w-3 h-3" />
          {reservation.building}
        </span>
        {startsSoon && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-danger-600 bg-danger-50 px-2 py-0.5 rounded-md animate-pulse-slow">
            <Loader2 className="w-3 h-3 animate-spin" />
            即将开始
          </span>
        )}
      </div>
      <div className="text-xs text-slate-500 flex items-center gap-1.5">
        <CalendarClock className="w-3.5 h-3.5 text-amber-500" />
        <span>
          {formatDateTime(reservation.startTime)} ~ {formatDateTime(reservation.expectedEndTime)}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600">{reservation.purpose}</span>
        {reservation.needHelp && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-700">
            <HandHelping className="w-3 h-3" />
            需协助
          </span>
        )}
      </div>
    </div>
  );
}

function BorrowInfo({
  reservation,
  borrow,
  now,
  onReturnClick,
  ladderId,
  status,
}: {
  reservation: ReturnType<typeof useStore.getState>['reservations'][number];
  borrow: ReturnType<typeof useStore.getState>['borrowRecords'][number];
  now: Date;
  onBorrowClick?: () => void;
  onReturnClick: (ladderId: string) => void;
  ladderId: string;
  status: LadderStatus;
}) {
  const remaining = new Date(reservation.expectedEndTime).getTime() - now.getTime();
  const remainingHours = Math.max(0, Math.floor(remaining / 3600000));
  const remainingMins = Math.max(0, Math.floor((remaining % 3600000) / 60000));
  const isOverdue = status === LadderStatus.OVERDUE;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-md">
          <User className="w-3 h-3" />
          {reservation.borrowerName}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-white/60 px-2 py-0.5 rounded-md">
          <MapPin className="w-3 h-3" />
          {reservation.building}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-white/60 px-2 py-0.5 rounded-md">
          <Phone className="w-3 h-3" />
          {reservation.phone}
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>借出 {formatRelativeTime(borrow.borrowTime)}</span>
        </div>
        <div
          className={`font-semibold flex items-center gap-1 ${
            isOverdue ? 'text-danger-600' : remainingHours < 1 ? 'text-amber-600' : 'text-slate-600'
          }`}
        >
          {isOverdue ? (
            <>
              <AlertTriangle className="w-3.5 h-3.5" />
              已逾期
            </>
          ) : (
            <>
              <Clock className="w-3.5 h-3.5" />
              剩余 {remainingHours > 0 ? `${remainingHours}h` : ''}
              {remainingMins}m
            </>
          )}
        </div>
      </div>
      <div className="text-xs text-slate-500">
        预计可取：<span className="font-medium text-slate-700">{formatDateTime(reservation.expectedEndTime)}</span>
      </div>
    </div>
  );
}

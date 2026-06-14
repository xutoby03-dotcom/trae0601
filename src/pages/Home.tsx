import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CalendarDays, Package, RefreshCw, ChevronDown, Clock } from 'lucide-react';
import StatsOverview from '@/components/StatsOverview';
import DeptStats from '@/components/DeptStats';
import VisitorBoard from '@/components/VisitorBoard';
import ReminderBar from '@/components/ReminderBar';
import BookingModal from '@/components/BookingModal';
import DetailModal from '@/components/DetailModal';
import RestockPopover from '@/components/RestockPopover';
import { useAppStore } from '@/store/useAppStore';
import type { VisitorWithRelations } from '@/types';
import { formatDate } from '@/utils/dateUtils';

export default function Home() {
  const getVisitorsByGroup = useAppStore((s) => s.getVisitorsByGroup);
  const getStats = useAppStore((s) => s.getStats);
  const getPendingReminders = useAppStore((s) => s.getPendingReminders);
  const redeemTicket = useAppStore((s) => s.redeemTicket);
  const resetMock = useAppStore((s) => s.resetMock);
  const inventory = useAppStore((s) => s.ticketInventory);
  const employees = useAppStore((s) => s.employees);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [detailVisitorId, setDetailVisitorId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [restockOpen, setRestockOpen] = useState(false);
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const [tick, setTick] = useState(0);
  const [refreshVersion, setRefreshVersion] = useState(0);

  const restockAnchorRef = useRef<HTMLButtonElement>(null);

  const currentUser = employees.find((e) => e.id === currentUserId);
  const todayLabel = formatDate(new Date(), false);

  const lastRestock = inventory.restockHistory?.[0];
  const lastRestockOperator = lastRestock ? employees.find((e) => e.id === lastRestock.operatorId) : undefined;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => getStats(), [getStats, tick, refreshVersion]);
  const groups = useMemo(() => getVisitorsByGroup(), [getVisitorsByGroup, tick, refreshVersion]);
  const reminders = useMemo(
    () => getPendingReminders().filter((r) => !dismissedReminders.has(r.id)),
    [getPendingReminders, tick, dismissedReminders, refreshVersion],
  );

  function handleRedeemFromCard(v: VisitorWithRelations) {
    if (!v.ticket) return;
    redeemTicket(v.ticket.id);
    setRefreshVersion((v) => v + 1);
  }

  function handleDetailClick(v: VisitorWithRelations) {
    setDetailVisitorId(v.id);
    setDetailOpen(true);
  }

  function handleAddSuccess(visitorId: string) {
    setRefreshVersion((v) => v + 1);
    setDetailVisitorId(visitorId);
    setDetailOpen(true);
  }

  function handleRestockClick() {
    setRestockOpen((v) => !v);
  }

  function handleRestockSuccess() {
    setRefreshVersion((v) => v + 1);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-soft bg-white/80 border-b border-neutral-100">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1440px] py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-700 to-primary-800 shadow-md flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-neutral-800 leading-tight truncate">
                访客停车券管理
              </h1>
              <p className="text-[11px] lg:text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                <CalendarDays size={12} className="text-primary-500" />
                <span>{todayLabel}</span>
                <span className="text-neutral-300">·</span>
                <span>你好，{currentUser?.name || '管理员'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-3 shrink-0">
            <div className="relative flex items-center gap-2">
              {lastRestock && lastRestockOperator && (
                <div className="hidden min-[480px]:flex items-center gap-1 text-[11px] text-neutral-400 max-w-[220px]">
                  <Clock size={11} className="shrink-0" />
                  <span className="truncate">
                    <span className="hidden sm:inline">{lastRestockOperator.name} </span>
                    +{lastRestock.amount}张
                    <span className="hidden md:inline"> · {formatDate(lastRestock.operatedAt, true)}</span>
                  </span>
                </div>
              )}

              <button
                ref={restockAnchorRef}
                onClick={handleRestockClick}
                className={
                  'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ' +
                  (restockOpen
                    ? 'border-primary-400 bg-primary-50 shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-primary-300 hover:bg-primary-50/50')
                }
              >
                <div className={'relative w-2 h-2 rounded-full shrink-0 ' + (inventory.total - inventory.used < 20 ? 'bg-accent-500 animate-pulse-dot' : 'bg-mint-500')} />
                <Package size={13} className="text-neutral-400 shrink-0" />
                <span className={'font-mono text-sm font-bold leading-none ' + (inventory.total - inventory.used < 20 ? 'text-accent-600' : 'text-neutral-800')}>
                  {inventory.total - inventory.used}
                </span>
                <ChevronDown size={12} className={'text-neutral-400 shrink-0 transition-transform ' + (restockOpen ? 'rotate-180' : '')} />
              </button>

              <RestockPopover
                open={restockOpen}
                onClose={() => setRestockOpen(false)}
                anchorRef={restockAnchorRef}
                onSuccess={handleRestockSuccess}
              />
            </div>

            <button
              onClick={resetMock}
              title="重置为演示数据"
              className="w-9 h-9 rounded-lg border border-neutral-200 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition flex items-center justify-center shrink-0"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={() => setBookingOpen(true)}
              className="inline-flex items-center gap-2 px-4 lg:px-5 py-2 lg:py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 shadow-button hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">新增预约 & 发券</span>
              <span className="sm:hidden">发券</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 lg:px-6 py-5 lg:py-6 space-y-5 lg:space-y-6 max-w-[1440px]">
          {reminders.length > 0 && (
            <ReminderBar
              reminders={reminders}
              onDismiss={(id) =>
                setDismissedReminders((prev) => new Set(prev).add(id))
              }
              onRedeem={handleRedeemFromCard}
              onDetail={handleDetailClick}
            />
          )}

          <StatsOverview stats={stats} />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
            <div className="xl:col-span-1 order-2 xl:order-1">
              <DeptStats data={stats.deptUsage} />
            </div>
            <div className="xl:col-span-3 order-1 xl:order-2 min-w-0">
              <VisitorBoard
                groups={groups}
                onCardClick={handleDetailClick}
                onCardRedeem={handleRedeemFromCard}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-neutral-100 bg-white/60">
        <div className="container mx-auto px-4 lg:px-6 max-w-[1440px] text-center text-xs text-neutral-400">
          访客停车券管理系统 · 数据本地存储，刷新不丢失 · v1.0
        </div>
      </footer>

      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={handleAddSuccess}
      />
      <DetailModal
        open={detailOpen}
        visitorId={detailVisitorId}
        onClose={() => {
          setDetailOpen(false);
          setDetailVisitorId(null);
        }}
        onRedeem={() => setRefreshVersion((v) => v + 1)}
      />
    </div>
  );
}

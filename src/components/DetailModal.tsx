import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  User,
  Building2,
  Car,
  Users,
  MapPin,
  Calendar,
  Phone,
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  QrCode,
} from 'lucide-react';
import type { VisitorWithRelations } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, formatDuration, friendlyDateLabel } from '@/utils/dateUtils';
import { useState } from 'react';

interface Props {
  open: boolean;
  visitorId: string | null;
  onClose: () => void;
  onRedeem?: (ticketId: string) => void;
}

export default function DetailModal({ open, visitorId, onClose, onRedeem }: Props) {
  const getVisitorRelations = useAppStore((s) => s.getVisitorRelations);
  const redeemTicket = useAppStore((s) => s.redeemTicket);
  const [redeeming, setRedeeming] = useState(false);

  const visitor = visitorId ? getVisitorRelations(visitorId) : undefined;
  const ticket = visitor?.ticket;
  const isUsed = ticket?.isUsed;

  function handleRedeem() {
    if (!ticket || isUsed) return;
    setRedeeming(true);
    setTimeout(() => {
      const updated = redeemTicket(ticket.id);
      if (updated) onRedeem?.(updated.id);
      setRedeeming(false);
    }, 500);
  }

  return (
    <AnimatePresence>
      {open && visitor && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-soft"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-hidden rounded-card bg-white shadow-card-hover"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <Header visitor={visitor} onClose={onClose} />

            <div className="overflow-y-auto max-h-[calc(90vh-260px)] px-7 py-6 space-y-6 scrollbar-thin">
              <InfoSection title="访客信息">
                <InfoRow icon={<User size={16} />} label="姓名" value={visitor.name} />
                <InfoRow icon={<Building2 size={16} />} label="所属公司" value={visitor.company} />
                <InfoRow
                  icon={<Car size={16} />}
                  label="车牌号"
                  value={
                    <span className="font-mono bg-neutral-800 text-white px-2.5 py-1 rounded-md text-sm tracking-wider">
                      {visitor.plateNumber}
                    </span>
                  }
                />
                <InfoRow
                  icon={<Users size={16} />}
                  label="到访部门"
                  value={
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-medium"
                      style={{ color: visitor.department?.color }}
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ background: visitor.department?.color }}
                      />
                      {visitor.department?.name}
                    </span>
                  }
                />
                <InfoRow icon={<MapPin size={16} />} label="会议室" value={visitor.meetingRoom} />
                <InfoRow
                  icon={<User size={16} />}
                  label="接待人"
                  value={
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-800">{visitor.host?.name}</span>
                      <a
                        href={`tel:${visitor.host?.phone}`}
                        className="text-xs flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        <Phone size={12} />
                        {visitor.host?.phone}
                      </a>
                    </div>
                  }
                />
                <InfoRow
                  icon={<Calendar size={16} />}
                  label="预计到离"
                  value={
                    <div className="text-sm">
                      <div className="text-neutral-700">到达 · {friendlyDateLabel(visitor.expectedArrival)}</div>
                      <div className="text-neutral-500 mt-0.5">离开 · {friendlyDateLabel(visitor.expectedDeparture)}</div>
                    </div>
                  }
                />
              </InfoSection>

              <InfoSection title="停车券信息">
                {ticket ? (
                  <>
                    <TicketBanner
                      ticketNumber={ticket.ticketNumber}
                      isUsed={ticket.isUsed}
                      validHours={ticket.validHours}
                    />
                    <InfoRow
                      icon={<QrCode size={16} />}
                      label="券号"
                      value={
                        <span className="font-mono text-sm font-semibold text-primary-700 tracking-wider">
                          {ticket.ticketNumber}
                        </span>
                      }
                    />
                    <InfoRow
                      icon={<Clock size={16} />}
                      label="有效时长"
                      value={formatDuration(ticket.validHours)}
                    />
                    <InfoRow
                      icon={<User size={16} />}
                      label="发放人"
                      value={visitor.issuer?.name || '-'}
                    />
                    <InfoRow
                      icon={<Calendar size={16} />}
                      label="发放时间"
                      value={formatDate(ticket.issuedAt, true)}
                    />
                    {ticket.isUsed ? (
                      <>
                        <InfoRow
                          icon={<CheckCircle2 size={16} />}
                          label="核销时间"
                          value={ticket.usedAt ? formatDate(ticket.usedAt, true) : '-'}
                        />
                        <InfoRow
                          icon={<Clock size={16} />}
                          label="实际停车时长"
                          value={
                            ticket.actualDuration != null ? (
                              <span className="font-semibold text-mint-600">
                                {formatDuration(ticket.actualDuration)}
                              </span>
                            ) : (
                              '-'
                            )
                          }
                        />
                      </>
                    ) : null}
                  </>
                ) : (
                  <div className="py-8 text-center text-neutral-400 text-sm">
                    <AlertTriangle size={32} className="mx-auto mb-2 text-neutral-300" />
                    暂无停车券记录
                  </div>
                )}
              </InfoSection>
            </div>

            <div className="px-7 py-4 border-t border-neutral-100 flex items-center justify-between bg-neutral-50/50">
              <StatusBadge used={isUsed} />
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-600 hover:bg-white border border-neutral-200 transition"
                >
                  关闭
                </button>
                {ticket && !isUsed && (
                  <button
                    onClick={handleRedeem}
                    disabled={redeeming}
                    className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-mint-500 text-white hover:bg-mint-600 shadow-button hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
                  >
                    {redeeming ? '核销中...' : '立即核销'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({ visitor, onClose }: { visitor: VisitorWithRelations; onClose: () => void }) {
  return (
    <div className="relative px-7 py-5 border-b border-neutral-100 overflow-hidden">
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${visitor.department?.color || '#1E3A5F'} 1px, transparent 0)`,
          backgroundSize: '16px 16px',
        }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
            style={{ background: `linear-gradient(135deg, ${visitor.department?.color || '#1E3A5F'}, ${visitor.department?.color || '#1E3A5F'}cc)` }}
          >
            {visitor.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-800">{visitor.name}</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{visitor.company}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-white/60 transition flex items-center justify-center"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-3 px-0.5">{title}</h3>
      <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 divide-y divide-neutral-100/70">
        {children}
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="w-8 h-8 rounded-lg bg-white border border-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
        {icon}
      </div>
      <div className="w-20 text-sm text-neutral-500 shrink-0">{label}</div>
      <div className="flex-1 text-sm text-neutral-800 min-w-0">{value}</div>
    </div>
  );
}

function TicketBanner({
  ticketNumber,
  isUsed,
  validHours,
}: {
  ticketNumber: string;
  isUsed: boolean;
  validHours: number;
}) {
  return (
    <div className="mb-3 relative overflow-hidden rounded-xl">
      <div
        className={
          'px-5 py-4 flex items-center justify-between ' +
          (isUsed
            ? 'bg-gradient-to-br from-mint-500 to-mint-600 text-white'
            : 'bg-gradient-to-br from-primary-700 to-primary-800 text-white')
        }
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
            <Ticket size={20} />
          </div>
          <div>
            <div className="text-[11px] opacity-75 font-medium">停车券 · PARKING TICKET</div>
            <div className="font-mono text-xl font-bold tracking-wider mt-0.5">{ticketNumber}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] opacity-75 font-medium">有效时长</div>
          <div className="text-lg font-bold">{validHours}h</div>
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 left-[-8px] w-4 h-4 rounded-full bg-white" />
      <div className="absolute top-1/2 -translate-y-1/2 right-[-8px] w-4 h-4 rounded-full bg-white" />
    </div>
  );
}

function StatusBadge({ used }: { used?: boolean }) {
  if (used) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mint-50 text-mint-600 text-xs font-semibold border border-mint-100">
        <CheckCircle2 size={14} />
        已核销
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold border border-accent-100 animate-breathe">
      <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse-dot" />
      待核销
    </span>
  );
}

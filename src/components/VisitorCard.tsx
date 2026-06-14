import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Ticket as TicketIcon,
  User,
} from 'lucide-react';
import type { VisitorWithRelations } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface Props {
  visitor: VisitorWithRelations;
  onClick?: () => void;
  onRedeem?: () => void;
  index?: number;
  overdue?: boolean;
}

export default function VisitorCard({ visitor, onClick, onRedeem, index = 0, overdue }: Props) {
  const ticket = visitor.ticket;
  const isUsed = ticket?.isUsed;
  const deptColor = visitor.department?.color || '#1E3A5F';

  return (
    <motion.article
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={
        'group relative cursor-pointer rounded-card bg-white border p-4 shadow-sm hover:shadow-card-hover transition-all duration-300 overflow-hidden ' +
        (overdue
          ? 'border-accent-200 hover:border-accent-300'
          : 'border-neutral-100 hover:border-primary-200')
      }
    >
      {overdue && (
        <div className="absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 bg-gradient-to-br from-accent-500/10 to-transparent rounded-full pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3 relative">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md"
            style={{ background: `linear-gradient(135deg, ${deptColor}, ${deptColor}dd)` }}
          >
            {visitor.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-neutral-800 truncate">{visitor.name}</h4>
              {ticket && (
                <StatusBadge used={isUsed} overdue={overdue} />
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{visitor.company}</p>
          </div>
        </div>
        {ticket && (
          <div
            className={
              'px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold tracking-wide shrink-0 ' +
              (isUsed
                ? 'bg-mint-50 text-mint-600 border border-mint-100'
                : 'bg-primary-700/5 text-primary-700 border border-primary-100')
            }
            title={`券号 ${ticket.ticketNumber}`}
          >
            {ticket.ticketNumber.slice(-6)}
          </div>
        )}
      </div>

      <div className="space-y-2 mb-3.5">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="px-2 py-0.5 rounded-md font-mono font-semibold tracking-wider shrink-0 bg-neutral-800 text-white"
          >
            {visitor.plateNumber}
          </span>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-medium shrink-0"
            style={{
              background: deptColor + '15',
              color: deptColor,
            }}
          >
            {visitor.department?.name}
          </span>
          <span className="inline-flex items-center gap-1 text-neutral-500 min-w-0 truncate">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{visitor.meetingRoom}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100/70">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
            <User size={12} />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-neutral-700 truncate">
              {visitor.host?.name || '-'}
            </div>
            <div className="text-[11px] text-neutral-400 truncate">
              {formatTime(visitor.expectedArrival)} → {formatTime(visitor.expectedDeparture)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {ticket && !isUsed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRedeem?.();
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-mint-50 text-mint-600 hover:bg-mint-100 border border-mint-100 transition opacity-0 group-hover:opacity-100"
            >
              <CheckCircle2 size={12} />
              核销
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-100 transition"
          >
            <Eye size={12} />
            详情
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function StatusBadge({ used, overdue }: { used?: boolean; overdue?: boolean }) {
  if (used) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-mint-600 bg-mint-50 px-1.5 py-0.5 rounded border border-mint-100">
        <CheckCircle2 size={10} />
        已核销
      </span>
    );
  }
  if (overdue) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded border border-accent-100 animate-breathe">
        <Clock size={10} />
        已超时
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent-500 bg-accent-50 px-1.5 py-0.5 rounded border border-accent-100">
      <TicketIcon size={10} />
      待核销
    </span>
  );
}

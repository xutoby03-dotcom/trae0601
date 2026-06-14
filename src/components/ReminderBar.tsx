import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Phone, X, MessageCircle, Clock } from 'lucide-react';
import type { VisitorWithRelations } from '@/types';
import { formatTime } from '@/utils/dateUtils';

interface Props {
  reminders: VisitorWithRelations[];
  onDismiss?: (visitorId: string) => void;
  onRedeem?: (visitor: VisitorWithRelations) => void;
  onDetail?: (visitor: VisitorWithRelations) => void;
}

export default function ReminderBar({ reminders, onDismiss, onRedeem, onDetail }: Props) {
  if (reminders.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-card border border-accent-200 bg-gradient-to-r from-accent-50 via-accent-50/80 to-white overflow-hidden shadow-sm"
    >
      <div className="flex items-stretch">
        <div className="w-1.5 bg-gradient-to-b from-accent-400 to-accent-500 shrink-0" />
        <div className="flex-1 px-4 py-3 flex items-center gap-4 min-w-0 overflow-x-auto scrollbar-thin">
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-accent-100">
            <div className="relative">
              <Bell size={16} className="text-accent-600" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent-500 animate-pulse-dot" />
            </div>
            <div className="text-xs">
              <div className="font-bold text-accent-700">离场提醒</div>
              <div className="text-accent-500">{reminders.length} 位访客待确认</div>
            </div>
          </div>

          <ul className="flex items-center gap-3 flex-1 min-w-0">
            <AnimatePresence>
              {reminders.slice(0, 5).map((r) => (
                <ReminderItem
                  key={r.id}
                  reminder={r}
                  onDismiss={onDismiss}
                  onRedeem={onRedeem}
                  onDetail={onDetail}
                />
              ))}
            </AnimatePresence>
            {reminders.length > 5 && (
              <li className="shrink-0 text-xs text-accent-600 font-semibold px-2">
                +{reminders.length - 5} 更多
              </li>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function ReminderItem({
  reminder,
  onDismiss,
  onRedeem,
  onDetail,
}: {
  reminder: VisitorWithRelations;
  onDismiss?: (id: string) => void;
  onRedeem?: (r: VisitorWithRelations) => void;
  onDetail?: (r: VisitorWithRelations) => void;
}) {
  const minsLeft = Math.max(
    0,
    Math.round((new Date(reminder.expectedDeparture).getTime() - Date.now()) / 60000),
  );

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="shrink-0 group relative"
    >
      <div
        onClick={() => onDetail?.(reminder)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-accent-100 hover:border-accent-300 hover:shadow-sm transition-all cursor-pointer"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{
            background: `linear-gradient(135deg, ${reminder.department?.color || '#FF7A45'}, ${reminder.department?.color || '#FF7A45'}cc)`,
          }}
        >
          {reminder.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-neutral-800 truncate max-w-[70px]">
              {reminder.name}
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-100 text-accent-700 shrink-0">
              <Clock size={9} />
              {minsLeft > 0 ? `${minsLeft}分` : '即将'}
            </span>
          </div>
          <div className="text-[11px] text-neutral-500 truncate max-w-[140px]">
            {reminder.host?.name || '-'} · {formatTime(reminder.expectedDeparture)}离场
          </div>
        </div>

        <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={`tel:${reminder.host?.phone}`}
            onClick={(e) => e.stopPropagation()}
            title={`致电 ${reminder.host?.name}`}
            className="w-6.5 h-6.5 p-1 rounded-md text-neutral-500 hover:text-primary-600 hover:bg-primary-50 transition"
          >
            <Phone size={13} />
          </a>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRedeem?.(reminder);
            }}
            title="快速核销"
            className="w-6.5 h-6.5 p-1 rounded-md text-neutral-500 hover:text-mint-600 hover:bg-mint-50 transition"
          >
            <MessageCircle size={13} />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss?.(reminder.id);
          }}
          className="w-5 h-5 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition"
        >
          <X size={12} />
        </button>
      </div>
    </motion.li>
  );
}

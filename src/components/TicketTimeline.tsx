import { Clock, Wrench, Package, CheckCircle2, Circle } from 'lucide-react';
import type { Ticket, TicketStatus } from '@/types';
import { STATUS_LABEL } from '@/types';
import { formatFullDate } from '@/utils/format';

const order: TicketStatus[] = ['pending', 'processing', 'waiting_parts', 'completed'];
const iconMap = { pending: Clock, processing: Wrench, waiting_parts: Package, completed: CheckCircle2 };
const colorMap = {
  pending: 'bg-amber-500 border-amber-500 text-amber-500',
  processing: 'bg-teal-600 border-teal-600 text-teal-600',
  waiting_parts: 'bg-violet-500 border-violet-500 text-violet-500',
  completed: 'bg-emerald-500 border-emerald-500 text-emerald-500',
};

export default function TicketTimeline({ ticket }: { ticket: Ticket }) {
  const currentIdx = order.indexOf(ticket.status);

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-cream-200" />
      <div className="space-y-5">
        {order.map((status, idx) => {
          const Icon = iconMap[status];
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const entry = ticket.statusHistory.find((h) => h.status === status);
          const color = colorMap[status];
          const bgColor = color.split(' ')[0];
          const borderColor = color.split(' ')[1];
          const textColor = color.split(' ')[2];

          return (
            <div key={status} className="relative flex items-start gap-4 pl-1">
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 flex-shrink-0 ${
                  done ? `${bgColor} ${borderColor}` : 'bg-white border-ink-100'
                } ${active ? 'ring-4 ring-offset-2 ring-offset-cream-50 ' + borderColor.replace('border-', 'ring-').replace('-500', '-100').replace('-600', '-100') : ''}`}
              >
                {done ? (
                  <Icon className={`w-4 h-4 text-white ${active ? 'animate-pulse-soft' : ''}`} />
                ) : (
                  <Circle className="w-4 h-4 text-ink-200" />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-semibold text-sm ${done ? 'text-ink-500' : 'text-ink-200'}`}>
                    {STATUS_LABEL[status]}
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                      当前
                    </span>
                  )}
                </div>
                {entry && (
                  <div className={`text-xs mt-0.5 ${textColor}`}>
                    {formatFullDate(entry.timestamp)}
                    {entry.operator && ` · ${entry.operator}`}
                  </div>
                )}
                {!entry && <div className="text-xs mt-0.5 text-ink-200">尚未到达此阶段</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

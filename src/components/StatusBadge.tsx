import { AlertTriangle, Clock, Wrench, Package, CheckCircle2 } from 'lucide-react';
import type { TicketStatus, UrgencyLevel } from '@/types';
import { STATUS_COLOR, STATUS_LABEL } from '@/types';

const statusIcon = {
  pending: Clock,
  processing: Wrench,
  waiting_parts: Package,
  completed: CheckCircle2,
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = STATUS_COLOR[status];
  const Icon = statusIcon[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function UrgencyBadge({ urgency }: { urgency: UrgencyLevel }) {
  if (urgency === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm">
        <AlertTriangle className="w-3.5 h-3.5" />
        紧急
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
      普通
    </span>
  );
}

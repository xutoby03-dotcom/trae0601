import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Wrench, ChevronRight, AlertTriangle } from 'lucide-react';
import type { Ticket } from '@/types';
import { StatusBadge, UrgencyBadge } from './StatusBadge';
import { formatDateTime } from '@/utils/format';

interface Props {
  ticket: Ticket;
  showQueue?: boolean;
  compact?: boolean;
}

export default function TicketCard({ ticket, showQueue = false, compact = false }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/ticket/${ticket.id}`)}
      className="group bg-white rounded-2xl border border-teal-600/8 shadow-card hover:shadow-cardHover hover:-translate-y-0.5 transition-all cursor-pointer overflow-hidden animate-slide-up"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-display text-base font-bold text-ink-500 truncate">{ticket.faultType}</span>
              <UrgencyBadge urgency={ticket.urgency} />
            </div>
            <div className="flex items-center gap-1 text-xs text-ink-300">
              <MapPin className="w-3 h-3" />
              <span className="font-medium">{ticket.building} {ticket.room}</span>
              <span className="mx-1">·</span>
              <span>报修人 {ticket.studentName}</span>
            </div>
          </div>
          <StatusBadge status={ticket.status} />
        </div>

        {!compact && (
          <p className="text-sm text-ink-400 line-clamp-2 mb-3 leading-relaxed">{ticket.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-teal-600/5">
          <div className="flex items-center gap-3 text-xs text-ink-300">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDateTime(ticket.createdAt)}
            </div>
            {ticket.assignedWorker && (
              <div className="flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                {ticket.assignedWorker}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showQueue && ticket.status === 'pending' && ticket.queuePosition && (
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${ticket.urgency === 'urgent' ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-700'}`}>
                <AlertTriangle className="w-3 h-3" />
                排队 #{ticket.queuePosition}
              </div>
            )}
            <ChevronRight className="w-4 h-4 text-ink-200 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>

      {ticket.urgency === 'urgent' && (
        <div className="h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400" />
      )}
    </div>
  );
}

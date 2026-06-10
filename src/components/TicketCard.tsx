import { Ticket } from '@/types';
import { formatTicketNumber, formatTime, formatWaitTime, calculateWaitTime, getQueuePosition } from '@/utils/helpers';
import { useQueueStore } from '@/store/queueStore';
import { Clock, Users, AlertTriangle, CheckCircle2, XCircle, Timer } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  showDetails?: boolean;
  isUpcoming?: boolean;
  onClick?: () => void;
}

const statusConfig = {
  waiting: {
    label: '等待中',
    icon: <Clock className="w-4 h-4" />,
    bg: 'glass',
    text: 'text-white/80',
    border: 'border-white/10',
  },
  calling: {
    label: '正在叫号',
    icon: <Timer className="w-4 h-4" />,
    bg: 'glass-green',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  served: {
    label: '已完成',
    icon: <CheckCircle2 className="w-4 h-4" />,
    bg: 'bg-white/5',
    text: 'text-white/50',
    border: 'border-white/5',
  },
  passed: {
    label: '已过号',
    icon: <XCircle className="w-4 h-4" />,
    bg: 'glass-yellow',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
};

export default function TicketCard({ ticket, showDetails = false, isUpcoming = false, onClick }: TicketCardProps) {
  const { queue, tickets } = useQueueStore();
  const config = statusConfig[ticket.status];
  const position = getQueuePosition(ticket, tickets);
  const waitTime = queue ? calculateWaitTime(position, queue.estimatedTimePerPerson) : 0;

  return (
    <div
      onClick={onClick}
      className={`${config.bg} ${config.border} border rounded-2xl p-4 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02]' : ''
      } ${isUpcoming ? 'ring-2 ring-amber-500/50 animate-pulse-slow' : ''} ${
        ticket.status === 'calling' ? 'animate-glow' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className={`font-display font-bold text-2xl ${
            ticket.status === 'calling' ? 'text-gradient-green' : 
            ticket.status === 'passed' ? 'text-gradient-yellow' : 'text-white'
          }`}>
            {formatTicketNumber(ticket.number)}
          </div>
          <div className="text-sm text-white/50">{ticket.nickname}</div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.text} bg-black/20`}>
          {config.icon}
          {config.label}
        </div>
      </div>

      {showDetails && (
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Users className="w-4 h-4" />
            <span>{ticket.peopleCount} 人</span>
          </div>
          {ticket.phoneLast4 && (
            <div className="flex items-center gap-2 text-white/60">
              <span>尾号 {ticket.phoneLast4}</span>
            </div>
          )}
          {ticket.note && (
            <div className="text-white/60">
              备注：{ticket.note}
            </div>
          )}
          {ticket.allowSkip && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>愿意过号</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
        <span>{formatTime(ticket.createdAt)} 取号</span>
        {ticket.status === 'waiting' && queue && (
          <span className="text-primary-400 font-medium">
            前方 {position} 位 · {formatWaitTime(waitTime)}
          </span>
        )}
        {ticket.passedCount > 0 && (
          <span className="text-amber-400">过号 {ticket.passedCount} 次</span>
        )}
      </div>
    </div>
  );
}

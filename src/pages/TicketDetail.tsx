import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Ticket as TicketIcon,
  Clock,
  Users,
  AlertTriangle,
  Phone,
  FileText,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import { useQueueStore } from '@/store/queueStore';
import {
  formatTicketNumber,
  formatTime,
  formatWaitTime,
  calculateWaitTime,
  getQueuePosition,
  getNearbyMessage,
} from '@/utils/helpers';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { queue, tickets, getTicketById } = useQueueStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  const ticket = id ? getTicketById(id) : undefined;
  const position = ticket ? getQueuePosition(ticket, tickets) : -1;
  const waitTime = queue && ticket
    ? formatWaitTime(calculateWaitTime(position, queue.estimatedTimePerPerson))
    : '';
  const nearbyMessage = getNearbyMessage(position);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!ticket || !queue) {
    return (
      <div className="min-h-screen">
        <NavHeader />
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="glass rounded-3xl p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">号码不存在</h2>
            <p className="text-white/60 mb-6">
              找不到该取号记录，请重新取号
            </p>
            <Link to="/ticket" className="btn-primary inline-flex items-center gap-2">
              重新取号
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const statusConfig = {
    waiting: {
      label: '等待中',
      color: 'text-white',
      bg: 'glass',
      border: 'border-white/10',
    },
    calling: {
      label: '正在叫号',
      color: 'text-emerald-400',
      bg: 'glass-green',
      border: 'border-emerald-500/30',
    },
    served: {
      label: '已完成',
      color: 'text-white/50',
      bg: 'bg-white/5',
      border: 'border-white/5',
    },
    passed: {
      label: '已过号',
      color: 'text-amber-400',
      bg: 'glass-yellow',
      border: 'border-amber-500/30',
    },
  };

  const config = statusConfig[ticket.status];

  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="max-w-lg mx-auto px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回大屏
        </Link>

        <div className={`${config.bg} ${config.border} border rounded-3xl p-8 mb-6 ${
          ticket.status === 'calling' ? 'animate-glow' : ''
        }`}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-500/20 mb-4">
              <TicketIcon className="w-8 h-8 text-primary-400" />
            </div>
            <div className={`text-sm font-medium mb-2 ${config.color}`}>
              {config.label}
            </div>
            <div className={`font-display font-bold text-7xl ${
              ticket.status === 'calling' ? 'text-gradient-green' :
              ticket.status === 'passed' ? 'text-gradient-yellow' : 'text-white'
            }`}>
              {formatTicketNumber(ticket.number)}
            </div>
          </div>

          {ticket.status === 'calling' && (
            <div className="glass-green rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3 text-emerald-400">
                <Volume2 className="w-6 h-6 animate-pulse" />
                <span className="text-lg font-semibold">正在叫您的号！请到前台</span>
              </div>
            </div>
          )}

          {ticket.status === 'passed' && (
            <div className="glass-yellow rounded-2xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-lg font-semibold">您已过号，已排到队尾</span>
              </div>
            </div>
          )}

          {ticket.status === 'waiting' && nearbyMessage && (
            <div className="glass-yellow rounded-2xl p-4 mb-6 animate-pulse-slow">
              <div className="flex items-center justify-center gap-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">{nearbyMessage}</span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-white/60">
                <Users className="w-5 h-5" />
                <span>人数</span>
              </div>
              <span className="font-semibold text-white">{ticket.peopleCount} 人</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-white/60">
                <Phone className="w-5 h-5" />
                <span>手机尾号</span>
              </div>
              <span className="font-semibold text-white">{ticket.phoneLast4}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-white/10">
              <div className="flex items-center gap-3 text-white/60">
                <Clock className="w-5 h-5" />
                <span>取号时间</span>
              </div>
              <span className="font-semibold text-white">{formatTime(ticket.createdAt)}</span>
            </div>

            {ticket.status === 'waiting' && (
              <>
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3 text-white/60">
                    <Clock className="w-5 h-5" />
                    <span>前方等待</span>
                  </div>
                  <span className="font-semibold text-white">{position} 位</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div className="flex items-center gap-3 text-white/60">
                    <Clock className="w-5 h-5" />
                    <span>预计等待</span>
                  </div>
                  <span className="font-semibold text-primary-400">{waitTime}</span>
                </div>
              </>
            )}

            {ticket.note && (
              <div className="py-3 border-b border-white/10">
                <div className="flex items-center gap-3 text-white/60 mb-2">
                  <FileText className="w-5 h-5" />
                  <span>备注</span>
                </div>
                <div className="text-white">{ticket.note}</div>
              </div>
            )}

            {ticket.allowSkip && (
              <div className="flex items-center gap-3 py-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span>您已选择愿意过号</span>
              </div>
            )}

            {ticket.passedCount > 0 && (
              <div className="flex items-center gap-3 py-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <span>已过号 {ticket.passedCount} 次</span>
              </div>
            )}
          </div>
        </div>

        {ticket.status === 'waiting' && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">当前时间</span>
              <span className="text-white font-mono">
                {currentTime.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </div>
        )}

        {ticket.status === 'served' && ticket.completedAt && (
          <div className="glass rounded-2xl p-6 text-center">
            <div className="text-emerald-400 mb-2">✓ 服务已完成</div>
            <div className="text-white/60 text-sm">
              完成时间：{formatTime(ticket.completedAt)}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

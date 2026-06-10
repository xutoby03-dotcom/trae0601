import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Volume2, Users, Clock, AlertTriangle, Play, Pause } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import TicketCard from '@/components/TicketCard';
import { useQueueStore } from '@/store/queueStore';
import {
  formatTicketNumber,
  getCallingTicket,
  getWaitingList,
  getPassedList,
  getUpcomingTickets,
  formatWaitTime,
  calculateWaitTime,
} from '@/utils/helpers';

export default function QueueDisplay() {
  const { queue, tickets } = useQueueStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animateNumber, setAnimateNumber] = useState(false);

  const callingTicket = getCallingTicket(tickets);
  const waitingList = getWaitingList(tickets);
  const passedList = getPassedList(tickets);
  const upcomingTickets = getUpcomingTickets(tickets, 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (callingTicket) {
      setAnimateNumber(true);
      const timer = setTimeout(() => setAnimateNumber(false), 600);
      return () => clearTimeout(timer);
    }
  }, [callingTicket?.number]);

  if (!queue) return null;

  const estimatedWait = waitingList.length > 0 && queue
    ? formatWaitTime(calculateWaitTime(waitingList.length, queue.estimatedTimePerPerson))
    : '无需等待';

  return (
    <div className="min-h-screen">
      <NavHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-display mb-1">
              排队大屏
            </h1>
            <p className="text-white/60 text-sm">
              {currentTime.toLocaleString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {queue.isPaused && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">暂停接单</span>
              </div>
            )}
            <Link
              to="/ticket"
              className="btn-primary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              取号
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">当前叫号</div>
            <div className="text-2xl font-bold font-display text-emerald-400">
              {callingTicket ? formatTicketNumber(callingTicket.number) : '--'}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">等待中</div>
            <div className="text-2xl font-bold font-display text-white">
              {waitingList.length} 位
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">已过号</div>
            <div className="text-2xl font-bold font-display text-amber-400">
              {passedList.length} 位
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="text-white/50 text-sm mb-1">预计等待</div>
            <div className="text-2xl font-bold font-display text-primary-400">
              {estimatedWait}
            </div>
          </div>
        </div>

        {callingTicket && (
          <div className="glass-green rounded-3xl p-8 mb-8 text-center animate-glow">
            <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
              <Volume2 className="w-6 h-6 animate-pulse" />
              <span className="text-lg font-semibold">正在叫号</span>
            </div>
            <div className={`font-display font-bold text-8xl md:text-9xl text-gradient-green mb-4 ${
              animateNumber ? 'animate-number-pop' : ''
            }`}>
              {formatTicketNumber(callingTicket.number)}
            </div>
            <div className="text-2xl text-white/80 mb-2">
              {callingTicket.nickname}
            </div>
            <div className="text-white/50">
              {callingTicket.peopleCount} 人 · 尾号 {callingTicket.phoneLast4}
            </div>
            {callingTicket.note && (
              <div className="mt-3 text-white/60 text-sm">
                备注：{callingTicket.note}
              </div>
            )}
          </div>
        )}

        {!callingTicket && waitingList.length === 0 && (
          <div className="glass rounded-3xl p-12 mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
              <Play className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white mb-2">暂无排队</div>
            <div className="text-white/50">点击右上角「取号」开始</div>
          </div>
        )}

        {upcomingTickets.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold">快轮到了</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingTickets.map((ticket, index) => (
                <div key={ticket.id} className="relative">
                  <TicketCard ticket={ticket} isUpcoming={index === 0} />
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-xs font-bold text-white shadow-lg">
                      下一位
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {waitingList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-semibold">等待中 ({waitingList.length})</h2>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {waitingList.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>
          )}

          {passedList.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold">已过号 ({passedList.length})</h2>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {passedList.map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

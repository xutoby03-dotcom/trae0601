import { BookPlus, UserPlus, BookCopy, HandHeart, RotateCcw, MessageSquare } from 'lucide-react';
import type { BorrowAction } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatRelative } from '@/utils/dateUtils';

interface TimelineEvent {
  id: string;
  action: BorrowAction;
  userId: string;
  date: string;
  extra?: string;
}

const actionConfig: Record<BorrowAction, { icon: typeof BookPlus; label: string; color: string; ring: string }> = {
  register: { icon: BookPlus, label: '登记入柜', color: 'bg-accent-olive text-white', ring: 'ring-accent-olive/30' },
  borrow: { icon: BookCopy, label: '借出', color: 'bg-accent-orange text-white', ring: 'ring-accent-orange/30' },
  return: { icon: RotateCcw, label: '归还', color: 'bg-sky-600 text-white', ring: 'ring-sky-600/30' },
  claim: { icon: HandHeart, label: '领取带走', color: 'bg-emerald-600 text-white', ring: 'ring-emerald-600/30' },
};

export const ActivityTimeline = ({ events }: { events: TimelineEvent[] }) => {
  const users = useAppStore((s) => s.users);
  const getUser = (id: string) => users.find((u) => u.id === id);

  return (
    <div className="relative pl-8">
      <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-wood-200 via-wood-300 to-wood-200 rounded-full" />
      <div className="space-y-5">
        {events.map((ev, i) => {
          const cfg = actionConfig[ev.action];
          const Icon = cfg.icon;
          const user = getUser(ev.userId);
          return (
            <div key={ev.id} className="relative group">
              <div
                className={`absolute -left-8 top-0.5 w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center shadow-md ring-4 ${cfg.ring} transition-transform group-hover:scale-110`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="card-paper p-4 ml-2 hover:shadow-paper-raised transition-all duration-300 group-hover:-translate-y-0.5">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-paper-200 text-wood-700 text-xs font-semibold">
                      {cfg.label}
                    </span>
                    {user && (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className="w-5 h-5 rounded-full bg-gradient-to-br from-accent-olive to-emerald-700 flex items-center justify-center text-white text-[10px] font-bold">
                          {user.nickname.charAt(0)}
                        </span>
                        <span className="text-wood-700 font-medium">{user.nickname}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-wood-500 font-mono whitespace-nowrap">
                    {formatRelative(ev.date)}
                  </span>
                </div>
                {ev.extra && (
                  <p className="mt-2 text-sm text-wood-600 bg-paper-200/60 rounded-md px-3 py-1.5 inline-block">
                    {ev.extra}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {events.length === 0 && (
        <div className="py-8 pl-2 text-center text-sm text-wood-400 flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          暂无流转记录
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;

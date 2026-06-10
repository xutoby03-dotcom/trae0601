import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type Kind = 'success' | 'info' | 'warn';

export interface ToastItem {
  id: string;
  kind: Kind;
  message: string;
}

const CFG: Record<Kind, { bg: string; icon: typeof Info; iconColor: string }> = {
  success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle2, iconColor: 'text-emerald-500' },
  info: { bg: 'bg-brand-50 border-brand-200 text-brand-800', icon: Info, iconColor: 'text-brand-500' },
  warn: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle, iconColor: 'text-amber-500' },
};

export default function NotifyToast() {
  const { notifications, unreadCount } = useAppStore();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const prevLenRef = { current: notifications.length };
  const prevUnreadRef = { current: unreadCount() };

  useEffect(() => {
    const newUnread = unreadCount();
    if (notifications.length > prevLenRef.current && newUnread > prevUnreadRef.current) {
      const latest = notifications[0];
      setToasts((ts) => [...ts, { id: latest.id, kind: latest.message.includes('已恢复') ? 'success' : 'info', message: latest.message }]);
      setTimeout(() => {
        setToasts((ts) => ts.filter((t) => t.id !== latest.id));
      }, 4000);
    }
    prevLenRef.current = notifications.length;
    prevUnreadRef.current = newUnread;
  }, [notifications, unreadCount]);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const c = CFG[t.kind];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl border shadow-pop px-4 py-3 flex items-start gap-3 animate-slide-up ${c.bg}`}
          >
            <Icon size={18} className={c.iconColor + ' mt-0.5 shrink-0'} />
            <p className="flex-1 text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
              className="opacity-60 hover:opacity-100 shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

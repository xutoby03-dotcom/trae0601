import { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}
interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3500);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed top-20 right-4 z-50 space-y-2.5 pointer-events-none w-80 max-w-[92vw]">
        {toasts.map((t) => (
          <ToastItemView key={t.id} toast={t} onClose={() => setToasts((x) => x.filter((y) => y.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItemView({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const config = {
    success: {
      icon: CheckCircle2,
      iconCls: 'text-emerald-500',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-900',
    },
    error: {
      icon: AlertCircle,
      iconCls: 'text-rose-500',
      bg: 'bg-rose-50 border-rose-200',
      text: 'text-rose-900',
    },
    info: {
      icon: Info,
      iconCls: 'text-sky-500',
      bg: 'bg-sky-50 border-sky-200',
      text: 'text-sky-900',
    },
    warning: {
      icon: AlertTriangle,
      iconCls: 'text-amber-500',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-900',
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-xl border shadow-lg backdrop-blur-sm p-3.5 flex items-start gap-3 transition-all duration-300',
        config.bg,
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      )}
    >
      <Icon size={20} className={cn('shrink-0 mt-0.5', config.iconCls)} />
      <p className={cn('flex-1 text-sm font-medium leading-snug', config.text)}>{toast.message}</p>
      <button
        onClick={onClose}
        className="shrink-0 -m-1 p-1 rounded-md hover:bg-white/50 text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

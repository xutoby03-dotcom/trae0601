import { create, useStore } from 'zustand';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/helpers';
import { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (type: ToastType, message: string) => void;
  removeToast: (id: string) => void;
}

const toastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Date.now().toString(36);
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3500);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (message: string) => toastStore.getState().addToast('success', message),
  error: (message: string) => toastStore.getState().addToast('error', message),
  info: (message: string) => toastStore.getState().addToast('info', message),
};

const toastConfig = {
  success: {
    bg: 'bg-accent-500',
    Icon: CheckCircle2,
  },
  error: {
    bg: 'bg-red-500',
    Icon: AlertCircle,
  },
  info: {
    bg: 'bg-primary-500',
    Icon: Info,
  },
};

export default function Toast() {
  const toasts = useStore(toastStore, (s) => s.toasts);
  const removeToast = useStore(toastStore, (s) => s.removeToast);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[toasts.length - 1].id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toasts, removeToast]);

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 pointer-events-none">
      {toasts.map((t) => {
        const config = toastConfig[t.type];
        const Icon = config.Icon;
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-float text-white animate-slide-up min-w-[280px] max-w-md',
              config.bg
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <p className="flex-1 text-sm font-medium">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 p-1 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let listeners: ((toasts: Toast[]) => void)[] = [];
let globalToasts: Toast[] = [];

const addToast = (type: ToastType, message: string) => {
  const id = Math.random().toString(36).slice(2);
  globalToasts = [...globalToasts, { id, type, message }];
  listeners.forEach((l) => l(globalToasts));
  setTimeout(() => {
    globalToasts = globalToasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(globalToasts));
  }, 3200);
};

export const toast = {
  success: (msg: string) => addToast('success', msg),
  error: (msg: string) => addToast('error', msg),
  info: (msg: string) => addToast('info', msg),
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};
const colors = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-sky-50 border-sky-200 text-sky-800',
};
const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-sky-500',
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>(globalToasts);

  useEffect(() => {
    const handler = (t: Toast[]) => setToasts([...t]);
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed top-20 right-4 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((t, i) => {
        const Icon = icons[t.type];
        const remove = () => {
          globalToasts = globalToasts.filter((x) => x.id !== t.id);
          listeners.forEach((l) => l(globalToasts));
        };
        return (
          <div
            key={t.id}
            className={`pointer-events-auto relative flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-lg backdrop-blur-sm bg-white/95 ${colors[t.type]}
              animate-[slideIn_0.3s_ease-out_forwards]`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[t.type]}`} />
            <p className="text-sm font-medium leading-relaxed flex-1">{t.message}</p>
            <button
              onClick={remove}
              className="opacity-50 hover:opacity-100 transition-opacity p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ToastContainer;

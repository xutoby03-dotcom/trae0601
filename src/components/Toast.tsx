import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import '../styles/components.css';

export type ToastType = 'info' | 'success' | 'warning' | 'danger';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const iconMap = {
  info: <Info size={16} />,
  success: <CheckCircle2 size={16} />,
  warning: <AlertTriangle size={16} />,
  danger: <XCircle size={16} />,
};

export function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItemView key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

interface ToastItemViewProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
}

function ToastItemView({ toast, onRemove }: ToastItemViewProps) {
  const duration = toast.duration ?? 2500;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [toast.id, duration, onRemove]);

  const typeClass = toast.type && toast.type !== 'info' ? `toast-${toast.type}` : '';

  return (
    <div className={`toast ${typeClass}`}>
      {iconMap[toast.type ?? 'info']}
      <span>{toast.message}</span>
    </div>
  );
}

let toastIdCounter = 0;

export function createToast(message: string, type: ToastType = 'info', duration?: number): ToastItem {
  toastIdCounter += 1;
  return {
    id: `toast-${Date.now()}-${toastIdCounter}`,
    message,
    type,
    duration,
  };
}

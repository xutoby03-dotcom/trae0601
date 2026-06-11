import { createRoot } from 'react-dom/client';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type?: ToastType;
  message: string;
  onClose: () => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-mint-500',
    bgClass: 'bg-mint-50 border-mint-200',
  },
  error: {
    icon: AlertCircle,
    iconClass: 'text-danger-500',
    bgClass: 'bg-danger-50 border-danger-200',
  },
  info: {
    icon: Info,
    iconClass: 'text-amber-500',
    bgClass: 'bg-amber-50 border-amber-200',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-50 border-amber-200',
  },
};

function Toast({ type = 'success', message, onClose }: ToastProps) {
  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border shadow-card ${config.bgClass}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconClass}`} />
        <span className="text-sm font-medium text-slate-700">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
        </button>
      </div>
    </div>
  );
}

export function useToast() {
  const showToast = (message: string, type: ToastType = 'success', duration = 3000) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const handleClose = () => {
      root.unmount();
      container.remove();
    };

    const root = createRoot(container);
    root.render(<Toast type={type} message={message} onClose={handleClose} />);

    setTimeout(() => {
      handleClose();
    }, duration);
  };

  return { showToast };
}

export default Toast;

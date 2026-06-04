import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
}

export function Toast({ message, type = 'success', visible }: ToastProps) {
  if (!visible) return null;

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-5 fade-in duration-300">
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-white border',
          type === 'success' && 'border-green-200',
          type === 'error' && 'border-red-200',
          type === 'info' && 'border-blue-200'
        )}
      >
        {icons[type]}
        <span className="text-gray-700 text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

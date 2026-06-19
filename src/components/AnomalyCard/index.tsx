import { AlertTriangle, X } from 'lucide-react';
import type { ReactNode } from 'react';

interface AnomalyCardProps {
  title: string;
  description?: string;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function AnomalyCard({
  title,
  description,
  children,
  onClose,
  className = '',
}: AnomalyCardProps) {
  return (
    <div
      className={`relative bg-white rounded-xl border-2 border-danger-500 shadow-lg animate-glow-red overflow-hidden ${className}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-danger-500 via-danger-600 to-danger-500" />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
            <AlertTriangle className="w-5 h-5 text-danger-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-danger-700 flex items-center gap-2">
              <span className="px-2 py-0.5 bg-danger-500 text-white text-xs rounded">连续异常</span>
              {title}
            </h4>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
            {children && <div className="mt-3">{children}</div>}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

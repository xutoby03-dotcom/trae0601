import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      window.addEventListener('keydown', onEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onEsc);
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden',
          sizes[size],
          'animate-in fade-in zoom-in-95 duration-200',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[65vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

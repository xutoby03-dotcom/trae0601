import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  hideClose?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export function Modal({ open, onClose, title, children, size = 'md', hideClose }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full bg-white rounded-3xl shadow-2xl overflow-hidden',
          'animate-modal-in',
          sizeClasses[size]
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              {title}
            </h2>
            {!hideClose && (
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}
        <div className={clsx(title ? 'p-7 pt-5' : 'p-7')}>{children}</div>
      </div>
    </div>
  );
}

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/helpers';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function Drawer({ open, onClose, title, subtitle, children, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={cn(
      'fixed inset-0 z-50 transition-all duration-300 pointer-events-none',
      open && 'pointer-events-auto',
    )}>
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
      />
      <div className={cn(
        'absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-float transition-transform duration-300 ease-out',
        open ? 'translate-x-0' : 'translate-x-full',
        className,
      )}>
        <div className="h-full flex flex-col">
          {(title || subtitle) && (
            <div className="flex items-start justify-between p-5 border-b border-cream-300 bg-gradient-to-r from-cream-50 to-white">
              <div className="min-w-0">
                {title && <h3 className="text-lg font-bold text-ink-900 truncate">{title}</h3>}
                {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl hover:bg-cream-200 transition-colors text-ink-500 hover:text-ink-900 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  size?: 'md' | 'lg';
}

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const sizeClasses = size === 'lg' ? 'max-w-3xl' : 'max-w-xl';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-accent-blue/40 backdrop-blur-sm animate-[fade-in-up_0.2s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizeClasses} bg-white rounded-3xl shadow-card animate-[fade-in-up_0.3s_ease-out] max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-start justify-between p-6 border-b border-warm-100">
          <div>
            <h3 className="text-xl font-bold text-accent-blue">{title}</h3>
            {subtitle && (
              <p className="text-sm text-warm-400 mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-warm-50 hover:bg-warm-100 flex items-center justify-center text-warm-400 hover:text-accent-blue transition-all"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

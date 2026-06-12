import { FC, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

const Modal: FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#2A1F16]/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-lg bg-[#F5EFE6] rounded-2xl shadow-2xl border border-[#D4A574]/20 overflow-hidden animate-slideUp',
          className,
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4A574]/20">
          <h2
            className="text-lg font-bold text-[#4A3728]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

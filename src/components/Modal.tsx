import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, width = 'md' }: ModalProps) {
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

  const widthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${widthClasses[width]} max-h-[90vh] overflow-hidden animate-fade-in-up`}
        style={{ animationDelay: '0ms' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-bread-100">
          <h3 className="text-xl font-display font-bold text-bread-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bread-50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-bread-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

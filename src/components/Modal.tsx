import { X } from 'lucide-react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-brown-900/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      <div className={`relative w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-large animate-scale-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-warm-100">
          <h3 className="text-lg font-display font-semibold text-brown-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-brown-400 hover:text-brown-600 hover:bg-warm-50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

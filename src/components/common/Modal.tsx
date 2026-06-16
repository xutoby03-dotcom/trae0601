import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
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

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className={`bg-white rounded-2xl shadow-lifted w-full ${sizeClasses} pointer-events-auto max-h-[90vh] flex flex-col overflow-hidden`}>
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                  <h3 className="font-serif text-lg font-semibold text-forest-800">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-gray-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-auto scrollbar-thin px-6 py-5">
                {children}
              </div>
              {footer && (
                <div className="px-6 py-4 border-t border-cream-200 bg-cream-50 flex justify-end gap-3">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fade-in-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-serif text-lg font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto max-h-[calc(90vh-140px)]">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">{footer}</div>}
      </div>
    </div>
  );
}

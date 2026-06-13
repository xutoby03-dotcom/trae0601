import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export default function Modal({ open, onClose, title, children, size = 'md' }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-forest-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative card ${sizeMap[size]} w-full max-h-[85vh] flex flex-col animate-fade-up`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-parchment-200">
          <h3 className="font-display text-lg font-bold text-forest-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-parchment-100 text-forest-500 hover:text-forest-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto scrollbar-thin">{children}</div>
      </div>
    </div>
  );
}

import React from 'react';
import { Minus, Square, X } from 'lucide-react';

interface WindowControlsProps {
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  isMaximized: boolean;
}

const WindowControls: React.FC<WindowControlsProps> = ({
  onMinimize,
  onMaximize,
  onClose,
  isMaximized,
}) => {
  return (
    <div className="flex items-center h-full">
      <button
        className="flex items-center justify-center w-10 h-full transition-colors hover:bg-white/10 active:bg-white/20"
        onClick={onMinimize}
        title="最小化"
      >
        <Minus size={14} style={{ color: 'var(--color-text-primary)' }} />
      </button>
      <button
        className="flex items-center justify-center w-10 h-full transition-colors hover:bg-white/10 active:bg-white/20"
        onClick={onMaximize}
        title={isMaximized ? '还原' : '最大化'}
      >
        <Square size={12} style={{ color: 'var(--color-text-primary)' }} />
      </button>
      <button
        className="flex items-center justify-center w-10 h-full transition-colors hover:bg-red-500 active:bg-red-600"
        onClick={onClose}
        title="关闭"
      >
        <X size={14} style={{ color: 'var(--color-text-primary)' }} />
      </button>
    </div>
  );
};

export default WindowControls;

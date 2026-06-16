import React from 'react';
import { cn } from '../lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, disabled, className }) => {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div
        className={cn(
          'toggle-switch',
          checked ? 'bg-primary' : 'bg-gray-300',
          disabled && 'cursor-not-allowed'
        )}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span
          className={cn(
            'toggle-knob',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </div>
      {label && <span className="text-sm text-warm-dark font-medium">{label}</span>}
    </label>
  );
};

export default Toggle;

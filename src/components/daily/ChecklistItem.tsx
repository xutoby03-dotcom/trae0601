import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ChecklistItemProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export default function ChecklistItem({
  label,
  description,
  checked,
  onChange,
  disabled = false,
  icon,
}: ChecklistItemProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    if (!checked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 300);
    }
    onChange(!checked);
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-4 transition-all duration-200',
        checked
          ? 'border-success/30 bg-success/5'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
        disabled && 'cursor-not-allowed opacity-60',
        !disabled && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200',
          checked
            ? 'border-success bg-success'
            : 'border-gray-300 bg-white',
          animating && 'scale-110'
        )}
      >
        {checked && (
          <Check
            className={cn(
              'h-4 w-4 text-white transition-transform duration-200',
              animating && 'animate-pulse'
            )}
            strokeWidth={3}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className={cn(
            'font-medium transition-colors',
            checked ? 'text-success' : 'text-gray-900'
          )}>
            {label}
          </span>
        </div>
        {description && (
          <p className={cn(
            'mt-1 text-sm transition-colors',
            checked ? 'text-success/70' : 'text-gray-500'
          )}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

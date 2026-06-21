import '../styles/components.css';
import { Check } from 'lucide-react';

export interface TagProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  showCheckIcon?: boolean;
  className?: string;
}

export function Tag({ active = false, onClick, children, showCheckIcon = true, className = '' }: TagProps) {
  return (
    <span
      className={`tag ${active ? 'tag-active' : ''} ${className}`}
      onClick={onClick}
    >
      {active && showCheckIcon && <Check size={13} strokeWidth={3} />}
      {children}
    </span>
  );
}

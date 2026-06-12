import { FC, ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const Button: FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  disabled = false,
}) => {
  const baseStyles =
    'font-medium rounded-full transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A574]/50';

  const variants = {
    primary:
      'bg-[#4A3728] text-[#F5EFE6] hover:bg-[#3D2E20] active:scale-95 shadow-md hover:shadow-lg',
    secondary:
      'bg-[#E8DFD3] text-[#4A3728] hover:bg-[#D9CEC0] active:scale-95',
    ghost:
      'bg-transparent text-[#6B5748] hover:bg-[#E8DFD3] hover:text-[#4A3728] active:scale-95',
    danger:
      'bg-[#C2563B] text-white hover:bg-[#A6452E] active:scale-95 shadow-md',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {children}
    </button>
  );
};

export default Button;

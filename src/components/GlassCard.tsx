import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  status?: 'safe' | 'caution' | 'danger' | 'none';
  glow?: boolean;
  delay?: number;
}

const statusBorder: Record<string, string> = {
  safe: 'border-[#00E5A0]/30',
  caution: 'border-[#FFB800]/30',
  danger: 'border-[#FF4757]/30',
  none: 'border-white/5',
};

const statusGlow: Record<string, string> = {
  safe: 'shadow-[0_0_20px_rgba(0,229,160,0.08)]',
  caution: 'shadow-[0_0_20px_rgba(255,184,0,0.08)]',
  danger: 'shadow-[0_0_20px_rgba(255,71,87,0.12)]',
  none: '',
};

export default function GlassCard({ children, className = '', status = 'none', glow = true, delay = 0 }: GlassCardProps) {
  return (
    <div
      className={`rounded-lg border bg-white/[0.03] backdrop-blur-md transition-all duration-500 ${statusBorder[status]} ${glow ? statusGlow[status] : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

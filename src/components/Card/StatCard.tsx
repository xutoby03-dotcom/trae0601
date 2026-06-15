import { TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient: string;
  subtitle?: string;
  trend?: number;
  className?: string;
}

export default function StatCard({ title, value, icon, gradient, subtitle, trend, className = '' }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 text-white shadow-soft hover:shadow-hover transition-all duration-300 hover:-translate-y-1 opacity-0 animate-fade-in-up ${className}`}
      style={{ background: gradient }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/80 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold font-serif">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-xs mt-2">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={14} />
              <span className="text-xs">{trend > 0 ? `+${trend}` : trend} 较上月</span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

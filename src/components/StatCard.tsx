import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatCard({ title, value, subtitle, icon: Icon, gradient, trend }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl ${gradient}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="mt-2 text-3xl font-bold font-display">{value}</p>
            {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
            {trend && (
              <div className={`mt-2 inline-flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
                <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
                <span className="text-white/60 ml-1">较上月</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

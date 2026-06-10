import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  gradient: string;
  iconBg: string;
  delay?: number;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  gradient,
  iconBg,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="card-base p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
      style={{ animation: `staggerIn 0.5s ease-out ${delay}ms both` }}
    >
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-1">{label}</p>
          <p className="font-display text-3xl font-bold text-white">
            {value}
            {unit && (
              <span className="text-lg font-medium text-slate-400 ml-1">{unit}</span>
            )}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

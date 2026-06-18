import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}

const colorClasses = {
  blue: 'from-ocean-400 to-ocean-600',
  green: 'from-seafoam-400 to-seafoam-600',
  yellow: 'from-sand-400 to-sand-600',
  red: 'from-coral-400 to-coral-600',
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  subtitle,
}: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-6 hover:shadow-float transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-ocean-500 text-sm font-medium mb-1">{title}</p>
          <p className="font-display text-3xl font-bold text-ocean-800">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-ocean-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

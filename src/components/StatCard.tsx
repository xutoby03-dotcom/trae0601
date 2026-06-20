import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: 'sky' | 'amber' | 'rose' | 'emerald';
  delay?: number;
  onClick?: () => void;
}

const colorClasses = {
  sky: 'from-sky-400 to-cyan-500',
  amber: 'from-amber-400 to-orange-500',
  rose: 'from-rose-400 to-pink-500',
  emerald: 'from-emerald-400 to-green-500',
};

export default function StatCard({ title, value, icon: Icon, color, delay = 0, onClick }: StatCardProps) {
  return (
    <div
      className="glass-card rounded-2xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 animate-count-up">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

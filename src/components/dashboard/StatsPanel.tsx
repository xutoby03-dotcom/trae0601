import { useEffect, useState } from 'react';
import { TrendingUp, AlertCircle, Zap, Droplets } from 'lucide-react';
import { DUST_LEVEL_LABELS } from '@/types';
import type { DashboardStats } from '@/types';

interface StatsPanelProps {
  stats: DashboardStats;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(easeOut * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{display}</span>;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const statCards = [
    {
      label: '本月清洗次数',
      value: stats.monthlyCleanCount,
      suffix: '次',
      icon: TrendingUp,
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      delay: 0,
    },
    {
      label: '超期待清洗',
      value: stats.statusCounts.overdue,
      suffix: '台',
      icon: AlertCircle,
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      delay: 100,
    },
    {
      label: '晾干中',
      value: stats.statusCounts.drying,
      suffix: '台',
      icon: Droplets,
      bg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      delay: 200,
    },
    {
      label: '已完成',
      value: stats.statusCounts.completed,
      suffix: '台',
      icon: Zap,
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      delay: 300,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((card, index) => (
        <div
          key={card.label}
          className={`${card.bg} rounded-2xl p-6 text-white shadow-lg animate-slide-up hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
          style={{ animationDelay: `${card.delay}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">{card.label}</p>
              <p className="text-4xl font-bold">
                <AnimatedNumber value={card.value} />
                <span className="text-xl ml-1">{card.suffix}</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <card.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

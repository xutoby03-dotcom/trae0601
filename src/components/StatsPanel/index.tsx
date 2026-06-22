import { Leaf, Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSpecimenStore } from '@/store/useSpecimenStore';
import { useMemo } from 'react';

export default function StatsPanel() {
  const specimens = useSpecimenStore((s) => s.specimens);

  const stats = useMemo(() => {
    const total = specimens.length;
    const drying = specimens.filter((s) => !s.isCompleted).length;
    const completed = specimens.filter((s) => s.isCompleted).length;
    const hasAlert = specimens.filter(
      (s) => s.hasMold || s.hasEdgeRoll || s.hasColorFade || s.hasMissingLabel,
    ).length;
    return { total, drying, completed, hasAlert };
  }, [specimens]);

  const cards = [
    {
      label: '总标本数',
      value: stats.total,
      icon: Leaf,
      bgColor: 'bg-forest-50',
      textColor: 'text-forest-600',
      iconBg: 'bg-forest-200',
    },
    {
      label: '干燥中',
      value: stats.drying,
      icon: Droplets,
      bgColor: 'bg-paper-200',
      textColor: 'text-forest-500',
      iconBg: 'bg-forest-100',
    },
    {
      label: '已完成',
      value: stats.completed,
      icon: CheckCircle2,
      bgColor: 'bg-amber-50',
      textColor: 'text-warning-gold',
      iconBg: 'bg-amber-100',
    },
    {
      label: '异常提醒',
      value: stats.hasAlert,
      icon: AlertTriangle,
      bgColor: stats.hasAlert > 0 ? 'bg-red-50' : 'bg-gray-50',
      textColor: stats.hasAlert > 0 ? 'text-warning-danger' : 'text-gray-500',
      iconBg: stats.hasAlert > 0 ? 'bg-red-100' : 'bg-gray-100',
      pulse: stats.hasAlert > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`${card.bgColor} rounded-xl p-4 shadow-card transition-all duration-300 hover:shadow-card-hover`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-sans text-gray-600">{card.label}</p>
                <p className={`text-3xl font-serif font-bold mt-1 ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div
                className={`${card.iconBg} p-3 rounded-full ${
                  card.pulse ? 'animate-pulse-slow' : ''
                }`}
              >
                <Icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

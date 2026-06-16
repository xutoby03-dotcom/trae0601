import { AlertTriangle, Flame, TrendingDown } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { formatMoney } from '@/utils/food';
import { DISCARD_REASON_EMOJI, DISCARD_REASON_LABEL } from '@/utils/constants';

export function StatsCards() {
  const getTotalWaste = useFoodStore((s) => s.getTotalWaste);
  const getMonthlyWaste = useFoodStore((s) => s.getMonthlyWaste);
  const getTopDiscardReason = useFoodStore((s) => s.getTopDiscardReason);
  const getPendingCount = useFoodStore((s) => s.getPendingCount);

  const totalWaste = getTotalWaste();
  const monthlyWaste = getMonthlyWaste();
  const topReason = getTopDiscardReason();
  const pendingCount = getPendingCount();

  const cards = [
    {
      title: '累计浪费',
      value: formatMoney(totalWaste),
      sub: '所有丢弃记录',
      icon: TrendingDown,
      gradient: 'from-red-400 to-rose-500',
      bg: 'from-red-50 to-rose-50',
      border: 'border-red-100',
    },
    {
      title: '本月浪费',
      value: formatMoney(monthlyWaste),
      sub: topReason ? `主要原因: ${DISCARD_REASON_EMOJI[topReason]} ${DISCARD_REASON_LABEL[topReason]}` : '暂无丢弃记录',
      icon: Flame,
      gradient: 'from-orange-400 to-amber-500',
      bg: 'from-orange-50 to-amber-50',
      border: 'border-orange-100',
    },
    {
      title: '待处理食材',
      value: `${pendingCount} 件`,
      sub: pendingCount > 0 ? '建议尽快处理' : '没有紧急食材 ✓',
      icon: AlertTriangle,
      gradient: 'from-emerald-400 to-teal-500',
      bg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {cards.map((card, idx) => (
        <div
          key={card.title}
          className={`relative p-6 rounded-3xl bg-gradient-to-br ${card.bg} border ${card.border} overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
          style={{ animationDelay: `${idx * 80}ms` }}
        >
          <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-500">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} text-white flex items-center justify-center shadow-md`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800 mb-1.5" style={{ fontFamily: "'Fraunces', serif" }}>
              {card.value}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">{card.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

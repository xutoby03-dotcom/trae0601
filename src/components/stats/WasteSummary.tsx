import { useFoodStore } from '@/store/useFoodStore';
import { formatMoney } from '@/utils/food';
import { DISCARD_REASON_LABEL, DISCARD_REASON_EMOJI, DISCARD_REASON_COLOR } from '@/utils/constants';
import type { DiscardReason } from '@/types';
import { TrendingDown, Calendar, Award } from 'lucide-react';

export function WasteSummary() {
  const getTotalWaste = useFoodStore((s) => s.getTotalWaste);
  const getMonthlyWaste = useFoodStore((s) => s.getMonthlyWaste);
  const getTopDiscardReason = useFoodStore((s) => s.getTopDiscardReason);
  const discards = useFoodStore((s) => s.discards);

  const totalWaste = getTotalWaste();
  const monthlyWaste = getMonthlyWaste();
  const topReason = getTopDiscardReason();
  const totalItems = discards.length;

  const data = [
    {
      label: '累计浪费金额',
      value: formatMoney(totalWaste),
      sub: `共丢弃 ${totalItems} 件食材`,
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-200/50',
    },
    {
      label: '本月浪费',
      value: formatMoney(monthlyWaste),
      sub: totalWaste > 0 ? `占累计 ${Math.round((monthlyWaste / totalWaste) * 100)}%` : '—',
      icon: Calendar,
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-200/50',
    },
    {
      label: '最常丢弃原因',
      value: topReason ? `${DISCARD_REASON_EMOJI[topReason]} ${DISCARD_REASON_LABEL[topReason]}` : '—',
      sub: topReason ? '下次注意避免' : '暂无数据',
      icon: Award,
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-200/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {data.map((item) => (
        <div
          key={item.label}
          className="relative p-7 rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${item.gradient} opacity-5`} />
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg ${item.shadow} mb-5`}>
            <item.icon className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500 mb-2">{item.label}</p>
          <p className="text-2xl font-bold text-slate-800 mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
            {item.value}
          </p>
          <p className="text-xs text-slate-400">{item.sub}</p>
        </div>
      ))}
    </div>
  );
}

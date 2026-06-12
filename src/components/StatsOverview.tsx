import { useBatchStore } from '@/store/batchStore';
import { getOverviewStats } from '@/utils/stats';
import { Package, Flame, AlertTriangle, Clock } from 'lucide-react';

export default function StatsOverview() {
  const batches = useBatchStore((s) => s.batches);
  const stats = getOverviewStats(batches);

  const items = [
    {
      icon: Package,
      label: '今日批次',
      value: stats.total,
      unit: '批',
      color: 'from-copper-400 to-copper-600',
      text: 'text-copper-600',
    },
    {
      icon: Flame,
      label: '进行中',
      value: stats.active,
      unit: '批',
      color: 'from-success to-green-600',
      text: 'text-success',
    },
    {
      icon: AlertTriangle,
      label: '报损率',
      value: stats.lossRate,
      unit: '%',
      color: stats.lossRate > 5 ? 'from-danger to-red-600' : 'from-espresso-400 to-espresso-600',
      text: stats.lossRate > 5 ? 'text-danger' : 'text-espresso-600',
    },
    {
      icon: Clock,
      label: '平均超时',
      value: stats.avgOvertime,
      unit: '分',
      color: stats.avgOvertime > 3 ? 'from-warn to-orange-500' : 'from-espresso-400 to-espresso-600',
      text: stats.avgOvertime > 3 ? 'text-warn' : 'text-espresso-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ icon: Icon, label, value, unit, color, text }) => (
        <div key={label} className="card-base p-5 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-espresso-400">{label}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`font-display text-3xl font-bold ${text} tabular-nums`}>{value}</span>
            <span className="text-sm text-espresso-500">{unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

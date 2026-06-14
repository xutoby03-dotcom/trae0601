import { Link } from 'react-router-dom';
import { AlertTriangle, Sun, TrendingDown, Play, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types';
import { STATUS_LABELS, DUST_LEVEL_LABELS } from '@/types';

interface PriorityCardProps {
  stats: DashboardStats;
}

export function PriorityCard({ stats }: PriorityCardProps) {
  const { nextPriority, dirtiestRoom } = stats;

  const getPriorityIcon = () => {
    if (nextPriority.status === 'overdue') return AlertTriangle;
    if (nextPriority.status === 'drying') return Sun;
    return TrendingDown;
  };

  const getPriorityColor = () => {
    if (nextPriority.status === 'overdue') return 'from-red-500 to-red-600';
    if (nextPriority.status === 'drying') return 'from-amber-500 to-amber-600';
    return 'from-blue-500 to-blue-600';
  };

  const PriorityIcon = getPriorityIcon();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div
        className={`bg-gradient-to-br ${getPriorityColor()} rounded-2xl p-6 text-white shadow-lg animate-slide-up hover:shadow-xl transition-all duration-300`}
        style={{ animationDelay: '400ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <PriorityIcon className="w-5 h-5" />
          </div>
          <span className="text-white/80 text-sm">下次优先处理</span>
        </div>

        <h3 className="text-2xl font-bold mb-2">{nextPriority.ac.room}</h3>
        <p className="text-white/80 text-sm mb-1">
          {nextPriority.ac.brand} {nextPriority.ac.model}
        </p>
        <p className="text-white/90 text-sm mb-4">
          {STATUS_LABELS[nextPriority.status]}
          {nextPriority.daysOverdue > 0 && ` · 已超期 ${nextPriority.daysOverdue} 天`}
        </p>

        <Link
          to={`/cleaning-records/new/${nextPriority.ac.id}`}
          className="inline-flex items-center gap-2 bg-white text-primary-600 px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-colors"
        >
          <Play className="w-4 h-4" />
          立即处理
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 animate-slide-up hover:shadow-xl transition-all duration-300"
        style={{ animationDelay: '500ms' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <span className="text-gray-600 text-sm">最脏的房间</span>
        </div>

        <h3 className="text-2xl font-bold text-gray-800 mb-2">{dirtiestRoom.room}</h3>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">灰尘程度：</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                dirtiestRoom.dustLevel === 'heavy'
                  ? 'bg-red-100 text-red-600'
                  : dirtiestRoom.dustLevel === 'medium'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-green-100 text-green-600'
              )}
            >
              {DUST_LEVEL_LABELS[dirtiestRoom.dustLevel]}
            </span>
          </div>
          <div className="text-gray-500 text-sm">
            基于最近 {dirtiestRoom.count} 次记录
          </div>
        </div>

        <p className="text-gray-500 text-sm">
          💡 建议：这个房间的空调使用频率较高或环境灰尘较多，可适当缩短清洗周期。
        </p>
      </div>
    </div>
  );
}

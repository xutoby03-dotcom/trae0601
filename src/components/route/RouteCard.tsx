import { Play, Edit2, Trash2, Copy, Clock, Star, MapPin, ChevronRight } from 'lucide-react';
import type { TourRoute } from '@/types';
import { formatDurationChinese } from '@/utils/time';
import { cn } from '@/lib/utils';

interface RouteCardProps {
  route: TourRoute;
  onStartGuide?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showManageActions?: boolean;
  className?: string;
}

export default function RouteCard({
  route,
  onStartGuide,
  onEdit,
  onDelete,
  onDuplicate,
  showManageActions = false,
  className,
}: RouteCardProps) {
  const totalDuration = route.points.reduce((sum, p) => sum + p.plannedDuration, 0);
  const keyPointCount = route.points.filter((p) => p.isKeyPoint).length;

  return (
    <div
      className={cn(
        'glass-card p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-deep-900 font-serif truncate group-hover:text-deep-700 transition-colors">
            {route.name}
          </h3>
          {route.description && (
            <p className="text-sm text-deep-600 mt-1 line-clamp-2">{route.description}</p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-deep-300 flex-shrink-0 ml-2 group-hover:text-museum-500 transition-colors" />
      </div>

      <div className="flex flex-wrap gap-4 mb-5 text-sm">
        <div className="flex items-center gap-1.5 text-deep-600">
          <Clock className="w-4 h-4 text-museum-500" />
          <span>{formatDurationChinese(totalDuration)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-deep-600">
          <MapPin className="w-4 h-4 text-museum-500" />
          <span>{route.points.length} 个点位</span>
        </div>
        {keyPointCount > 0 && (
          <div className="flex items-center gap-1.5 text-deep-600">
            <Star className="w-4 h-4 text-coral-500 fill-coral-500" />
            <span>{keyPointCount} 个重点</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onStartGuide && (
          <button
            onClick={onStartGuide}
            className="btn-primary flex items-center gap-2 flex-1 justify-center text-sm py-2 px-3"
          >
            <Play className="w-4 h-4" />
            开始讲解
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn-secondary flex items-center gap-2 text-sm py-2 px-3"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {showManageActions && (
          <>
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="btn-ghost flex items-center gap-1 text-sm py-2 px-3"
                title="复制"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="btn-danger flex items-center gap-1 text-sm py-2 px-3"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

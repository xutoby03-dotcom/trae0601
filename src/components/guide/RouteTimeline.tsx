import { CheckCircle, Circle, Star, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/time';
import type { PointSession, RoutePoint } from '@/types';

interface TimelineItem {
  point: RoutePoint;
  session: PointSession;
  index: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isCompressed: boolean;
}

interface RouteTimelineProps {
  points: RoutePoint[];
  pointSessions: PointSession[];
  currentIndex: number;
}

export default function RouteTimeline({
  points,
  pointSessions,
  currentIndex,
}: RouteTimelineProps) {
  const sortedPoints = [...points].sort((a, b) => a.order - b.order);

  const items: TimelineItem[] = sortedPoints.map((point, index) => {
    const session = pointSessions[index];
    const isCompressed =
      session && session.adjustedDuration < session.plannedDuration;

    return {
      point,
      session,
      index,
      isCurrent: index === currentIndex,
      isCompleted: session?.isCompleted || index < currentIndex,
      isCompressed,
    };
  });

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-museum-200" />
      <div className="space-y-3">
        {items.map(({ point, session, index, isCurrent, isCompleted, isCompressed }) => (
          <div
            key={point.id}
            className={cn(
              'relative flex items-start gap-4 pl-1 pr-2 py-2 rounded-lg transition-all duration-300',
              isCurrent && 'scale-105',
              isCompleted && 'opacity-60'
            )}
          >
            <div className="relative z-10 flex-shrink-0">
              {isCompleted ? (
                <div className="w-10 h-10 rounded-full bg-jade-500 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              ) : isCurrent ? (
                <div className="w-12 h-12 rounded-full bg-deep-900 border-4 border-museum-400 flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-museum-400 animate-pulse" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-museum-100 border-2 border-museum-300 flex items-center justify-center">
                  <Circle className="w-5 h-5 text-museum-400" />
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex-1 min-w-0 flex flex-col justify-center',
                isCurrent && 'py-1'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-medium truncate',
                    isCurrent
                      ? 'text-deep-900 text-lg'
                      : isCompleted
                        ? 'text-deep-500'
                        : 'text-deep-700'
                  )}
                >
                  {point.name}
                </span>
                {point.isKeyPoint && (
                  <Star
                    className={cn(
                      'w-4 h-4 flex-shrink-0',
                      isCompleted ? 'text-museum-300 fill-museum-300' : 'text-museum-500 fill-museum-500'
                    )}
                  />
                )}
                {isCompressed && (
                  <AlertTriangle className="w-4 h-4 text-coral-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={cn(
                    'text-sm',
                    isCurrent
                      ? 'text-deep-600'
                      : isCompleted
                        ? 'text-deep-400 line-through'
                        : 'text-deep-500'
                  )}
                >
                  {formatDuration(session?.adjustedDuration || point.plannedDuration)}
                </span>
                {isCompressed && (
                  <span className="text-xs text-coral-500">
                    (原 {formatDuration(point.plannedDuration)})
                  </span>
                )}
                {session?.timeAdded && session.timeAdded > 0 && (
                  <span className="text-xs text-jade-500">
                  +{formatDuration(session.timeAdded)}
                  </span>
                )}
              </div>
            </div>

            {isCurrent && (
              <div className="flex items-center justify-center px-2 py-1 rounded-full bg-museum-100 text-museum-700 text-xs font-medium">
              当前
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

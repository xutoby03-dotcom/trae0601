import { History, ClipboardCheck, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAppStore } from '@/store';
import { TASK_TYPE_LABELS } from '@/constants';
import { formatRelativeDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

type TimelineItemType = 'inspection' | 'task';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  date: string;
  location: string;
  title: string;
  description: string;
  isAnomaly?: boolean;
  isDone?: boolean;
}

export default function RecentTimeline() {
  const { inspections, tasks, devices } = useAppStore();

  const deviceMap = new Map(devices.map((d) => [d.id, d]));

  const timelineItems: TimelineItem[] = [
    ...inspections.map((i) => {
      const device = deviceMap.get(i.device_id);
      return {
        id: `inspection-${i.id}`,
        type: 'inspection' as TimelineItemType,
        date: i.inspect_date || i.created_at,
        location: device?.location ?? '未知位置',
        title: i.has_anomaly ? '自检发现异常' : '自检完成',
        description: i.has_anomaly
          ? `异常类型：${i.anomaly_types.join('、') || '多项异常'}`
          : '所有检查项均正常',
        isAnomaly: i.has_anomaly,
      } as TimelineItem;
    }),
    ...tasks.map((t) => {
      const device = deviceMap.get(t.device_id);
      return {
        id: `task-${t.id}`,
        type: 'task' as TimelineItemType,
        date: t.handle_time || t.created_at,
        location: device?.location ?? '未知位置',
        title: t.status === 'done' ? '维修任务完成' : `新增${TASK_TYPE_LABELS[t.task_type]}任务`,
        description: t.description,
        isDone: t.status === 'done',
        isAnomaly: t.status !== 'done',
      } as TimelineItem;
    }),
  ];

  const sortedItems = timelineItems
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="card p-5 animate-fade-in-up delay-150">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">
          <History className="w-5 h-5 text-brand-500" />
          最近动态
        </h3>
      </div>

      {sortedItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-400">暂无记录</p>
        </div>
      ) : (
        <div className="relative pl-6">
          <div className="absolute left-[11px] top-1 bottom-1 w-0.5 bg-gradient-to-b from-brand-200 via-gray-200 to-transparent" />

          <div className="space-y-5">
            {sortedItems.map((item, index) => {
              const Icon = item.type === 'inspection' ? ClipboardCheck : AlertTriangle;
              const dotColor = item.isAnomaly && !item.isDone
                ? 'bg-danger-500 ring-danger-100'
                : item.isDone
                ? 'bg-success-500 ring-success-100'
                : 'bg-brand-500 ring-brand-100';

              return (
                <div
                  key={item.id}
                  className="relative animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={cn(
                    'absolute -left-[22px] top-1 w-6 h-6 rounded-full ring-4 flex items-center justify-center',
                    dotColor,
                  )}>
                    {item.isDone ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <Icon className="w-3 h-3 text-white" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={cn(
                        'text-sm font-semibold',
                        item.isAnomaly && !item.isDone
                          ? 'text-danger-600'
                          : item.isDone
                          ? 'text-success-600'
                          : 'text-gray-800',
                      )}>
                        {item.title}
                      </p>
                      <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
                        {formatRelativeDate(item.date)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{item.location}</p>
                    <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

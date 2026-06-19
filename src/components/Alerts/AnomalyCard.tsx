import { useState } from 'react';
import { Battery, Bell, Fuel, Wrench, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TASK_TYPE_LABELS, type TaskType } from '@/constants';

interface AnomalyCardProps {
  taskType: TaskType;
  count: number;
  descriptions: string[];
  devices: string[];
}

const typeIcons: Record<TaskType, typeof Battery> = {
  battery: Battery,
  sound: Bell,
  hose: Fuel,
  valve: Wrench,
  other: Wrench,
};

const highPriorityTypes: TaskType[] = ['battery', 'hose', 'valve'];

export default function AnomalyCard({ taskType, count, descriptions, devices }: AnomalyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = typeIcons[taskType];
  const isHighPriority = highPriorityTypes.includes(taskType);

  return (
    <div
      className={cn(
        'card card-hover overflow-hidden',
        isHighPriority &&
          'bg-gradient-to-br from-danger-50 via-white to-white border-danger-200'
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 text-left flex items-center gap-4"
      >
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center shrink-0',
            isHighPriority
              ? 'bg-gradient-to-br from-danger-500 to-danger-600 text-white shadow-lg shadow-danger-500/25'
              : 'bg-cream-100 text-gray-700'
          )}
        >
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-gray-800 text-lg">
              {TASK_TYPE_LABELS[taskType]}
            </h3>
            <span
              className={cn(
                'tag',
                isHighPriority
                  ? 'bg-danger-100 text-danger-600'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {count} 项待处理
            </span>
          </div>
          <p className="text-sm text-gray-500 truncate">
            {descriptions[0] || '暂无详细描述'}
          </p>
        </div>
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center transition-colors',
            expanded ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'
          )}
        >
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-cream-100 pt-4 space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-brand-500 rounded-full"></span>
              异常详情
            </h4>
            <ul className="space-y-1.5">
              {descriptions.map((desc, idx) => (
                <li
                  key={idx}
                  className="text-sm text-gray-600 pl-3 py-1.5 bg-cream-50 rounded-lg border-l-2 border-cream-300"
                >
                  {desc}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
              <span className="w-1 h-4 bg-brand-500 rounded-full"></span>
              关联设备
            </h4>
            <div className="flex flex-wrap gap-2">
              {devices.map((device, idx) => (
                <span
                  key={idx}
                  className="tag bg-white border border-cream-200 text-gray-600 py-1"
                >
                  {device}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import type { DampLevel, DrainStatus, TaskStatus, RainIntensity } from '../../types';

const dampLevelConfig: Record<DampLevel, { label: string; className: string }> = {
  none: { label: '无潮痕', className: 'bg-success-50 text-success-600 border-success-200' },
  light: { label: '轻微潮痕', className: 'bg-warning-50 text-warning-600 border-warning-200' },
  medium: { label: '明显潮痕', className: 'bg-warning-50 text-warning-600 border-warning-200' },
  severe: { label: '严重渗水', className: 'bg-danger-50 text-danger-600 border-danger-200' },
};

const drainStatusConfig: Record<DrainStatus, { label: string; className: string }> = {
  normal: { label: '排水正常', className: 'bg-success-50 text-success-600 border-success-200' },
  slow: { label: '排水较慢', className: 'bg-warning-50 text-warning-600 border-warning-200' },
  blocked: { label: '堵塞', className: 'bg-danger-50 text-danger-600 border-danger-200' },
};

const taskStatusConfig: Record<TaskStatus, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  in_progress: { label: '进行中', className: 'bg-primary-50 text-primary-600 border-primary-200' },
  completed: { label: '已完成', className: 'bg-success-50 text-success-600 border-success-200' },
  review: { label: '待复查', className: 'bg-warning-50 text-warning-600 border-warning-200' },
};

const rainIntensityConfig: Record<RainIntensity, { label: string; className: string }> = {
  light: { label: '小雨', className: 'bg-blue-50 text-blue-600 border-blue-200' },
  moderate: { label: '中雨', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  heavy: { label: '大雨', className: 'bg-blue-200 text-blue-800 border-blue-400' },
  storm: { label: '暴雨', className: 'bg-danger-50 text-danger-600 border-danger-200' },
};

interface StatusBadgeProps {
  type: 'damp' | 'drain' | 'task' | 'rain';
  value: string;
}

export default function StatusBadge({ type, value }: StatusBadgeProps) {
  let config: { label: string; className: string } | undefined;

  if (type === 'damp') {
    config = dampLevelConfig[value as DampLevel];
  } else if (type === 'drain') {
    config = drainStatusConfig[value as DrainStatus];
  } else if (type === 'task') {
    config = taskStatusConfig[value as TaskStatus];
  } else if (type === 'rain') {
    config = rainIntensityConfig[value as RainIntensity];
  }

  if (!config) return null;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}

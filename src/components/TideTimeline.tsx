import { SamplingSite, UrgencyLevel } from '@/types';
import { calculateTideWindow, getUrgencyLevel, formatTimeRemaining } from '@/utils/tideCalculations';
import { formatTime, formatDuration } from '@/utils/formatters';
import { ArrowRight, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TideTimelineProps {
  site: SamplingSite;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  safe: {
    label: '时间充足',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    icon: CheckCircle,
  },
  warning: {
    label: '即将开始',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    icon: AlertTriangle,
  },
  critical: {
    label: '正在低潮',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    icon: AlertTriangle,
  },
  expired: {
    label: '窗口已过',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    icon: XCircle,
  },
};

export default function TideTimeline({ site }: TideTimelineProps) {
  const tideWindow = calculateTideWindow(site);
  const urgency = getUrgencyLevel(tideWindow);
  const config = urgencyConfig[urgency];

  const totalDuration = tideWindow.tideEnd.getTime() - tideWindow.tideStart.getTime();
  const now = new Date();
  const progress = Math.min(100, Math.max(0,
    ((now.getTime() - tideWindow.tideStart.getTime()) / totalDuration) * 100
  ));

  const lowTidePosition =
    ((tideWindow.lowTide.getTime() - tideWindow.tideStart.getTime()) / totalDuration) * 100;

  const Icon = config.icon;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg', config.bgColor)}>
            <Icon size={16} className={config.color} />
          </div>
          <span className={cn('text-sm font-medium', config.color)}>
            {config.label}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">可作业时长</p>
          <p className="text-sm font-semibold text-slate-700 font-mono">
            {formatDuration(tideWindow.workDuration)}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="relative h-12 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-sky-200 via-cyan-400 to-sky-200">
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-cyan-600/10 to-cyan-600/20 animate-pulse"
              style={{ animationDuration: '3s' }}
            />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
            style={{ left: `${lowTidePosition}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
          </div>

          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 transition-all duration-300"
            style={{ left: `${progress}%` }}
          >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full shadow-md animate-pulse" />
          </div>
        </div>

        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <div className="text-center">
            <p className="font-mono font-medium text-slate-700">
              {formatTime(tideWindow.tideStart)}
            </p>
            <p>退潮开始</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-medium text-cyan-700">
              {formatTime(tideWindow.lowTide)}
            </p>
            <p>最低潮</p>
          </div>
          <div className="text-center">
            <p className="font-mono font-medium text-slate-700">
              {formatTime(tideWindow.tideEnd)}
            </p>
            <p>回涨结束</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-1.5 text-amber-700 mb-1">
            <ArrowRight size={14} />
            <span className="text-xs font-medium">最晚出发</span>
          </div>
          <p className="text-lg font-bold text-amber-800 font-mono">
            {formatTime(tideWindow.latestDeparture)}
          </p>
          <p className="text-xs text-amber-600">
            距现在 {formatTimeRemaining(tideWindow.latestDeparture)}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
          <div className="flex items-center gap-1.5 text-rose-700 mb-1">
            <ArrowRight size={14} className="rotate-180" />
            <span className="text-xs font-medium">必须撤离</span>
          </div>
          <p className="text-lg font-bold text-rose-800 font-mono">
            {formatTime(tideWindow.mustEvacuate)}
          </p>
          <p className="text-xs text-rose-600">
            距现在 {formatTimeRemaining(tideWindow.mustEvacuate)}
          </p>
        </div>
      </div>
    </div>
  );
}

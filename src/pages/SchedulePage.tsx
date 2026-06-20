import { useScheduleStore } from '../stores/useScheduleStore';
import type { CourseType, MaintenanceWindow } from '../types';
import { CalendarDays, Clock, AlertCircle, ChevronRight, Star } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { cn } from '@/lib/utils';
import { getNextWindow } from '../utils/windowCalculator';

const typeColors: Record<CourseType, { bg: string; border: string; text: string; label: string }> = {
  training: { bg: 'bg-violet-500/20', border: 'border-violet-500/50', text: 'text-violet-300', label: '训练队' },
  public: { bg: 'bg-sky-500/20', border: 'border-sky-500/50', text: 'text-sky-300', label: '散客' },
  private: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-300', label: '私教' },
  event: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-300', label: '活动' },
};

const windowTypeStyles: Record<string, { bg: string; border: string; label: string }> = {
  recommended: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', label: '推荐窗口' },
  available: { bg: 'bg-sky-500/20', border: 'border-sky-500/50', label: '可用窗口' },
  short: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', label: '短暂窗口' },
};

export default function SchedulePage() {
  const { schedule, windows } = useScheduleStore();
  const nextWindow = getNextWindow(windows);

  const timelineStart = 6 * 60;
  const timelineEnd = 23 * 60;
  const totalMinutes = timelineEnd - timelineStart;

  const getPosition = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const minutes = h * 60 + m;
    return ((minutes - timelineStart) / totalMinutes) * 100;
  };

  const getWidth = (start: string, end: string) => {
    return getPosition(end) - getPosition(start);
  };

  const hourMarkers = [];
  for (let h = 6; h <= 23; h++) {
    hourMarkers.push(h);
  }

  const recommendedWindows = windows.filter((w) => w.type === 'recommended');
  const availableWindows = windows.filter((w) => w.type === 'available');

  return (
    <div className="min-h-screen bg-slate-950">
      <Header title="课程表与维护窗口" subtitle="合理规划维护时间，避开训练与散客时段" />

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-emerald-300">推荐维护窗口</p>
                <p className="text-2xl font-bold text-white">{recommendedWindows.length}</p>
              </div>
            </div>
            <p className="text-xs text-emerald-400/70">45分钟以上，适合完整磨冰</p>
          </div>

          <div className="bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <p className="text-sm text-sky-300">可用窗口</p>
                <p className="text-2xl font-bold text-white">{availableWindows.length}</p>
              </div>
            </div>
            <p className="text-xs text-sky-400/70">20-45分钟，可快速处理</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-amber-300">今日课程</p>
                <p className="text-2xl font-bold text-white">{schedule.slots.length} 节</p>
              </div>
            </div>
            <p className="text-xs text-amber-400/70">含训练、散客、活动</p>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-400" />
              {schedule.date} 时间轴
            </h2>
            <div className="flex items-center gap-4 text-sm">
              {Object.entries(typeColors).map(([type, style]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${style.bg} ${style.border} border`} />
                  <span className="text-slate-400">{style.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-32">
            <div className="absolute inset-0 flex">
              {hourMarkers.map((h) => (
                <div
                  key={h}
                  className="flex-1 border-l border-slate-700/50 relative"
                >
                  <span className="absolute -top-5 left-1 text-xs text-slate-500">
                    {h.toString().padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute inset-0 top-4">
              {windows.map((window, i) => (
                <div
                  key={`window-${i}`}
                  className={cn(
                    'absolute top-0 h-8 rounded-lg border border-dashed transition-all',
                    windowTypeStyles[window.type].bg,
                    windowTypeStyles[window.type].border
                  )}
                  style={{
                    left: `${getPosition(window.startTime)}%`,
                    width: `${getWidth(window.startTime, window.endTime)}%`,
                  }}
                >
                  <div className="px-2 py-1 h-full flex items-center justify-center overflow-hidden">
                    <span className="text-xs text-slate-300 whitespace-nowrap font-medium">
                      {window.startTime} - {window.endTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute inset-0 top-14">
              {schedule.slots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    'absolute h-10 rounded-lg border-2 cursor-pointer transition-all hover:scale-y-110 hover:z-10',
                    typeColors[slot.type].bg,
                    typeColors[slot.type].border
                  )}
                  style={{
                    left: `${getPosition(slot.startTime)}%`,
                    width: `${getWidth(slot.startTime, slot.endTime)}%`,
                  }}
                >
                  <div className="px-3 py-1.5 h-full flex flex-col justify-center overflow-hidden">
                    <span className={cn('text-sm font-semibold truncate', typeColors[slot.type].text)}>
                      {slot.name}
                    </span>
                    {slot.team && (
                      <span className="text-xs text-slate-400 truncate">{slot.team}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 mt-10 pt-4 border-t border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-dashed border-emerald-500/50 bg-emerald-500/20" />
              <span className="text-xs text-slate-400">维护窗口</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded border-2 border-sky-500/50 bg-sky-500/20" />
              <span className="text-xs text-slate-400">课程时段</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                维护窗口推荐
              </h2>

              <div className="space-y-3">
                {windows.map((window, i) => (
                  <WindowCard key={i} window={window} isNext={window === nextWindow} index={i} />
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 h-full">
              <h2 className="text-lg font-bold text-white mb-4">今日课程列表</h2>
              <div className="space-y-2">
                {schedule.slots.map((slot) => (
                  <div
                    key={slot.id}
                    className={cn(
                      'p-3 rounded-xl border transition-all hover:border-slate-600',
                      typeColors[slot.type].bg,
                      typeColors[slot.type].border
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={cn('font-medium text-sm', typeColors[slot.type].text)}>
                          {slot.name}
                        </p>
                        {slot.team && (
                          <p className="text-xs text-slate-400 mt-0.5">{slot.team}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-300 font-mono">
                          {slot.startTime}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          {slot.endTime}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WindowCard({ window, isNext, index }: { window: MaintenanceWindow; isNext: boolean; index: number }) {
  const style = windowTypeStyles[window.type];

  return (
    <div
      className={cn(
        'p-4 rounded-xl border transition-all group',
        style.bg,
        style.border,
        isNext && 'ring-2 ring-sky-400/50 ring-offset-2 ring-offset-slate-900'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center text-lg font-bold text-white">
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-white">
                {window.startTime} - {window.endTime}
              </p>
              {isNext && (
                <span className="text-xs bg-sky-500 text-white px-2 py-0.5 rounded-full font-medium">
                  下一个
                </span>
              )}
            </div>
            <p className="text-sm text-slate-400 mt-0.5">
              {window.duration} 分钟 · {window.reason}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs px-2 py-1 rounded-full font-medium',
              style.bg,
              style.border,
              'border'
            )}
          >
            {style.label}
          </span>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}

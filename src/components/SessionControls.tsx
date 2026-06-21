import { Play, CheckCircle, RotateCcw, Flame } from 'lucide-react';
import { useAnnealingStore } from '@/store/useAnnealingStore';
import { FURNACE_GRID, getTotalDuration, getDominantGlassType, GLASS_TYPE_LABELS, formatDuration } from '@/utils/annealing';

export default function SessionControls() {
  const { currentSession, nextSessionWorks, startSession, completeSession, resetSession } =
    useAnnealingStore();
  const { status, works } = currentSession;

  const totalHours = getTotalDuration(works);
  const dominantType = getDominantGlassType(works);
  const occupancy = works.length / FURNACE_GRID.maxCapacity;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-amber-100">炉次控制</h3>
        <div
          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
            status === 'planning'
              ? 'bg-amber-500/20 text-amber-400'
              : status === 'running'
              ? 'bg-furnace-glow/20 text-furnace-glow'
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {status === 'planning' ? '规划中' : status === 'running' ? '运行中' : '已完成'}
        </div>
      </div>

      {works.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-furnace-deeper/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-furnace-glow">{works.length}</div>
            <div className="text-[10px] text-amber-300/50">作品数</div>
          </div>
          <div className="bg-furnace-deeper/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-amber-400">{formatDuration(totalHours)}</div>
            <div className="text-[10px] text-amber-300/50">总时长</div>
          </div>
          <div className="bg-furnace-deeper/60 rounded-lg p-2.5 text-center">
            <div className="text-lg font-bold text-amber-300">{GLASS_TYPE_LABELS[dominantType]?.slice(0, 2)}</div>
            <div className="text-[10px] text-amber-300/50">主类型</div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between text-xs text-amber-300/50 mb-1">
          <span>炉内占用</span>
          <span>{Math.round(occupancy * 100)}%</span>
        </div>
        <div className="h-2 bg-furnace-deeper rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${occupancy * 100}%`,
              background:
                occupancy > 0.8
                  ? 'linear-gradient(to right, #f59e0b, #ef4444)'
                  : 'linear-gradient(to right, #ff6b2b, #f59e0b)',
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        {status === 'planning' && works.length > 0 && (
          <button
            onClick={startSession}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-furnace-glow to-furnace-warm text-furnace-deeper font-semibold py-2 rounded-lg text-sm hover:from-furnace-warm hover:to-furnace-glow transition-all shadow-lg shadow-furnace-glow/20"
          >
            <Play className="w-4 h-4" />
            开始退火
          </button>
        )}
        {status === 'running' && (
          <button
            onClick={completeSession}
            className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold py-2 rounded-lg text-sm hover:from-green-500 hover:to-green-400 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            完成炉次
          </button>
        )}
        <button
          onClick={resetSession}
          className="px-3 py-2 rounded-lg border border-furnace-ash/30 text-amber-300/50 hover:text-amber-300 hover:border-furnace-ash/50 transition-all text-sm"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {nextSessionWorks.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-1">
            <Flame className="w-4 h-4" />
            下一炉排队
          </div>
          <div className="text-xs text-blue-200/60">
            {nextSessionWorks.length} 件作品等待下一炉
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {nextSessionWorks.map((w) => (
              <span
                key={w.id}
                className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-300"
              >
                {w.studentName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

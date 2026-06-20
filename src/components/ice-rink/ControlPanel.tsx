import { Play, Pause, Square, RotateCcw, Droplets, Gauge, Timer, Target } from 'lucide-react';
import { useMaintenanceStore } from '../../stores/useMaintenanceStore';
import { useIssueStore } from '../../stores/useIssueStore';
import { calculateIceScore } from '../../utils/severityCalc';
import { cn } from '@/lib/utils';
import type { ViewMode, ActiveTool } from '../../types';

const viewModes: { mode: ViewMode; label: string; icon: typeof Gauge }[] = [
  { mode: 'normal', label: '标准', icon: Target },
  { mode: 'blade', label: '刮刀', icon: Gauge },
  { mode: 'water', label: '补水', icon: Droplets },
  { mode: 'coverage', label: '覆盖率', icon: Target },
];

const tools: { tool: ActiveTool; label: string; icon: string; color: string }[] = [
  { tool: 'groove', label: '起槽', icon: '⚡', color: 'bg-red-500' },
  { tool: 'water', label: '积水', icon: '💧', color: 'bg-blue-500' },
  { tool: 'ice_debris', label: '碎冰', icon: '❄️', color: 'bg-cyan-500' },
  { tool: 'closed_area', label: '封区', icon: '🚫', color: 'bg-amber-500' },
];

export function ControlPanel() {
  const { session, viewMode, activeTool, isSimulating, setViewMode, setActiveTool, startMaintenance, pauseMaintenance, resumeMaintenance, endMaintenance, setBladeHeight, resetSession } = useMaintenanceStore();
  const { issues } = useIssueStore();

  const iceScore = calculateIceScore(issues);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const elapsedTime = session.status === 'idle' ? 0 : Date.now() - session.startTime;

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-400" />
          维护控制
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-sky-400 font-mono">
              {session.coveredArea}%
            </div>
            <div className="text-xs text-slate-500 mt-1">覆盖率</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400 font-mono">
              {formatTime(elapsedTime)}
            </div>
            <div className="text-xs text-slate-500 mt-1">已用时</div>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-amber-400 font-mono">
              {iceScore}
            </div>
            <div className="text-xs text-slate-500 mt-1">冰面评分</div>
          </div>
        </div>

        <div className="flex gap-2 mb-5">
          {session.status === 'idle' || session.status === 'completed' ? (
            <button
              onClick={startMaintenance}
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-98"
            >
              <Play className="w-5 h-5 fill-current" />
              开始维护
            </button>
          ) : (
            <>
              <button
                onClick={isSimulating ? pauseMaintenance : resumeMaintenance}
                className={cn(
                  'flex-1 font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2',
                  isSimulating
                    ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25'
                )}
              >
                {isSimulating ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                {isSimulating ? '暂停' : '继续'}
              </button>
              <button
                onClick={endMaintenance}
                className="px-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-3 rounded-xl transition-all flex items-center justify-center"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>
            </>
          )}
        </div>

        <button
          onClick={resetSession}
          className="w-full text-slate-500 hover:text-slate-300 text-sm py-2 flex items-center justify-center gap-1 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-sky-400" />
          刮刀高度
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="1"
            max="5"
            step="0.1"
            value={session.bladeHeight}
            onChange={(e) => setBladeHeight(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-sky-500"
          />
          <span className="text-lg font-bold text-sky-400 font-mono w-14 text-right">
            {session.bladeHeight.toFixed(1)}
            <span className="text-xs text-slate-500 ml-0.5">mm</span>
          </span>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-400" />
          视图模式
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {viewModes.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2',
                viewMode === mode
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">标记工具</h3>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={() => setActiveTool('none')}
            className={cn(
              'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all',
              activeTool === 'none'
                ? 'bg-slate-600 text-white ring-2 ring-sky-400'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            )}
          >
            <span className="text-lg">✋</span>
            选择
          </button>
          {tools.map(({ tool, label, icon, color }) => (
            <button
              key={tool}
              onClick={() => setActiveTool(tool)}
              className={cn(
                'aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all',
                activeTool === tool
                  ? `${color} text-white ring-2 ring-white/50 scale-105`
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
              )}
            >
              <span className="text-lg">{icon}</span>
              {label}
            </button>
          ))}
        </div>
        {activeTool !== 'none' && (
          <p className="text-xs text-sky-400 mt-3 text-center">
            点击冰面添加{tools.find((t) => t.tool === activeTool)?.label}标记
          </p>
        )}
      </div>
    </div>
  );
}

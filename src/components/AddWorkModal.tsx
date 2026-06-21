import { AlertTriangle, CheckCircle, Clock, X, ArrowRight } from 'lucide-react';
import { useAnnealingStore } from '@/store/useAnnealingStore';
import { GLASS_TYPE_LABELS } from '@/utils/annealing';

export default function AddWorkModal() {
  const { showAddModal, compatibilityResult, pendingWork, confirmAddWork, cancelAddWork, forceAddWork, addToNextFurnace } =
    useAnnealingStore();

  if (!showAddModal || !compatibilityResult || !pendingWork) return null;

  const riskColors = {
    none: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: CheckCircle },
    low: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: AlertTriangle },
    medium: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', icon: AlertTriangle },
    high: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', icon: AlertTriangle },
  };

  const style = riskColors[compatibilityResult.riskLevel];
  const Icon = style.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={cancelAddWork}
      />
      <div className="relative bg-furnace-dark border border-furnace-ash/30 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl shadow-furnace-glow/10">
        <button
          onClick={cancelAddWork}
          className="absolute top-4 right-4 text-amber-300/40 hover:text-amber-300/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-xl font-semibold text-amber-100 mb-4">
          临时加作品判断
        </h3>

        <div className="space-y-3 mb-4">
          <div className="bg-furnace-deeper/80 rounded-lg p-3 text-sm space-y-1">
            <div className="text-amber-300/50">作品信息</div>
            <div className="text-amber-100">
              {pendingWork.studentName} · {GLASS_TYPE_LABELS[pendingWork.type]} · {pendingWork.maxThickness}mm · {pendingWork.height}cm
            </div>
          </div>

          <div className={`${style.bg} ${style.border} border rounded-lg p-4`}>
            <div className="flex items-start gap-3">
              <Icon className={`w-5 h-5 ${style.text} shrink-0 mt-0.5`} />
              <div>
                <div className={`font-semibold ${style.text} mb-1`}>
                  {compatibilityResult.canInsert ? '可以加入' : '不建议加入'}
                </div>
                <div className="text-sm text-amber-200/70 leading-relaxed">
                  {compatibilityResult.reason}
                </div>
              </div>
            </div>
          </div>

          {compatibilityResult.nextFurnaceTime && (
            <div className="bg-furnace-deeper/60 border border-amber-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-200">
                  下一炉预计开始时间:
                </span>
                <span className="font-semibold text-amber-100">
                  {compatibilityResult.nextFurnaceTime}
                </span>
              </div>
            </div>
          )}

          {compatibilityResult.currentPhase && (() => {
            const phase = compatibilityResult.currentPhase;
            const labels: Record<string, string> = {
              heating: '升温', soaking: '保温', cooling: '降温', done: '退火完成',
            };
            const colors: Record<string, string> = {
              heating: '#ff6b2b', soaking: '#fbbf24', cooling: '#60a5fa', done: '#8b7355',
            };
            const color = colors[phase.phase];
            const pct = Math.round(phase.progress * 100);
            return (
              <div className="bg-furnace-deeper/60 border border-furnace-ash/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-300/60">
                    当前进度：<span style={{ color }} className="font-semibold">{labels[phase.phase]}</span>
                    <span className="ml-2 text-amber-300/40">
                      {phase.elapsedHours.toFixed(2)}h / {phase.coolingEnd.toFixed(2)}h
                    </span>
                  </span>
                  <span style={{ color }}>{pct}%</span>
                </div>
                <div className="relative h-2 bg-furnace-smoke rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                  <div
                    className="absolute top-0 h-full w-px bg-white/50"
                    style={{ left: `${(phase.heatingEnd / phase.coolingEnd) * 100}%` }}
                    title="升温结束"
                  />
                  <div
                    className="absolute top-0 h-full w-px bg-white/50"
                    style={{ left: `${(phase.soakingEnd / phase.coolingEnd) * 100}%` }}
                    title="保温结束"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-amber-300/30">
                  <span>开始</span>
                  <span style={{ color: '#ff6b2b' }}>升温结束 {phase.heatingEnd.toFixed(1)}h</span>
                  <span style={{ color: '#fbbf24' }}>保温结束 {phase.soakingEnd.toFixed(1)}h</span>
                  <span>退火完成</span>
                </div>
              </div>
            );
          })()}
        </div>

        <div className="flex gap-3">
          <button
            onClick={cancelAddWork}
            className="flex-1 px-4 py-2.5 rounded-lg border border-furnace-ash/30 text-amber-300/60 hover:text-amber-300 hover:border-furnace-ash/50 transition-all text-sm"
          >
            取消
          </button>

          {compatibilityResult.canInsert && compatibilityResult.riskLevel === 'none' && (
            <button
              onClick={confirmAddWork}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold text-sm hover:from-green-500 hover:to-green-400 transition-all"
            >
              <CheckCircle className="w-4 h-4 inline mr-1.5" />
              确认加入
            </button>
          )}

          {compatibilityResult.canInsert && compatibilityResult.riskLevel !== 'none' && (
            <>
              {compatibilityResult.nextFurnaceTime && (
                <button
                  onClick={addToNextFurnace}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm hover:from-blue-500 hover:to-blue-400 transition-all"
                >
                  <ArrowRight className="w-4 h-4 inline mr-1.5" />
                  排入下一炉
                </button>
              )}
              <button
                onClick={forceAddWork}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white font-semibold text-sm hover:from-orange-500 hover:to-orange-400 transition-all"
              >
                <AlertTriangle className="w-4 h-4 inline mr-1.5" />
                强行加入
              </button>
            </>
          )}

          {!compatibilityResult.canInsert && compatibilityResult.nextFurnaceTime && (
            <button
              onClick={addToNextFurnace}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-furnace-glow to-furnace-warm text-furnace-deeper font-semibold text-sm hover:from-furnace-warm hover:to-furnace-glow transition-all"
            >
              <ArrowRight className="w-4 h-4 inline mr-1.5" />
              排入下一炉
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

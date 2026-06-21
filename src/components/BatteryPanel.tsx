import { Battery as BatteryIcon, Plus, Trash2, Clock, Film } from 'lucide-react';
import GlassCard from './GlassCard';
import { useFlightStore } from '@/store/useFlightStore';

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  good: { color: 'text-[#00E5A0]', bgColor: 'bg-[#00E5A0]/10', label: '良好' },
  warning: { color: 'text-[#FFB800]', bgColor: 'bg-[#FFB800]/10', label: '衰减' },
  critical: { color: 'text-[#FF4757]', bgColor: 'bg-[#FF4757]/10', label: '严重衰减' },
};

const healthColor = (health: number) => {
  if (health >= 80) return '#00E5A0';
  if (health >= 60) return '#FFB800';
  return '#FF4757';
};

export default function BatteryPanel() {
  const {
    batteries,
    shots,
    updateBattery,
    addBattery,
    removeBattery,
    highlightedBatteryId,
    setHighlightedBattery,
  } = useFlightStore();

  const totalFlightTime = batteries.reduce((sum, b) => sum + b.estimatedFlightTime, 0);

  return (
    <GlassCard delay={400}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BatteryIcon size={14} className="text-[#00E5A0]/70" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">电池管理</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/30">总计可飞</span>
            <span className="text-xs font-mono font-bold text-white/70">{totalFlightTime}min</span>
          </div>
        </div>

        <div className="space-y-2">
          {batteries.map((bat) => {
            const cfg = statusConfig[bat.status];
            const boundShots = shots.filter((s) => s.batteryId === bat.id);
            const totalDuration = boundShots.reduce((sum, s) => sum + s.estimatedDuration, 0);
            const remaining = bat.estimatedFlightTime - totalDuration;
            const isOverBudget = remaining < 0;
            const isHighlighted = highlightedBatteryId === bat.id;

            return (
              <div
                key={bat.id}
                className={`rounded-md border px-3 py-2.5 transition-all ${
                  isOverBudget
                    ? 'border-[#FFB800]/30 bg-[#FFB800]/[0.06]'
                    : bat.status === 'critical'
                      ? 'border-[#FF4757]/20 bg-[#FF4757]/[0.04]'
                      : bat.status === 'warning'
                        ? 'border-[#FFB800]/10 bg-[#FFB800]/[0.03]'
                        : isHighlighted
                          ? 'border-[#00E5A0]/30 bg-[#00E5A0]/[0.06]'
                          : 'border-white/5 bg-white/[0.03]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        bat.status === 'critical'
                          ? 'bg-[#FF4757] animate-pulse'
                          : bat.status === 'warning'
                            ? 'bg-[#FFB800]'
                            : 'bg-[#00E5A0]'
                      }`}
                    />
                    <button
                      onClick={() => setHighlightedBattery(bat.id)}
                      className={`text-xs font-mono transition-colors ${
                        isHighlighted
                          ? 'text-[#00E5A0] underline underline-offset-2'
                          : 'text-white/70 hover:text-white/90'
                      }`}
                    >
                      {bat.name}
                    </button>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${cfg.color} ${cfg.bgColor}`}>
                      {cfg.label}
                    </span>
                    {isOverBudget && (
                      <span className="rounded bg-[#FFB800]/15 px-1.5 py-0.5 text-[10px] font-mono text-[#FFB800]">
                        超支 {Math.abs(remaining)}min
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeBattery(bat.id)}
                    className="text-white/20 transition-colors hover:text-[#FF4757]/70"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                <div className="mb-2 grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <span className="text-white/30">循环</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={bat.cycleCount}
                        onChange={(e) => updateBattery(bat.id, { cycleCount: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent font-mono text-white/70 outline-none"
                        min={0}
                      />
                      <span className="text-white/20">次</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-white/30">健康度</span>
                    <div className="font-mono text-white/70">{bat.health}%</div>
                  </div>
                  <div>
                    <span className="text-white/30">可飞</span>
                    <div className="font-mono text-white/70">{bat.estimatedFlightTime}min</div>
                  </div>
                </div>

                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${bat.health}%`,
                      backgroundColor: healthColor(bat.health),
                    }}
                  />
                </div>

                <div className="border-t border-white/5 pt-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Film size={11} className="text-white/30" />
                      <span className="text-[10px] text-white/40">分配账本</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="text-white/30">
                        <Clock size={10} className="mr-1 inline" />
                        合计 {totalDuration}min
                      </span>
                      <span className={remaining >= 0 ? 'text-[#00E5A0]' : 'text-[#FFB800]'}>
                        剩余 {remaining >= 0 ? '+' : ''}{remaining}min
                      </span>
                    </div>
                  </div>

                  {boundShots.length === 0 ? (
                    <div className="py-1 text-center text-[10px] text-white/15">
                      暂无分配镜头
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {boundShots.map((shot) => (
                        <div
                          key={shot.id}
                          className="flex items-center justify-between rounded bg-white/[0.02] px-2 py-1 text-[10px]"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-white/20">#{shot.order}</span>
                            <span className="truncate text-white/60">{shot.name}</span>
                          </div>
                          <span className="font-mono text-white/40">{shot.estimatedDuration}min</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (totalDuration / Math.max(bat.estimatedFlightTime, 1)) * 100)}%`,
                        backgroundColor: isOverBudget ? '#FFB800' : totalDuration > bat.estimatedFlightTime * 0.8 ? '#FFB800' : '#00E5A0',
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={addBattery}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-white/10 py-2 text-xs text-white/30 transition-colors hover:border-[#00E5A0]/30 hover:text-[#00E5A0]/70"
        >
          <Plus size={12} />
          添加电池
        </button>
      </div>
    </GlassCard>
  );
}

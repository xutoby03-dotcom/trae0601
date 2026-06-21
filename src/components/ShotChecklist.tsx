import { ChevronDown, AlertTriangle, CheckCircle2, XCircle, MapPinned, Plus, Trash2 } from 'lucide-react';
import GlassCard from './GlassCard';
import { useFlightStore } from '@/store/useFlightStore';

const statusIcon: Record<string, typeof CheckCircle2> = {
  safe: CheckCircle2,
  caution: AlertTriangle,
  danger: XCircle,
};

const statusColor: Record<string, string> = {
  safe: 'text-[#00E5A0]',
  caution: 'text-[#FFB800]',
  danger: 'text-[#FF4757]',
};

const borderColor: Record<string, string> = {
  safe: 'border-l-[#00E5A0]/40',
  caution: 'border-l-[#FFB800]/40',
  danger: 'border-l-[#FF4757]',
};

export default function ShotChecklist() {
  const { shots, expandedShot, toggleShotExpand, addShot, removeShot, updateShot, batteries } = useFlightStore();

  const dangerCount = shots.filter((s) => s.status === 'danger').length;
  const cautionCount = shots.filter((s) => s.status === 'caution').length;
  const safeCount = shots.filter((s) => s.status === 'safe').length;

  return (
    <GlassCard delay={500}>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">镜头脚本清单</h3>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="text-[#00E5A0]">✓ {safeCount}</span>
            {cautionCount > 0 && <span className="text-[#FFB800]">⚠ {cautionCount}</span>}
            {dangerCount > 0 && <span className="text-[#FF4757]">✗ {dangerCount}</span>}
          </div>
        </div>

        <div className="space-y-2">
          {shots.map((shot) => {
            const Icon = statusIcon[shot.status];
            const isExpanded = expandedShot === shot.id;

            return (
              <div
                key={shot.id}
                className={`rounded-md border-l-2 border border-white/5 bg-white/[0.02] transition-all ${borderColor[shot.status]} ${
                  shot.status === 'danger' ? 'animate-[shake_0.3s_ease-in-out]' : ''
                }`}
              >
                <div
                  className="flex cursor-pointer items-center gap-2 px-3 py-2.5"
                  onClick={() => toggleShotExpand(shot.id)}
                >
                  <span className="text-[10px] font-mono text-white/20">#{shot.order}</span>
                  <Icon size={14} className={statusColor[shot.status]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-xs text-white/80">{shot.name}</span>
                      {shot.issues.length > 0 && (
                        <span className="shrink-0 rounded bg-[#FF4757]/10 px-1.5 py-0.5 text-[10px] text-[#FF4757]">
                          {shot.issues.length} 项风险
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-[10px] text-white/25 font-mono">
                      <span>高度 {shot.requiredAltitude}m</span>
                      <span>风速 ≤{shot.maxWindSpeed}m/s</span>
                      <span>预计 {shot.estimatedDuration}min</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeShot(shot.id); }}
                    className="text-white/15 transition-colors hover:text-[#FF4757]/60"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-white/5 px-3 py-3">
                    <div className="mb-3">
                      <label className="mb-1 block text-[10px] text-white/30">镜头描述</label>
                      <input
                        type="text"
                        value={shot.description}
                        onChange={(e) => updateShot(shot.id, { description: e.target.value })}
                        className="w-full bg-transparent text-xs text-white/60 outline-none"
                      />
                    </div>
                    <div className="mb-3 grid grid-cols-4 gap-3">
                      <div>
                        <label className="mb-1 block text-[10px] text-white/30">需求高度 (m)</label>
                        <input
                          type="number"
                          value={shot.requiredAltitude}
                          onChange={(e) => {
                            updateShot(shot.id, { requiredAltitude: parseInt(e.target.value) || 0 });
                            setTimeout(() => useFlightStore.getState().recalcShots(), 100);
                          }}
                          className="w-full rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-mono text-white/70 outline-none focus:border-[#00E5A0]/30"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] text-white/30">最大风速 (m/s)</label>
                        <input
                          type="number"
                          value={shot.maxWindSpeed}
                          onChange={(e) => {
                            updateShot(shot.id, { maxWindSpeed: parseInt(e.target.value) || 0 });
                            setTimeout(() => useFlightStore.getState().recalcShots(), 100);
                          }}
                          className="w-full rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-mono text-white/70 outline-none focus:border-[#00E5A0]/30"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] text-white/30">预计耗时 (min)</label>
                        <input
                          type="number"
                          value={shot.estimatedDuration}
                          onChange={(e) => {
                            updateShot(shot.id, { estimatedDuration: Math.max(0, parseInt(e.target.value) || 0) });
                            setTimeout(() => useFlightStore.getState().recalcShots(), 100);
                          }}
                          className="w-full rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-mono text-white/70 outline-none focus:border-[#00E5A0]/30"
                          min={0}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[10px] text-white/30">指定电池</label>
                        <select
                          value={shot.batteryId}
                          onChange={(e) => {
                            updateShot(shot.id, { batteryId: e.target.value });
                            setTimeout(() => useFlightStore.getState().recalcShots(), 100);
                          }}
                          className="w-full rounded border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-mono text-white/70 outline-none focus:border-[#00E5A0]/30"
                        >
                          {batteries.map((b) => (
                            <option key={b.id} value={b.id} className="bg-[#0F1419]">
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {(() => {
                      const battery = batteries.find((b) => b.id === shot.batteryId);
                      if (!battery) return null;
                      const healthColor =
                        battery.health >= 80 ? 'text-[#00E5A0]' : battery.health >= 60 ? 'text-[#FFB800]' : 'text-[#FF4757]';
                      const isLow = shot.estimatedDuration > battery.estimatedFlightTime;
                      return (
                        <div className={`mb-3 rounded-md border px-3 py-2.5 ${
                          isLow ? 'border-[#FFB800]/20 bg-[#FFB800]/[0.04]' : 'border-white/5 bg-white/[0.02]'
                        }`}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-[10px] text-white/40">绑定电池状态</span>
                            <span className={`text-[10px] font-mono font-bold ${battery.status === 'good' ? 'text-[#00E5A0]' : battery.status === 'warning' ? 'text-[#FFB800]' : 'text-[#FF4757]'}`}>
                              {battery.name} · {battery.status === 'good' ? '良好' : battery.status === 'warning' ? '衰减' : '严重衰减'}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-[10px]">
                            <div>
                              <span className="text-white/30">循环次数</span>
                              <div className="font-mono text-white/70">{battery.cycleCount} 次</div>
                            </div>
                            <div>
                              <span className="text-white/30">健康度</span>
                              <div className={`font-mono ${healthColor}`}>{battery.health}%</div>
                            </div>
                            <div>
                              <span className="text-white/30">可飞时间</span>
                              <div className={`font-mono ${isLow ? 'text-[#FFB800]' : 'text-white/70'}`}>
                                {battery.estimatedFlightTime}min
                                {isLow && (
                                  <span className="ml-1 text-[#FFB800]">
                                    ↓ {shot.estimatedDuration - battery.estimatedFlightTime}min
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {isLow && (
                            <div className="mt-2 text-[10px] text-[#FFB800]/70">
                              ⚠ 电池续航不足以完成该镜头（需 {shot.estimatedDuration}min）
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {shot.issues.length > 0 && (
                      <div className="mb-3 space-y-1">
                        {shot.issues.map((issue, i) => {
                          const isBatteryIssue = issue.includes('电量不足');
                          return (
                            <div
                              key={i}
                              className={`flex items-start gap-2 rounded px-2.5 py-1.5 ${
                                isBatteryIssue
                                  ? 'bg-[#FFB800]/[0.06]'
                                  : 'bg-[#FF4757]/[0.06]'
                              }`}
                            >
                              <AlertTriangle
                                size={12}
                                className={`mt-0.5 shrink-0 ${
                                  isBatteryIssue ? 'text-[#FFB800]/70' : 'text-[#FF4757]/70'
                                }`}
                              />
                              <span
                                className={`text-xs ${
                                  isBatteryIssue ? 'text-[#FFB800]/80' : 'text-[#FF4757]/80'
                                }`}
                              >
                                {issue}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {shot.alternatives.length > 0 && (
                      <div>
                        <div className="mb-1.5 flex items-center gap-1.5">
                          <MapPinned size={12} className="text-[#00E5A0]/60" />
                          <span className="text-[10px] text-white/40">建议替代机位</span>
                        </div>
                        <div className="space-y-1.5">
                          {shot.alternatives.map((alt, i) => (
                            <div key={i} className="rounded-md border border-[#00E5A0]/10 bg-[#00E5A0]/[0.03] px-3 py-2">
                              <div className="text-xs font-medium text-[#00E5A0]/80">{alt.name}</div>
                              <div className="text-[10px] text-white/40">{alt.description}</div>
                              <div className="mt-1 text-[10px] text-white/25">{alt.reason}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={addShot}
          className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-white/10 py-2 text-xs text-white/30 transition-colors hover:border-[#00E5A0]/30 hover:text-[#00E5A0]/70"
        >
          <Plus size={12} />
          添加镜头
        </button>
      </div>
    </GlassCard>
  );
}

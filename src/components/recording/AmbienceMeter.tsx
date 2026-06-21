import { cn } from "@/lib/utils";
import type { Recording } from "@/types";
import { distanceInfoMap, senseToDistance } from "@/lib/colors";
import type { Distance } from "@/types";

interface Props {
  recording: Recording;
}

export default function AmbienceMeter({ recording }: Props) {
  const ambience = recording.ambience ?? recording.ambienceScore ?? 0;
  const dist: Distance = recording.distance ?? senseToDistance(recording.distanceSense);
  const distList: Distance[] = ["near", "medium", "far", "extreme"];
  const activeIdx = distList.indexOf(dist);
  const peak = recording.peakDb ?? recording.peakDbfs ?? -12;
  const dr = recording.dynamicRange ?? 60;
  const rms = recording.rmsDbfs ?? -24;

  const r = 36;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, ambience / 10));
  const dash = circ * pct;

  return (
    <div className="rounded-2xl bg-forest-900/40 border border-forest-700/40 p-4 space-y-5">
      <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
        <span>🎚️</span> 氛围分析面板
      </h4>

      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0 w-[100px] h-[100px]">
            <svg width={100} height={100} viewBox="0 0 100 100" className="-rotate-90">
              <defs>
                <linearGradient id="ambienceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>
              <circle
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke="#163d2d"
                strokeWidth={8}
              />
              <circle
                cx={50}
                cy={50}
                r={r}
                fill="none"
                stroke="url(#ambienceGrad)"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circ - dash}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-cream font-display tabular-nums">
                {ambience.toFixed(0)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-slate-500">
                / 10
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-xs font-semibold text-slate-300">氛围值评分</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {ambience >= 8
                ? "极具沉浸感的自然声场，适合长期循环播放。"
                : ambience >= 5
                ? "良好的环境氛围，具备场景化叙事潜力。"
                : ambience >= 3
                ? "基础环境音存在，可能需要后期增强处理。"
                : "声场较薄，建议配合其他素材叠加以增强层次。"}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300">距离感</span>
            <span className="text-[10px] text-slate-500">
              {distanceInfoMap[dist].label}距离
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {distList.map((d, i) => {
              const info = distanceInfoMap[d];
              const active = i === activeIdx;
              return (
                <div
                  key={d}
                  className={cn(
                    "relative h-8 rounded-lg overflow-hidden border transition-all",
                    active
                      ? "border-moss-400/50 shadow-sm"
                      : "border-forest-700/40 bg-forest-800/30"
                  )}
                >
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-moss-400/50 to-amber-400/50" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-slate-200">
                    {info.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300">动态范围</span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {dr.toFixed(1)} dB
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-forest-800/70 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-moss-400 via-emerald-400 to-amber-400 rounded-full"
                style={{ width: `${Math.min(100, (dr / 90) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-300">RMS · 峰值</span>
              <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                {rms.toFixed(1)} / {peak.toFixed(1)} dBFS
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-forest-800/70 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-forest-600 to-amber-500/70 rounded-full"
                style={{
                  left: 0,
                  width: `${Math.max(0, ((rms + 60) / 60) * 100)}%`,
                }}
              />
              <div
                className="absolute inset-y-0 w-1 rounded-full bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.6)]"
                style={{
                  left: `calc(${Math.max(0, ((peak + 60) / 60) * 100)}% - 2px)`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] font-mono text-slate-600 tabular-nums">
              <span>-60</span>
              <span>-30</span>
              <span>0 dBFS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

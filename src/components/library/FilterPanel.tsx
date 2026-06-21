import { useMemo } from "react";
import {
  Filter,
  Search,
  X,
  Sparkles,
  Move3D,
  Volume2,
  Lock,
  Unlock,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUIStore,
  DISTANCE_SENSE_LIST,
} from "@/store/uiStore";

export default function FilterPanel() {
  const recordings = useUIStore((s) => s.recordings);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const ambienceMin = useUIStore((s) => s.ambienceMin);
  const ambienceMax = useUIStore((s) => s.ambienceMax);
  const distanceSenses = useUIStore((s) => s.distanceSenses);
  const peakMin = useUIStore((s) => s.peakMin);
  const peakMax = useUIStore((s) => s.peakMax);
  const lockedFilter = useUIStore((s) => s.lockedFilter);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);
  const setAmbienceRange = useUIStore((s) => s.setAmbienceRange);
  const toggleDistanceSense = useUIStore((s) => s.toggleDistanceSense);
  const setPeakRange = useUIStore((s) => s.setPeakRange);
  const setLockedFilter = useUIStore((s) => s.setLockedFilter);
  const resetFilters = useUIStore((s) => s.resetFilters);

  const activeCount = useMemo(() => {
    let n = 0;
    if (searchQuery.trim()) n++;
    if (ambienceMin > 1 || ambienceMax < 10) n++;
    if (distanceSenses.length > 0) n++;
    if (peakMin > -20 || peakMax < 0) n++;
    if (lockedFilter !== null) n++;
    return n;
  }, [searchQuery, ambienceMin, ambienceMax, distanceSenses, peakMin, peakMax, lockedFilter]);

  const filteredCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recordings.filter((r) => {
      if (
        q &&
        !r.fileName.toLowerCase().includes(q) &&
        !r.locationName.toLowerCase().includes(q) &&
        !r.tags.some((t) => t.toLowerCase().includes(q))
      ) return false;
      if (r.ambienceScore < ambienceMin || r.ambienceScore > ambienceMax) return false;
      if (distanceSenses.length > 0 && !distanceSenses.includes(r.distanceSense)) return false;
      if (r.peakDbfs < peakMin || r.peakDbfs > peakMax) return false;
      if (lockedFilter !== null && r.isLocked !== lockedFilter) return false;
      return true;
    }).length;
  }, [
    recordings,
    searchQuery,
    ambienceMin,
    ambienceMax,
    distanceSenses,
    peakMin,
    peakMax,
    lockedFilter,
  ]);

  return (
    <aside
      className={cn(
        "w-[320px] shrink-0 h-full flex flex-col",
        "bg-forest-900/60 backdrop-blur-xl border-r border-forest-700/40"
      )}
    >
      <header className="p-4 border-b border-forest-700/40 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/25 to-moss-500/15 border border-amber-500/30 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm leading-tight">工作室筛选</h3>
              <p className="text-[11px] text-slate-500">按技术参数快速定位素材</p>
            </div>
          </div>
          <button
            onClick={resetFilters}
            disabled={activeCount === 0}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all",
              activeCount > 0
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                : "bg-forest-800/40 text-slate-500 border border-forest-700/40 cursor-not-allowed"
            )}
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
            清空
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文件名 / 地点 / 标签…"
            className={cn(
              "w-full h-9 pl-9 pr-9 rounded-lg text-sm",
              "bg-forest-950/60 border border-forest-700/50 text-slate-200 placeholder:text-slate-500",
              "focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-forest-800/60"
            >
              <X className="w-3 h-3" strokeWidth={2.5} />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Filter className="w-3 h-3" strokeWidth={2} />
            <span>共 {recordings.length} 条 · 命中 {filteredCount}</span>
          </div>
          {activeCount > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium border border-amber-500/30">
              {activeCount} 项激活
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <FilterBlock icon={Sparkles} iconColor="text-moss-400" title="氛围值" subtitle="Ambience Score · 1 ~ 10">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>≥ {ambienceMin.toFixed(1)}</span>
              <span className="text-slate-500">至</span>
              <span>≤ {ambienceMax.toFixed(1)}</span>
            </div>
            <DualRangeSlider
              min={1}
              max={10}
              step={0.1}
              valueMin={ambienceMin}
              valueMax={ambienceMax}
              onChange={(a, b) => setAmbienceRange(a, b)}
              trackClass="bg-moss-500/30"
              activeClass="bg-moss-400"
              thumbClass="bg-moss-300"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
              {[1, 3, 5, 7, 10].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              <PresetChip label="高氛围 ≥8" onClick={() => setAmbienceRange(8, 10)} active={ambienceMin >= 8 && ambienceMax === 10} />
              <PresetChip label="全范围" onClick={() => setAmbienceRange(1, 10)} active={ambienceMin === 1 && ambienceMax === 10} />
            </div>
          </div>
        </FilterBlock>

        <FilterBlock icon={Move3D} iconColor="text-sky-400" title="距离感" subtitle="Distance Sense">
          <div className="grid grid-cols-2 gap-1.5">
            {DISTANCE_SENSE_LIST.map((sense) => {
              const active = distanceSenses.includes(sense);
              return (
                <button
                  key={sense}
                  onClick={() => toggleDistanceSense(sense)}
                  className={cn(
                    "px-2.5 py-2 rounded-lg text-xs font-medium transition-all border text-left",
                    active
                      ? "bg-sky-500/15 text-sky-300 border-sky-500/35"
                      : "bg-forest-800/40 text-slate-400 border-forest-700/40 hover:text-slate-200 hover:bg-forest-800/60"
                  )}
                >
                  {sense}
                </button>
              );
            })}
          </div>
          {distanceSenses.length > 0 && (
            <button
              onClick={() => distanceSenses.forEach((s) => toggleDistanceSense(s))}
              className="mt-2 text-[11px] text-sky-400 hover:text-sky-300"
            >
              清除 {distanceSenses.length} 项选择
            </button>
          )}
        </FilterBlock>

        <FilterBlock icon={Volume2} iconColor="text-rust-400" title="音量峰值" subtitle="Peak dBFS · -20 ~ 0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono tabular-nums">
              <span>≥ {peakMin.toFixed(1)} dB</span>
              <span className="text-slate-500">至</span>
              <span>≤ {peakMax.toFixed(1)} dB</span>
            </div>
            <DualRangeSlider
              min={-20}
              max={0}
              step={0.1}
              valueMin={peakMin}
              valueMax={peakMax}
              onChange={(a, b) => setPeakRange(a, b)}
              trackClass="bg-rust-500/30"
              activeClass="bg-rust-400"
              thumbClass="bg-rust-300"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-600 pt-0.5">
              {[-20, -15, -10, -5, 0].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              <PresetChip label="够响 ≥-6" onClick={() => setPeakRange(-6, 0)} active={peakMin >= -6 && peakMax === 0} />
              <PresetChip label="保留动态 ≥-12" onClick={() => setPeakRange(-12, 0)} active={peakMin >= -12 && peakMax === 0} />
              <PresetChip label="全范围" onClick={() => setPeakRange(-20, 0)} active={peakMin === -20 && peakMax === 0} />
            </div>
          </div>
        </FilterBlock>

        <FilterBlock icon={activeCount > 0 && lockedFilter !== null ? Lock : Unlock} iconColor="text-amber-400" title="项目锁定" subtitle="授权使用状态">
          <div className="grid grid-cols-3 gap-1.5">
            <LockButton
              label="全部"
              hint={`${recordings.length} 条`}
              active={lockedFilter === null}
              onClick={() => setLockedFilter(null)}
              variant="neutral"
            />
            <LockButton
              label="已锁定"
              hint={`${recordings.filter((r) => r.isLocked).length} 条`}
              active={lockedFilter === true}
              onClick={() => setLockedFilter(true)}
              variant="locked"
            />
            <LockButton
              label="未锁定"
              hint={`${recordings.filter((r) => !r.isLocked).length} 条`}
              active={lockedFilter === false}
              onClick={() => setLockedFilter(false)}
              variant="unlocked"
            />
          </div>
        </FilterBlock>
      </div>

      <footer className="p-4 border-t border-forest-700/40 shrink-0 space-y-2">
        <div
          className={cn(
            "rounded-xl p-3 border",
            activeCount > 0
              ? "bg-amber-500/10 border-amber-500/25"
              : "bg-forest-800/40 border-forest-700/40"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Filter
                className={cn("w-3.5 h-3.5", activeCount > 0 ? "text-amber-400" : "text-slate-500")}
                strokeWidth={2}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  activeCount > 0 ? "text-amber-300" : "text-slate-400"
                )}
              >
                {activeCount > 0 ? `${activeCount} 项筛选条件生效` : "未设置筛选条件"}
              </span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-slate-400">
              {filteredCount}/{recordings.length}
            </span>
          </div>
          {activeCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-2 w-full py-1.5 rounded-md text-[11px] font-medium bg-amber-500 hover:bg-amber-400 text-forest-950 transition-colors"
            >
              清空所有筛选条件
            </button>
          )}
        </div>
      </footer>
    </aside>
  );
}

function FilterBlock({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-3.5 bg-forest-950/40 border border-forest-700/40">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center",
            "bg-forest-800/60 border border-forest-700/50"
          )}
        >
          <Icon className={cn("w-3.5 h-3.5", iconColor)} strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <div className="text-xs font-semibold text-slate-200">{title}</div>
          {subtitle && <div className="text-[10px] text-slate-500">{subtitle}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function PresetChip({
  label,
  onClick,
  active,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2 py-1 rounded-md text-[10px] font-medium transition-all border",
        active
          ? "bg-forest-600/40 text-forest-100 border-forest-500/50"
          : "bg-forest-800/40 text-slate-400 border-forest-700/40 hover:text-slate-200 hover:bg-forest-800/60"
      )}
    >
      {label}
    </button>
  );
}

function LockButton({
  label,
  hint,
  active,
  onClick,
  variant,
}: {
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
  variant: "neutral" | "locked" | "unlocked";
}) {
  const colors = {
    neutral: {
      active: "bg-slate-500/15 text-slate-200 border-slate-500/40",
    },
    locked: {
      active: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    },
    unlocked: {
      active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    },
  } as const;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 py-2.5 rounded-lg border transition-all",
        active
          ? colors[variant].active
          : "bg-forest-800/40 text-slate-400 border-forest-700/40 hover:text-slate-200 hover:bg-forest-800/60"
      )}
    >
      <span className="text-xs font-semibold">{label}</span>
      <span className="text-[10px] opacity-70">{hint}</span>
    </button>
  );
}

function DualRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  trackClass,
  activeClass,
  thumbClass,
}: {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  trackClass?: string;
  activeClass?: string;
  thumbClass?: string;
}) {
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const minPct = pct(valueMin);
  const maxPct = pct(valueMax);

  return (
    <div className="relative h-7 flex items-center">
      <div className={cn("absolute inset-x-0 h-1.5 rounded-full", trackClass)}>
        <div
          className={cn("absolute h-full rounded-full", activeClass)}
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(Math.min(v, valueMax - step), valueMax);
        }}
        className="dual-range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
        style={{ zIndex: 3 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          onChange(valueMin, Math.max(v, valueMin + step));
        }}
        className="dual-range-thumb absolute inset-x-0 w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
        style={{ zIndex: 4 }}
      />
      <style>{`
        .dual-range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #fde68a;
          border: 2px solid #111812;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px rgba(251, 191, 36, 0.25);
          cursor: pointer;
          transition: transform 120ms ease;
          margin-top: -1px;
        }
        .dual-range-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .dual-range-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 9999px;
          background: #fde68a;
          border: 2px solid #111812;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4), 0 0 0 2px rgba(251, 191, 36, 0.25);
          cursor: pointer;
        }
      `}</style>
      {thumbClass && null}
    </div>
  );
}

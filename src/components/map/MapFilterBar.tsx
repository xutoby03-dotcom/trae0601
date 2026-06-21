import { useState } from "react";
import { Search, Filter, FilterX, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

const tagColorMap: Record<string, string> = {
  雨林: "#059669",
  森林: "#10b981",
  山脉: "#6366f1",
  高原: "#8b5cf6",
  海岸: "#0ea5e9",
  海洋: "#0284c7",
  瀑布: "#06b6d4",
  河流: "#14b8a6",
  湿地: "#84cc16",
  乡村: "#a3e635",
  城市: "#64748b",
  沙漠: "#f59e0b",
};

const allTags = Object.keys(tagColorMap);
const weatherOptions = ["晴", "多云", "小雨", "雷阵雨", "大雪", "雾"];
const lockOptions = [
  { key: "all", label: "全部状态", icon: "🎯" },
  { key: "unlocked", label: "仅未锁定", icon: "🔓" },
  { key: "locked", label: "仅已锁定", icon: "🔒" },
];

export default function MapFilterBar() {
  const recordings = useUIStore((s) => s.recordings);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const setSearchQuery = useUIStore((s) => s.setSearchQuery);

  const [collapsed, setCollapsed] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedWeathers, setSelectedWeathers] = useState<string[]>([]);
  const [lockFilter, setLockFilter] = useState("all");
  const [ambienceRange, setAmbienceRange] = useState<[number, number]>([1, 10]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  const toggleWeather = (w: string) => {
    setSelectedWeathers((prev) =>
      prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]
    );
  };
  const resetAll = () => {
    setSelectedTags([]);
    setSelectedWeathers([]);
    setLockFilter("all");
    setAmbienceRange([1, 10]);
    setSearchQuery("");
  };

  const activeFilterCount =
    selectedTags.length +
    selectedWeathers.length +
    (lockFilter !== "all" ? 1 : 0) +
    (ambienceRange[0] > 1 || ambienceRange[1] < 10 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  if (collapsed) {
    return (
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-[460px] max-w-[90%]">
        <div className="rounded-2xl p-2 bg-forest-900/90 backdrop-blur-xl border border-forest-700/40 shadow-2xl flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索地点、文件名、标签..."
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-forest-950/60 border border-forest-700/40 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={() => setCollapsed(false)}
            className="shrink-0 h-9 px-3 rounded-xl bg-forest-950/60 border border-forest-700/40 flex items-center gap-1.5 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">筛选</span>
            {activeFilterCount > 0 && (
              <span className="ml-0.5 px-1.5 min-w-[18px] h-[18px] inline-flex items-center justify-center rounded-full bg-amber-500 text-forest-950 text-[10px] font-bold font-mono">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-[640px] max-w-[95%]">
      <div className="rounded-2xl bg-forest-900/92 backdrop-blur-xl border border-forest-700/40 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 p-3 pb-2 border-b border-forest-700/30">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索采样点地点、文件名或环境标签..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-forest-950/60 border border-forest-700/40 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button
            onClick={() => setCollapsed(true)}
            className="shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-forest-950/60 border border-forest-700/40 text-slate-400 hover:text-cream hover:border-forest-600 transition-colors"
            title="折叠筛选面板"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetAll}
              className="shrink-0 h-10 px-3 rounded-xl flex items-center gap-1.5 bg-rust-500/10 border border-rust-500/30 text-rust-400 text-xs font-medium hover:bg-rust-500/15 hover:border-rust-500/50 transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              清除
            </button>
          )}
        </div>

        <div className="p-3 space-y-2.5 max-h-[42vh] overflow-y-auto">
          <FilterRow label="� 环境标签">
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => {
                const active = selectedTags.includes(tag);
                const c = tagColorMap[tag];
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-medium",
                      "border transition-all duration-200 inline-flex items-center gap-1",
                      active
                        ? "border-current"
                        : "bg-forest-800/50 text-slate-400 border-forest-700/40 hover:bg-forest-800/70 hover:text-slate-300"
                    )}
                    style={
                      active
                        ? {
                            backgroundColor: c + "1a",
                            color: c,
                            borderColor: c + "55",
                          }
                        : undefined
                    }
                  >
                    {active && <Check className="w-3 h-3" strokeWidth={3} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </FilterRow>

          <FilterRow label="🌤️ 天气条件">
            <div className="flex flex-wrap gap-1.5">
              {weatherOptions.map((w) => {
                const active = selectedWeathers.includes(w);
                return (
                  <button
                    key={w}
                    onClick={() => toggleWeather(w)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[11px] font-medium border transition-all",
                      active
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                        : "bg-forest-800/40 border-forest-700/40 text-slate-400 hover:bg-forest-800/60 hover:text-slate-200"
                    )}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </FilterRow>

          <div className="grid grid-cols-2 gap-2.5">
            <FilterRow label="🔒 锁定状态">
              <div className="flex gap-1.5">
                {lockOptions.map((o) => (
                  <button
                    key={o.key}
                    onClick={() => setLockFilter(o.key)}
                    className={cn(
                      "flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all inline-flex items-center justify-center gap-1",
                      lockFilter === o.key
                        ? "bg-moss-400/15 border-moss-400/40 text-moss-400"
                        : "bg-forest-800/40 border-forest-700/40 text-slate-400 hover:bg-forest-800/60 hover:text-slate-200"
                    )}
                  >
                    <span>{o.icon}</span>
                    <span>{o.label}</span>
                  </button>
                ))}
              </div>
            </FilterRow>

            <FilterRow label="✨ 氛围范围">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="text-moss-400 tabular-nums">{ambienceRange[0]}</span>
                  <span className="text-slate-500">—</span>
                  <span className="text-amber-400 tabular-nums">{ambienceRange[1]}</span>
                  <span className="text-slate-500">/ 10</span>
                </div>
                <div className="relative h-4 flex items-center">
                  <div className="absolute inset-x-0 h-1.5 rounded-full bg-forest-800/70" />
                  <div
                    className="absolute h-1.5 rounded-full bg-gradient-to-r from-moss-400 to-amber-400"
                    style={{
                      left: `${((ambienceRange[0] - 1) / 9) * 100}%`,
                      right: `${100 - ((ambienceRange[1] - 1) / 9) * 100}%`,
                    }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={ambienceRange[0]}
                    onChange={(e) =>
                      setAmbienceRange(([_, max]) => [Math.min(Number(e.target.value), max), max])
                    }
                    className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer range-slider-min z-10"
                  />
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={ambienceRange[1]}
                    onChange={(e) =>
                      setAmbienceRange(([min, _]) => [min, Math.max(Number(e.target.value), min)])
                    }
                    className="absolute inset-x-0 w-full appearance-none bg-transparent cursor-pointer range-slider-max z-20"
                  />
                </div>
              </div>
            </FilterRow>
          </div>
        </div>

        <div className="px-3 py-2 border-t border-forest-700/30 bg-forest-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="font-mono text-slate-400">
              共 <span className="text-cream">{recordings.length}</span> 个采样点
            </span>
            {activeFilterCount > 0 && (
              <span className="text-amber-400">
                已选 {activeFilterCount} 项筛选条件
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            地图视图 · 声景图集
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
        {label}
      </div>
      {children}
    </div>
  );
}

// @ts-nocheck
import { useState } from "react";
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Tag,
  Folder,
  Lock,
  Gauge,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export default function FilterPanel() {
  const recordings = useUIStore((s) => s.recordings);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    collection: true,
    date: true,
    tags: false,
    status: false,
    environment: false,
  });

  const allTags = Array.from(new Set(recordings.flatMap((r) => r.tags)));
  const toggle = (key: string) =>
    setExpanded((e) => ({ ...e, [key]: !e[key] }));

  return (
    <aside
      className={cn(
        "w-[300px] shrink-0 h-full flex flex-col",
        "bg-forest-900/60 backdrop-blur-xl border-r border-forest-700/40"
      )}
    >
      <header className="p-4 border-b border-forest-700/40 shrink-0">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" strokeWidth={2} />
          <h3 className="font-semibold text-slate-100">高级筛选</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">共 {recordings.length} 条素材</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <FilterSection
          title="素材合集"
          icon={Folder}
          expanded={expanded.collection}
          onToggle={() => toggle("collection")}
        >
          <div className="space-y-1.5">
            <CollectionItem name="全部素材" count={6} active icon="🎵" />
            <CollectionItem name="我的收藏" count={3} icon="⭐" />
            <CollectionItem name="最近上传" count={4} icon="🕒" />
            <CollectionItem name="常用标签" count={2} icon="🏷️" />
            <CollectionItem name="回收站" count={0} icon="🗑️" />
          </div>
        </FilterSection>

        <FilterSection
          title="上传时间"
          icon={Calendar}
          expanded={expanded.date}
          onToggle={() => toggle("date")}
        >
          <div className="space-y-2">
            <DateChip label="今天" count={0} />
            <DateChip label="本周" count={2} />
            <DateChip label="本月" count={4} active />
            <DateChip label="本季度" count={6} />
            <DateChip label="今年" count={6} />
          </div>
        </FilterSection>

        <FilterSection
          title="标签"
          icon={Tag}
          expanded={expanded.tags}
          onToggle={() => toggle("tags")}
        >
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        </FilterSection>

        <FilterSection
          title="状态"
          icon={Lock}
          expanded={expanded.status}
          onToggle={() => toggle("status")}
        >
          <div className="space-y-1.5">
            <StatusItem label="已锁定" count={3} color="amber" />
            <StatusItem label="可编辑" count={3} color="green" />
            <StatusItem label="待处理" count={1} color="blue" />
            <StatusItem label="有问题" count={0} color="red" />
          </div>
        </FilterSection>

        <FilterSection
          title="采样规格"
          icon={Gauge}
          expanded={expanded.environment}
          onToggle={() => toggle("environment")}
        >
          <div className="space-y-3">
            <SpecGroup
              label="采样率"
              options={["48 kHz", "96 kHz", "192 kHz"]}
              activeIdx={2}
            />
            <SpecGroup label="位深" options={["16 bit", "24 bit", "32 bit"]} activeIdx={1} />
          </div>
        </FilterSection>
      </div>

      <footer className="p-4 border-t border-forest-700/40 shrink-0 space-y-2">
        <button
          className={cn(
            "w-full py-2 rounded-lg text-sm font-medium",
            "bg-amber-500 hover:bg-amber-400 text-forest-950",
            "shadow-lg shadow-amber-500/20",
            "transition-colors duration-200"
          )}
          onClick={() => console.log("Apply filters")}
        >
          应用筛选
        </button>
        <button
          className={cn(
            "w-full py-2 rounded-lg text-sm",
            "text-slate-400 hover:text-slate-200 hover:bg-forest-800/40",
            "transition-colors duration-200"
          )}
          onClick={() => console.log("Clear filters")}
        >
          清除全部
        </button>
      </footer>
    </aside>
  );
}

function FilterSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden border transition-colors",
        "bg-forest-950/30 border-forest-700/40"
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2.5",
          "hover:bg-forest-800/30 transition-colors duration-200"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
          <span className="text-sm font-medium text-slate-200">{title}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-500" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" strokeWidth={2} />
        )}
      </button>
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-forest-700/30">
          {children}
        </div>
      )}
    </div>
  );
}

function CollectionItem({
  name,
  count,
  active,
  icon,
}: {
  name: string;
  count: number;
  active?: boolean;
  icon: string;
}) {
  return (
    <button
      onClick={() => console.log("Select collection:", name)}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left",
        "transition-all duration-200",
        active
          ? "bg-amber-500/15 border border-amber-500/30"
          : "hover:bg-forest-800/50 border border-transparent"
      )}
    >
      <span className="text-base">{icon}</span>
      <span
        className={cn(
          "flex-1 text-sm truncate",
          active ? "text-amber-400 font-medium" : "text-slate-300"
        )}
      >
        {name}
      </span>
      <span
        className={cn(
          "px-1.5 py-0.5 rounded-full text-[10px] font-bold",
          active
            ? "bg-amber-500/25 text-amber-300"
            : "bg-forest-800/60 text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function DateChip({
  label,
  count,
  active,
}: {
  label: string;
  count: number;
  active?: boolean;
}) {
  return (
    <button
      onClick={() => console.log("Select date:", label)}
      className={cn(
        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs",
        "transition-all duration-200",
        active
          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
          : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/50 border border-transparent"
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          "font-bold tabular-nums",
          active ? "text-amber-300" : "text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function TagChip({ tag }: { tag: string }) {
  const [active, setActive] = useState(false);
  return (
    <button
      onClick={() => setActive((v) => !v)}
      className={cn(
        "px-2.5 py-1 rounded-full text-[11px] font-medium",
        "transition-all duration-200",
        active
          ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
          : "bg-forest-800/50 text-slate-400 border border-forest-700/40 hover:bg-forest-800/70 hover:text-slate-300"
      )}
    >
      #{tag}
    </button>
  );
}

function StatusItem({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "amber" | "green" | "blue" | "red";
}) {
  const [active, setActive] = useState(color === "amber");
  const colorMap = {
    amber: {
      dot: "bg-amber-400",
      active: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    green: {
      dot: "bg-emerald-400",
      active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    blue: {
      dot: "bg-sky-400",
      active: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    },
    red: {
      dot: "bg-rose-400",
      active: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
  } as const;

  return (
    <button
      onClick={() => setActive((v) => !v)}
      className={cn(
        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left",
        "transition-all duration-200 border",
        active ? colorMap[color].active : "border-transparent hover:bg-forest-800/50"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", colorMap[color].dot)} />
      <span
        className={cn(
          "flex-1 text-sm",
          active ? colorMap[color].active.split(" ")[1] : "text-slate-300"
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-[10px] font-bold tabular-nums",
          active ? colorMap[color].active.split(" ")[1] : "text-slate-500"
        )}
      >
        {count}
      </span>
    </button>
  );
}

function SpecGroup({
  label,
  options,
  activeIdx,
}: {
  label: string;
  options: string[];
  activeIdx?: number;
}) {
  const [active, setActive] = useState<number | null>(activeIdx ?? null);
  return (
    <div>
      <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1">
        {options.map((opt, i) => (
          <button
            key={opt}
            onClick={() => setActive(active === i ? null : i)}
            className={cn(
              "py-1.5 rounded-md text-[11px] font-medium",
              "transition-all duration-200",
              active === i
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-forest-800/40 text-slate-400 border border-forest-700/40 hover:bg-forest-800/60 hover:text-slate-300"
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

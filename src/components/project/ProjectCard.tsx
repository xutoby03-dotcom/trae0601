import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Lock,
  Calendar,
  FileAudio,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
} from 'lucide-react';
import { cn } from "@/lib/utils";
import type { Project } from "@/store/uiStore";

interface ProjectCardProps {
  project: Project;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function ProjectCard({
  project,
  isExpanded,
  onToggleExpand,
}: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const target = project.targetRecordingCount || 20;
  const used = project.usedRecordingCount ?? project.recordingIds.length;
  const progressPct = Math.min(100, (used / target) * 100);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "rounded-2xl overflow-hidden border transition-all duration-300",
        "bg-slate-panel/60 backdrop-blur-xl",
        isExpanded
          ? "border-amber-500/50 shadow-2xl shadow-amber-500/10 ring-2 ring-amber-500/20"
          : isHovered
          ? "border-forest-600/60 shadow-xl shadow-forest-900/30"
          : "border-forest-700/40"
      )}
      style={{ height: "240px" }}
    >
      <div className="h-[60%] relative overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-500 bg-gradient-to-br",
            project.status === "active"
              ? "from-emerald-600 via-teal-700 to-forest-900"
              : project.status === "planning"
              ? "from-sky-600 via-indigo-700 to-forest-900"
              : "from-slate-600 via-slate-700 to-forest-900"
          )}
          style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
        />
        <div
          className="absolute inset-0 opacity-25 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
        >
          <span className="font-display text-5xl font-bold text-white select-none leading-none rotate-[-6deg] truncate px-4">
            {project.name.slice(0, 6)}
          </span>
        </div>

        <div
          className={cn(
            "absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border transition-all",
            project.status === "active"
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : project.status === "planning"
              ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
              : "bg-slate-500/15 text-slate-400 border-slate-500/30"
          )}
        >
          <span className="flex items-center gap-1">
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                project.status === "active"
                  ? "bg-emerald-400"
                  : project.status === "planning"
                  ? "bg-sky-400"
                  : "bg-slate-400"
              )}
            />
            {project.status === "active"
              ? "进行中"
              : project.status === "planning"
              ? "规划中"
              : "已完成"}
          </span>
        </div>

        {project.license?.isLicensed && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 backdrop-blur-sm flex items-center gap-1.5">
            <Lock className="w-3 h-3" strokeWidth={2.5} />
            {project.license.type === "exclusive" ? "独家授权" : "非独家"}
          </div>
        )}

        <div
          className="absolute inset-x-0 bottom-0 p-4 cursor-pointer"
          onClick={onToggleExpand}
        >
          <h3 className="font-display text-2xl text-white font-bold leading-tight mb-1 truncate">
            {project.name}
          </h3>
          <p className="text-xs text-white/70 line-clamp-1">
            {project.clientName ?? "未指定客户"}
          </p>
        </div>
      </div>

      <div className="h-[40%] p-4 space-y-3 bg-slate-panel/95">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider font-medium">
              素材采集进度
            </span>
            <span className="text-xs font-bold tabular-nums text-amber-400">
              {used}/{target}
            </span>
          </div>
          <div className="h-2 rounded-full bg-forest-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-moss-400 transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <MiniStat icon={FileAudio} label="素材" value={project.recordingIds.length} />
          <MiniStat icon={Users} label="客户" value={project.clientName ? "有" : "无"} />
          <MiniStat
            icon={Calendar}
            label="创建"
            value={(project.createdAt ?? "").slice(2, 7) || "—"}
          />
        </div>

        <div
          className={cn(
            "flex gap-2 overflow-hidden transition-all duration-300",
            isHovered ? "max-h-10 opacity-100 mt-2" : "max-h-0 opacity-0"
          )}
        >
          <button
            onClick={onToggleExpand}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-forest-700/60 text-cream hover:bg-forest-600 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            查看详情
          </button>
          <button
            onClick={() => console.log('[Project] 编辑:', project.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-forest-800/60 text-slate-200 hover:bg-forest-700/80 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => console.log('[Project] 导出授权报告:', project.id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors border border-amber-500/30"
          >
            授权报告
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-forest-900/40 border border-forest-700/40 p-2 text-center">
      <Icon className="w-4 h-4 mx-auto text-slate-500 mb-1" strokeWidth={2} />
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <div className="text-xs font-semibold text-slate-200 tabular-nums truncate">
        {value}
      </div>
    </div>
  );
}

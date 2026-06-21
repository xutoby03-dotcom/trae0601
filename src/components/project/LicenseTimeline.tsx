import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck2,
  Plus,
  Calendar,
  Unlock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Project, LicenseEvent } from "@/store/uiStore";

interface LicenseTimelineProps {
  project: Project;
}

export default function LicenseTimeline({
  project,
}: LicenseTimelineProps) {
  const timeline = project.licenseTimeline ?? [];

  return (
    <div
      className={cn(
        "mt-6 rounded-2xl overflow-hidden border border-forest-700/40",
        "bg-forest-900/40 backdrop-blur-xl"
      )}
    >
      <div className="px-5 py-4 border-b border-forest-700/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-400/5 border border-amber-500/30 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5 text-amber-400" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-display text-lg text-cream font-semibold">
              项目的授权追踪
            </h4>
            <p className="text-xs text-slate-500">
              项目 {project.name} 的授权历史时间线
            </p>
          </div>
        </div>
        <button
          onClick={() => console.log("Renew license for:", project.id)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium",
            "bg-amber-500 hover:bg-amber-600 text-white",
            "shadow-lg shadow-amber-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
          )}
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          申请续期
        </button>
      </div>

      <div className="p-5 space-y-6">
        {project.recordingIds.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-moss-400/20 border border-moss-400/40 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-moss-400" />
              </div>
              <h5 className="text-sm font-medium text-slate-200">
                关联素材数量: {project.recordingIds.length}
              </h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.recordingIds.slice(0, 8).map((id, i) => (
                <div
                  key={id}
                  className="px-2.5 py-1 rounded-lg bg-forest-800/50 border border-forest-700/50 text-[11px] text-slate-400 font-mono"
                >
                  REC-{id.slice(0, 6)}
                </div>
              ))}
              {project.recordingIds.length > 8 && (
                <div className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] text-amber-400">
                  +{project.recordingIds.length - 8} 更多
                </div>
              )}
            </div>
            <div className="mt-3">
              <button
                onClick={() => console.log("[Timeline] 解锁所有素材:", project.id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-forest-700/60 text-slate-200 hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/30 border border-transparent transition-all"
              >
                <Unlock className="w-3.5 h-3.5" />
                批量解除锁定
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gradient-to-b from-amber-500/60 via-forest-600/60 to-forest-700/40" />

          <div className="space-y-4">
            {timeline.length > 0 ? (
              timeline.map((event, idx) => (
                <TimelineItem
                  key={event.id}
                  event={event}
                  isLast={idx === timeline.length - 1}
                />
              ))
            ) : (
              <div className="pl-12 py-6">
                <p className="text-sm text-slate-500">暂无授权历史事件</p>
              </div>
            )}
          </div>
        </div>

        {project.recordingIds.length === 0 && (
          <div className="p-6 rounded-xl border-2 border-dashed border-forest-700/50 bg-forest-900/30 text-center">
            <div className="text-4xl mb-3">🔓</div>
            <p className="text-slate-300 font-medium mb-1">
              本项目暂无关联素材
            </p>
            <p className="text-xs text-slate-500 mb-4">
              前往素材库选择素材并添加到项目
            </p>
            <button
              onClick={() => console.log("[Timeline] 跳转到素材库")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              去素材库选素材
            </button>
          </div>
        )}

        <div className="pt-5 border-t border-forest-700/40 grid grid-cols-3 gap-4">
          <TimelineSummary
            label="当前状态"
            value={
              project.license?.isLicensed
                ? project.license.type === "exclusive"
                  ? "独家授权中"
                  : "授权生效中"
                : "未授权"
            }
            tone={project.license?.isLicensed ? "emerald" : "slate"}
            icon={CheckCircle2}
          />
          <TimelineSummary
            label="生效日期"
            value={project.license?.startedAt ? project.license.startedAt.slice(0, 10) : "—"}
            tone="amber"
            icon={Calendar}
          />
          <TimelineSummary
            label="到期日期"
            value={project.license?.expiresAt ? project.license.expiresAt.slice(0, 10) : "—"}
            tone="sky"
            icon={Clock}
          />
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  isLast,
}: {
  event: LicenseEvent;
  isLast: boolean;
}) {
  const toneConfig = {
    success: {
      dot: "bg-emerald-400",
      ring: "bg-emerald-400/20 border-emerald-400/50",
      tag: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
    },
    warning: {
      dot: "bg-amber-400",
      ring: "bg-amber-400/20 border-amber-400/50",
      tag: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      icon: AlertTriangle,
    },
    pending: {
      dot: "bg-sky-400 animate-pulse",
      ring: "bg-sky-400/20 border-sky-400/50",
      tag: "bg-sky-500/15 text-sky-400 border-sky-500/30",
      icon: Clock,
    },
    info: {
      dot: "bg-violet-400",
      ring: "bg-violet-400/20 border-violet-400/50",
      tag: "bg-violet-500/15 text-violet-400 border-violet-500/30",
      icon: FileCheck2,
    },
  } as const;

  const cfg = toneConfig[event.tone];
  const Icon = cfg.icon;

  return (
    <div className="relative flex gap-4 pb-4">
      <div className="relative shrink-0 w-10 flex flex-col items-center pt-0.5">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center border z-10",
            "bg-forest-900",
            cfg.ring
          )}
        >
          <Icon
            className="w-4 h-4 text-white"
            strokeWidth={2.5}
            fill="currentColor"
          />
        </div>
        <div
          className={cn(
            "absolute top-0 w-2.5 h-2.5 rounded-full -translate-y-1.5",
            cfg.dot,
            "shadow-md shadow-current/30"
          )}
          style={{ left: "15px" }}
        />
      </div>

      <div className="flex-1 pb-1">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h5 className="text-sm font-semibold text-slate-100">
            {event.title}
          </h5>
          <span
            className={cn(
              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              cfg.tag
            )}
          >
            {event.label}
          </span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-1.5">
          {event.description}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Calendar className="w-3 h-3" strokeWidth={2} />
          {event.date}
          {event.operator && (
            <>
              <span>·</span>
              <span>操作人: {event.operator}</span>
            </>
          )}
        </div>
      </div>

      {isLast && (
        <div className="absolute left-[19px] bottom-0 w-px h-4 bg-gradient-to-b from-transparent to-forest-700/20" />
      )}
    </div>
  );
}

function TimelineSummary({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  tone: "emerald" | "amber" | "sky" | "slate";
  icon: LucideIcon;
}) {
  const toneMap = {
    emerald: {
      bg: "bg-emerald-500/10 border-emerald-500/30",
      text: "text-emerald-400",
    },
    amber: {
      bg: "bg-amber-500/10 border-amber-500/30",
      text: "text-amber-400",
    },
    sky: {
      bg: "bg-sky-500/10 border-sky-500/30",
      text: "text-sky-400",
    },
    slate: {
      bg: "bg-slate-500/10 border-slate-500/30",
      text: "text-slate-400",
    },
  } as const;

  return (
    <div className={cn("rounded-xl p-3 border", toneMap[tone].bg)}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("w-3.5 h-3.5", toneMap[tone].text)} strokeWidth={2} />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
          {label}
        </span>
      </div>
      <div className={cn("text-sm font-semibold", toneMap[tone].text)}>
        {value}
      </div>
    </div>
  );
}

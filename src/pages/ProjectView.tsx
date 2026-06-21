import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import ProjectCard from "@/components/project/ProjectCard";
import LicenseTimeline from "@/components/project/LicenseTimeline";

export default function ProjectView() {
  const projects = useUIStore((s) => s.projects);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedProjectId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 font-display">
              项目管理
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              组织、跟踪和授权您的声景采集项目
            </p>
          </div>

          <button
            onClick={() => console.log("Create new project")}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium",
              "bg-amber-500 hover:bg-amber-600 text-white",
              "shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40",
              "transition-all duration-200 active:scale-95"
            )}
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            创建项目
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16">
          {projects.map((project) => {
            const isExpanded = expandedProjectId === project.id;

            return (
              <div key={project.id} className="flex flex-col">
                <ProjectCard
                  project={project}
                  isExpanded={isExpanded}
                  onToggleExpand={() => handleToggleExpand(project.id)}
                />

                {isExpanded && <LicenseTimeline project={project} />}
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl p-6 border border-forest-700/40 bg-forest-900/30 backdrop-blur">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-amber-400" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                项目统计总览
              </h3>
              <p className="text-xs text-slate-500">当前所有项目的整体情况</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="项目总数"
              value={projects.length.toString()}
              tint="amber"
            />
            <StatCard
              label="进行中"
              value={projects.filter((p) => p.status === "active").length.toString()}
              tint="emerald"
            />
            <StatCard
              label="已完成"
              value={projects.filter((p) => p.status === "completed").length.toString()}
              tint="sky"
            />
            <StatCard
              label="素材总量"
              value={projects.reduce((acc, p) => acc + p.recordingIds.length, 0).toString()}
              tint="violet"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint: "amber" | "emerald" | "sky" | "violet";
}) {
  const tintMap = {
    amber: "from-amber-500/15 to-amber-400/5 border-amber-500/30 text-amber-400",
    emerald:
      "from-emerald-500/15 to-emerald-400/5 border-emerald-500/30 text-emerald-400",
    sky: "from-sky-500/15 to-sky-400/5 border-sky-500/30 text-sky-400",
    violet:
      "from-violet-500/15 to-violet-400/5 border-violet-500/30 text-violet-400",
  } as const;

  return (
    <div
      className={cn(
        "rounded-xl p-4 border bg-gradient-to-br",
        tintMap[tint]
      )}
    >
      <div className="text-[11px] uppercase tracking-wider text-slate-400 font-medium mb-2">
        {label}
      </div>
      <div className="text-2xl font-bold text-slate-100 tabular-nums">
        {value}
      </div>
    </div>
  );
}

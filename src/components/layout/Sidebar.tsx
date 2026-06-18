import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  FileText,
  BarChart3,
  Syringe,
} from "lucide-react";
import { useStore } from "@/store";
import { useMemo } from "react";
import { today } from "@/utils/date";

const navItems = [
  { to: "/", label: "总览看板", icon: LayoutDashboard },
  { to: "/cages", label: "动物档案", icon: Boxes },
  { to: "/tasks", label: "每日任务", icon: ClipboardList },
  { to: "/records", label: "操作记录", icon: FileText },
  { to: "/statistics", label: "统计分析", icon: BarChart3 },
];

export function Sidebar() {
  const alerts = useStore((s) => s.alerts);
  const unresolvedCount = useMemo(() => alerts.filter((a) => !a.resolved).length, [alerts]);

  return (
    <aside className="w-60 shrink-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 flex flex-col sticky top-0">
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-900/30">
            <Syringe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              LabAnimal
            </h1>
            <p className="text-[11px] text-slate-400">饲喂管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary-600 text-white shadow-md shadow-primary-900/40"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
            {item.to === "/" && unresolvedCount > 0 && (
              <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-danger-500 text-white text-[11px] font-bold">
                {unresolvedCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-xl p-3">
          <p className="text-xs text-slate-400 mb-1">今日任务进度</p>
          <TaskProgress />
        </div>
      </div>
    </aside>
  );
}

function TaskProgress() {
  const dailyTasks = useStore((s) => s.dailyTasks);
  const todayStr = today();
  const tasks = useMemo(() => dailyTasks.filter((t) => t.taskDate === todayStr), [dailyTasks, todayStr]);
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length || 1;
  const pct = Math.round((completed / total) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-lg font-bold text-white font-mono">{pct}%</span>
        <span className="text-xs text-slate-400">
          {completed}/{total}
        </span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary-400 to-success-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

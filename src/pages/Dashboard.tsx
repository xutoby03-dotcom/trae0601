import { Link } from "react-router-dom";
import { useStore } from "@/store";
import { today } from "@/utils/date";
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Users,
  ArrowRight,
  AlertCircle,
  ThermometerSun,
  Clock,
} from "lucide-react";
import { SeverityTag } from "@/components/StatusTag";
import { ALERT_TYPE_LABEL, SPECIES_LABEL } from "@/types";
import { formatDateTime } from "@/utils/date";
import { TaskCard } from "@/components/TaskCard";
import { useMemo } from "react";

export default function Dashboard() {
  const cages = useStore((s) => s.cages);
  const dailyTasks = useStore((s) => s.dailyTasks);
  const allAlerts = useStore((s) => s.alerts);
  const groups = useStore((s) => s.researchGroups);
  const resolveAlert = useStore((s) => s.resolveAlert);
  const todayStr = today();
  const tasks = useMemo(() => dailyTasks.filter((t) => t.taskDate === todayStr), [dailyTasks, todayStr]);
  const alerts = useMemo(() => allAlerts.filter((a) => !a.resolved), [allAlerts]);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue");
  const pendingTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in_progress"
  );
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const stats = [
    {
      label: "笼盒/鱼缸总数",
      value: cages.length,
      icon: <Boxes className="w-5 h-5" />,
      color: "text-primary-600 bg-primary-50",
      link: "/cages",
    },
    {
      label: "今日任务",
      value: tasks.length,
      sub: `${completedTasks} 已完成`,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50",
      link: "/tasks",
    },
    {
      label: "活跃告警",
      value: alerts.length,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: alerts.length > 0 ? "text-danger-600 bg-danger-50" : "text-slate-500 bg-slate-100",
      link: "/tasks",
      danger: alerts.length > 0,
    },
    {
      label: "课题组",
      value: groups.length,
      icon: <Users className="w-5 h-5" />,
      color: "text-warning-600 bg-warning-50",
      link: "/statistics",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">总览看板</h1>
          <p className="text-sm text-slate-500 mt-1">
            {today()} 今日实验动物饲喂管理概况
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-sm text-slate-600">系统运行正常</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="card p-5 hover:shadow-md transition-all group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                {stat.icon}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  stat.danger ? "text-danger-600" : "text-slate-900"
                }`}
              >
                {stat.value}
              </span>
              {stat.sub && (
                <span className="text-xs text-slate-500">{stat.sub}</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5 col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              今日饲喂任务
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-success-500" />
                完成 {completedTasks}
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                待处理 {pendingTasks.length}
              </span>
              {overdueTasks.length > 0 && (
                <span className="flex items-center gap-1.5 text-danger-600">
                  <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
                  逾期 {overdueTasks.length}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-slate-500">今日完成率</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                {completionRate}%
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-success-500 rounded-full transition-all duration-700"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {[...overdueTasks, ...pendingTasks.slice(0, 4)].map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {overdueTasks.length === 0 && pendingTasks.length === 0 && (
              <div className="col-span-2 py-8 text-center text-sm text-slate-400">
                🎉 所有今日任务已完成！
              </div>
            )}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              告警提醒
            </h2>
            <Link
              to="/tasks"
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              全部查看
            </Link>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                暂无告警
              </div>
            ) : (
              alerts.slice(0, 5).map((a) => {
                const cage = useStore.getState().getCageById(a.cageId);
                const Icon =
                  a.type === "temperature_abnormal"
                    ? ThermometerSun
                    : a.type === "overdue_feeding"
                      ? Clock
                      : AlertTriangle;
                return (
                  <div
                    key={a.id}
                    className={`p-3 rounded-xl border ${
                      a.severity === "high"
                        ? "bg-danger-50 border-danger-200 animate-pulse-border"
                        : a.severity === "medium"
                          ? "bg-warning-50 border-warning-200"
                          : "bg-blue-50 border-blue-200"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          a.severity === "high"
                            ? "text-danger-500"
                            : a.severity === "medium"
                              ? "text-warning-500"
                              : "text-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <SeverityTag severity={a.severity} />
                          <span className="text-[11px] text-slate-500 font-mono">
                            {cage?.cageNumber}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-800 mb-0.5">
                          {ALERT_TYPE_LABEL[a.type]}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {a.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-slate-400">
                            {formatDateTime(a.createdAt)}
                          </span>
                          <button
                            onClick={() => resolveAlert(a.id)}
                            className="text-[11px] text-primary-600 hover:text-primary-700 font-medium"
                          >
                            处理
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">
            各物种分布
          </h2>
          <Link
            to="/cages"
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            查看档案 <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(["mouse", "zebrafish", "rat", "rabbit"] as const).map((sp) => {
            const count = cages.filter((c) => c.species === sp).length;
            const total = cages.length || 1;
            const pct = Math.round((count / total) * 100);
            return (
              <div
                key={sp}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    {SPECIES_LABEL[sp]}
                  </span>
                  <span className="text-lg font-bold font-mono text-slate-900">
                    {count}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

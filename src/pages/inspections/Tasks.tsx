import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Filter,
  Search,
  Calendar,
  Wrench,
  Play,
  CheckCircle2,
  Clock,
  CircleDot,
} from "lucide-react";
import type { InspectionTask } from "../../types";
import { useInspectionStore } from "../../store/inspectionStore";
import { useStationStore } from "../../store/stationStore";
import { formatDate, formatRelative } from "../../utils/formatters";
import { clsx } from "clsx";

const TASK_STATUS_LABELS: Record<InspectionTask["status"], string> = {
  pending: "待开始",
  in_progress: "进行中",
  completed: "已完成",
};

const TASK_STATUS_CONFIG: Record<
  InspectionTask["status"],
  { className: string; icon: typeof Clock }
> = {
  pending: { className: "badge-slate", icon: Clock },
  in_progress: { className: "badge-primary", icon: CircleDot },
  completed: { className: "badge-success", icon: CheckCircle2 },
};

type StatusFilter = "all" | InspectionTask["status"];

export default function InspectionTasks() {
  const tasks = useInspectionStore((s) => s.tasks);
  const stations = useStationStore((s) => s.stations);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [inspectorFilter, setInspectorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const inspectors = useMemo(() => {
    const set = new Set(tasks.map((t) => t.inspector));
    return Array.from(set);
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      if (inspectorFilter !== "all" && task.inspector !== inspectorFilter)
        return false;
      if (search && !task.name.toLowerCase().includes(search.toLowerCase()))
        return false;

      const taskDate = new Date(task.date);
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (taskDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (taskDate > to) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, inspectorFilter, search, dateFrom, dateTo]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      completed: tasks.filter((t) => t.status === "completed").length,
    };
  }, [tasks]);

  const resetFilters = () => {
    setDateFrom("");
    setDateTo("");
    setInspectorFilter("all");
    setStatusFilter("all");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">巡检任务</h1>
          <p className="text-slate-500 text-sm mt-1">
            管理和执行充电桩日常巡检任务
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.total}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">任务总数</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.pending}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">待开始</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-500 flex items-center justify-center">
              <CircleDot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.inProgress}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">进行中</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-success-50 text-success-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-slate-800">
                {stats.completed}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">已完成</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">筛选条件</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <label className="input-label">搜索任务</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="输入任务名称"
                className="input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="input-label">开始日期</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">结束日期</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div>
            <label className="input-label">巡检员</label>
            <select
              className="input"
              value={inspectorFilter}
              onChange={(e) => setInspectorFilter(e.target.value)}
            >
              <option value="all">全部巡检员</option>
              {inspectors.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="input-label">任务状态</label>
            <select
              className="input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">全部状态</option>
              <option value="pending">待开始</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={resetFilters} className="btn-ghost text-sm">
            重置筛选
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  任务信息
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    日期
                  </div>
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    巡检员
                  </div>
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  桩位数量
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  进度
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  状态
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3.5">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16">
                    <div className="text-center text-slate-400">
                      <ClipboardCheck className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <div className="text-sm">暂无符合条件的巡检任务</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const progress =
                    task.stationIds.length > 0
                      ? (task.completedCount / task.stationIds.length) * 100
                      : 0;
                  const statusConfig = TASK_STATUS_CONFIG[task.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={clsx(
                              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                              task.status === "completed"
                                ? "bg-success-50 text-success-500"
                                : task.status === "in_progress"
                                ? "bg-primary-50 text-primary-500"
                                : "bg-slate-100 text-slate-500"
                            )}
                          >
                            <ClipboardCheck className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {task.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {formatRelative(task.date)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {formatDate(task.date)}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-white flex items-center justify-center text-xs font-medium shrink-0">
                            {task.inspector.charAt(0)}
                          </div>
                          <span className="text-sm text-slate-700">
                            {task.inspector}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {task.stationIds.length} 个桩位
                        </div>
                      </td>
                      <td className="px-5 py-4 w-48">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-1">
                              <div
                                className={clsx(
                                  "h-full rounded-full transition-all",
                                  progress >= 100
                                    ? "bg-gradient-to-r from-success-400 to-success-500"
                                    : "bg-gradient-to-r from-primary-400 to-primary-500"
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">
                                {task.completedCount}/{task.stationIds.length}
                              </span>
                              <span
                                className={clsx(
                                  "font-semibold",
                                  progress >= 100
                                    ? "text-success-600"
                                    : "text-primary-600"
                                )}
                              >
                                {progress.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={statusConfig.className}>
                          <StatusIcon className="w-3 h-3" />
                          {TASK_STATUS_LABELS[task.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {task.status !== "completed" ? (
                          <Link
                            to={`/inspections/execute/${task.id}`}
                            className="btn-primary !py-1.5 !px-3 !text-xs"
                          >
                            <Play className="w-3.5 h-3.5" />
                            执行
                          </Link>
                        ) : (
                          <button className="btn-ghost !py-1.5 !px-3 !text-xs text-slate-400 cursor-default">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            已完成
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

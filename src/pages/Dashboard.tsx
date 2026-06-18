import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Wrench,
  ClipboardCheck,
  MessageSquareWarning,
  ChevronRight,
  ArrowUpRight,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useStationStore } from "../store/stationStore";
import { useInspectionStore } from "../store/inspectionStore";
import { useRepairStore } from "../store/repairStore";
import StatCard from "../components/ui/StatCard";
import { StationStatusBadge } from "../components/ui/StatusBadge";
import { REPAIR_ISSUE_LABELS } from "../types";
import { formatRelative, formatPercent } from "../utils/formatters";
import { clsx } from "clsx";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];

export default function Dashboard() {
  const stations = useStationStore((s: any) => s.stations);
  const stats = useStationStore((s: any) => s.stats);
  const tasks = useInspectionStore((s: any) => s.tasks);
  const records = useInspectionStore((s: any) => s.records);
  const tickets = useRepairStore((s: any) => s.tickets);

  const { openTickets, abnormalRecords, pendingCount, todayTasks } = useMemo(() => {
    const openT = tickets.filter(
      (t: any) =>
        t.status === "pending" ||
        t.status === "processing" ||
        t.status === "maintenance"
    );
    const abnormalR = records
      .filter((r: any) => r.hasAbnormal)
      .sort(
        (a: any, b: any) =>
          new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
      );
    return {
      openTickets: openT,
      abnormalRecords: abnormalR,
      pendingCount: tickets.filter((t: any) => t.status === "pending").length,
      todayTasks: tasks.filter((t: any) => t.status !== "completed").slice(0, 3),
    };
  }, [tickets, records, tasks]);

  const buildingStatus = useMemo(() => {
    return BUILDINGS.map((building) => {
      const buildingStations = stations.filter((s) => s.building === building);
      return {
        building,
        total: buildingStations.length,
        online: buildingStations.filter((s) => s.status === "online").length,
        fault: buildingStations.filter(
          (s) => s.status === "fault" || s.status === "maintenance"
        ).length,
        offline: buildingStations.filter((s) => s.status === "offline").length,
        stations: buildingStations,
      };
    });
  }, [stations]);

  const pieData = [
    { name: "在线", value: stats.online, color: "#10B981" },
    { name: "离线", value: stats.offline, color: "#94A3B8" },
    { name: "故障", value: stats.fault, color: "#EF4444" },
    { name: "维修中", value: stats.maintenance, color: "#F59E0B" },
  ];

  const weekTrend = useMemo(() => {
    const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    return days.map((day, i) => ({
      day,
      巡检数: 15 + Math.floor(Math.random() * 8) + i * 2,
      报修数: 2 + Math.floor(Math.random() * 5),
    }));
  }, []);

  const recentAlerts = useMemo(() => {
    const ticketAlerts = openTickets.slice(0, 4).map((t) => ({
      id: `t_${t.id}`,
      type: "ticket" as const,
      title: `报修：${REPAIR_ISSUE_LABELS[t.issueType]}`,
      sub: t.description,
      station: stations.find((s) => s.id === t.stationId)?.code || "-",
      time: t.createdAt,
      priority: t.issueType === "plug_hot" ? "high" : "medium",
    }));

    const abnormalAlerts = abnormalRecords.slice(0, 3).map((r) => ({
      id: `a_${r.id}`,
      type: "inspection" as const,
      title: `巡检异常：${r.inspector}`,
      sub: "存在异常检查项需处理",
      station: stations.find((s) => s.id === r.stationId)?.code || "-",
      time: r.inspectDate,
      priority: "medium" as const,
    }));

    return [...ticketAlerts, ...abnormalAlerts]
      .sort(
        (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
      )
      .slice(0, 6);
  }, [openTickets, abnormalRecords, stations]);

  const stationUsage = [...stations]
    .sort((a, b) => (b.usageRate || 0) - (a.usageRate || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">总览看板</h1>
          <p className="text-slate-500 text-sm mt-1">
            实时掌握充电桩运行状态、巡检与报修进度
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/repairs/submit" className="btn-secondary">
            <MessageSquareWarning className="w-4 h-4" />
            居民报修入口
          </Link>
          <Link to="/inspections/tasks" className="btn-primary">
            <ClipboardCheck className="w-4 h-4" />
            开始巡检
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="充电桩总数"
          value={stats.total}
          icon={Zap}
          variant="primary"
          subtext={`覆盖 ${BUILDINGS.length} 栋居民楼`}
        />
        <StatCard
          title="在线运行"
          value={stats.online}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 5.2, label: "较上周" }}
        />
        <StatCard
          title="待处理报修"
          value={pendingCount}
          icon={MessageSquareWarning}
          variant="warning"
          trend={{ value: -12, label: "较上周" }}
        />
        <StatCard
          title="故障设备"
          value={stats.fault + stats.maintenance}
          icon={AlertTriangle}
          variant="danger"
          subtext="已暂停预约功能"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">楼栋充电桩分布</h2>
            <Link
              to="/stations"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {buildingStatus.map((b) => (
              <div
                key={b.building}
                className="group rounded-xl p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 hover:border-primary-200 hover:shadow-md transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-slate-800">
                    {b.building}
                  </div>
                  <div className="text-xs text-slate-500">
                    {b.total} 个桩位
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden mb-3 flex">
                  <div
                    className="h-full bg-success-500 transition-all"
                    style={{ width: `${(b.online / b.total) * 100}%` }}
                  />
                  {b.fault > 0 && (
                    <div
                      className="h-full bg-danger-500 transition-all"
                      style={{ width: `${(b.fault / b.total) * 100}%` }}
                    />
                  )}
                  {b.offline > 0 && (
                    <div
                      className="h-full bg-slate-400 transition-all"
                      style={{ width: `${(b.offline / b.total) * 100}%` }}
                    />
                  )}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {b.stations.map((s) => (
                    <Link
                      key={s.id}
                      to={`/stations/${s.id}`}
                      className={clsx(
                        "aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium transition-all",
                        s.status === "online" &&
                          "bg-success-100 text-success-700 hover:bg-success-200",
                        s.status === "offline" &&
                          "bg-slate-200 text-slate-600 hover:bg-slate-300",
                        s.status === "fault" &&
                          "bg-danger-100 text-danger-700 hover:bg-danger-200 animate-pulse-soft",
                        s.status === "maintenance" &&
                          "bg-warning-100 text-warning-700 hover:bg-warning-200"
                      )}
                      title={`${s.code} - ${s.status}`}
                    >
                      {s.code.slice(-2)}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">设备状态分布</h2>
          <div className="h-52 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-sm text-slate-600 flex-1">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {item.value}
                </span>
                <span className="text-xs text-slate-400 w-12 text-right">
                  {stats.total > 0
                    ? formatPercent(item.value / stats.total)
                    : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary-500" />
              今日巡检任务
            </h2>
            <Link
              to="/inspections/tasks"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center"
            >
              全部 <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-8">
                今日暂无巡检任务
              </div>
            ) : (
              todayTasks.map((task) => {
                const progress =
                  task.stationIds.length > 0
                    ? (task.completedCount / task.stationIds.length) * 100
                    : 0;
                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="text-sm font-semibold text-slate-800">
                          {task.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Wrench className="w-3 h-3" /> {task.inspector}
                        </div>
                      </div>
                      <Link
                        to={`/inspections/execute/${task.id}`}
                        className="btn-ghost !p-1.5 !text-xs"
                      >
                        执行
                      </Link>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden mb-1.5">
                      <div
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>
                        进度 {task.completedCount}/{task.stationIds.length}
                      </span>
                      <span className="font-medium text-primary-600">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning-500" />
              最新告警与异常
            </h2>
            <Link
              to="/repairs/tickets"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center"
            >
              处理工单 <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 -mx-2">
            {recentAlerts.length === 0 ? (
              <div className="text-center text-slate-400 text-sm py-12">
                <CheckCircle2 className="w-10 h-10 mx-auto text-success-400 mb-2" />
                暂无告警，一切正常
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="px-2 py-3.5 flex items-start gap-3 hover:bg-slate-50/60 rounded-lg mx-1 transition-colors group cursor-pointer"
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      alert.type === "ticket"
                        ? "bg-danger-50 text-danger-500"
                        : "bg-warning-50 text-warning-500",
                      alert.priority === "high" && "animate-pulse-soft"
                    )}
                  >
                    {alert.type === "ticket" ? (
                      <MessageSquareWarning className="w-4.5 h-4.5" />
                    ) : (
                      <ClipboardCheck className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-slate-800">
                        {alert.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {alert.station}
                      </span>
                      {alert.priority === "high" && (
                        <span className="badge-danger !py-0 !text-[10px]">
                          高优先级
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 line-clamp-1 mb-1">
                      {alert.sub}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {formatRelative(alert.time)}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-400 transition-colors shrink-0 mt-1" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">近一周巡检与报修趋势</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                巡检次数
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-danger-400" />
                报修数量
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekTrend} margin={{ top: 5, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="巡检数"
                  stroke="#1E6FED"
                  strokeWidth={3}
                  dot={{ fill: "#1E6FED", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="报修数"
                  stroke="#FB7185"
                  strokeWidth={3}
                  dot={{ fill: "#FB7185", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">使用率 TOP5 桩位</h2>
          <div className="space-y-4">
            {stationUsage.map((s, idx) => (
              <div key={s.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white",
                        idx === 0 && "bg-gradient-to-br from-amber-400 to-amber-500",
                        idx === 1 && "bg-gradient-to-br from-slate-400 to-slate-500",
                        idx === 2 && "bg-gradient-to-br from-orange-400 to-orange-500",
                        idx > 2 && "bg-slate-300"
                      )}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-700">
                      {s.code}
                    </span>
                    <span className="text-xs text-slate-400">{s.building}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {formatPercent(s.usageRate || 0)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all"
                    style={{ width: `${(s.usageRate || 0) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-xs text-slate-500 mb-3">待处理工单快速统计</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-100">
                <div className="text-2xl font-bold text-danger-600 font-display">
                  {tickets.filter((t) => t.status === "pending").length}
                </div>
                <div className="text-xs text-danger-600/80">待处理</div>
              </div>
              <div className="p-3 rounded-xl bg-warning-50 border border-warning-100">
                <div className="text-2xl font-bold text-warning-600 font-display">
                  {tickets.filter((t) => t.status === "processing" || t.status === "maintenance").length}
                </div>
                <div className="text-xs text-warning-600/80">处理中</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

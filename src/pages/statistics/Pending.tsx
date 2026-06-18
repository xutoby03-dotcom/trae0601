import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Clock,
  AlertCircle,
  Wrench,
  CheckCircle2,
  Timer,
  Building2,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import StatCard from "../../components/ui/StatCard";
import { RepairStatusBadge } from "../../components/ui/StatusBadge";
import { formatRelative, formatDateTime, formatPercent } from "../../utils/formatters";
import { REPAIR_STATUS_LABELS, REPAIR_ISSUE_LABELS } from "../../types";
import type { RepairStatus } from "../../types";
import { clsx } from "clsx";

const STATUS_ORDER: RepairStatus[] = ["pending", "processing", "maintenance", "completed", "cancelled"];

const STATUS_COLORS: Record<RepairStatus, string> = {
  pending: "#EF4444",
  processing: "#F59E0B",
  maintenance: "#1E6FED",
  completed: "#10B981",
  cancelled: "#94A3B8",
};

export default function Pending() {
  const stations = useStationStore((s) => s.stations);
  const tickets = useRepairStore((s) => s.tickets);
  const getTicketsByStatus = useRepairStore((s) => s.getTicketsByStatus);
  const maintenanceRecords = useRepairStore((s) => s.maintenanceRecords);
  const records = useInspectionStore((s: any) => s.records);

  const abnormalRecords = useMemo(() =>
    records.filter((r: any) => r.hasAbnormal).sort(
      (a: any, b: any) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
    ),
    [records]
  );

  const statusCounts = useMemo(() => {
    return STATUS_ORDER.map((status) => ({
      status,
      name: REPAIR_STATUS_LABELS[status],
      count: getTicketsByStatus(status).length,
      fill: STATUS_COLORS[status],
    }));
  }, [getTicketsByStatus]);

  const openTickets = useMemo(() => {
    return tickets
      .filter(
        (t) =>
          t.status === "pending" ||
          t.status === "processing" ||
          t.status === "maintenance"
      )
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [tickets]);

  const avgRepairDuration = useMemo(() => {
    const completed = tickets.filter((t) => t.completedAt && t.createdAt);
    if (completed.length === 0) return 0;
    const totalMinutes = completed.reduce((sum, t) => {
      const start = new Date(t.createdAt).getTime();
      const end = new Date(t.completedAt!).getTime();
      return sum + (end - start) / 60000;
    }, 0);
    return Math.round(totalMinutes / completed.length);
  }, [tickets]);

  const durationByStatus = useMemo(() => {
    const now = Date.now();
    const calculate = (statuses: RepairStatus[]) => {
      const filtered = tickets.filter((t) => statuses.includes(t.status));
      if (filtered.length === 0) return 0;
      const totalMinutes = filtered.reduce((sum, t) => {
        return sum + (now - new Date(t.createdAt).getTime()) / 60000;
      }, 0);
      return Math.round(totalMinutes / filtered.length);
    };
    return [
      { name: "待处理", 时长: calculate(["pending"]) },
      { name: "处理中", 时长: calculate(["processing"]) },
      { name: "维修中", 时长: calculate(["maintenance"]) },
    ];
  }, [tickets]);

  const weeklyTrend = useMemo(() => {
    const days: { name: string; 新增报修: number; 已完成: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        23,
        59,
        59
      );
      const dayStr = `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({
        name: dayStr,
        新增报修: tickets.filter((t) => {
          const ct = new Date(t.createdAt);
          return ct >= dayStart && ct <= dayEnd;
        }).length,
        已完成: tickets.filter((t) => {
          if (!t.completedAt) return false;
          const ct = new Date(t.completedAt);
          return ct >= dayStart && ct <= dayEnd;
        }).length,
      });
    }
    return days;
  }, [tickets]);

  const issueTypeDistribution = useMemo(() => {
    const counts = new Map<string, number>();
    openTickets.forEach((t) => {
      counts.set(t.issueType, (counts.get(t.issueType) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([type, count]) => ({
      name: REPAIR_ISSUE_LABELS[type as keyof typeof REPAIR_ISSUE_LABELS] || type,
      value: count,
    }));
  }, [openTickets]);

  const buildingDistribution = useMemo(() => {
    const buildingMap = new Map<string, number>();
    openTickets.forEach((t) => {
      const station = useStationStore.getState().getStationById(t.stationId);
      if (station) {
        buildingMap.set(
          station.building,
          (buildingMap.get(station.building) || 0) + 1
        );
      }
    });
    return Array.from(buildingMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([building, count]) => ({ name: building, 未处理数: count }));
  }, [openTickets]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} 分钟`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分`;
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return `${days} 天 ${hours} 小时`;
  };

  const urgentTickets = openTickets.filter((t) => {
    const age = (Date.now() - new Date(t.createdAt).getTime()) / 3600000;
    return age > 24;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            未处理报修分析
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            跟踪报修工单处理进度，优化响应时效与服务质量
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/statistics/fault-rate" className="btn-ghost text-sm">
            故障率
          </Link>
          <Link to="/statistics/usage-peak" className="btn-ghost text-sm">
            使用高峰
          </Link>
          <Link to="/statistics/low-efficiency" className="btn-ghost text-sm">
            低效桩分析
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="待处理工单"
          value={getTicketsByStatus("pending").length}
          icon={AlertCircle}
          variant="danger"
          trend={{ value: -5, label: "较昨日" }}
        />
        <StatCard
          title="处理中工单"
          value={
            getTicketsByStatus("processing").length +
            getTicketsByStatus("maintenance").length
          }
          icon={Wrench}
          variant="warning"
          subtext={`含 ${getTicketsByStatus("maintenance").length} 单维修中`}
        />
        <StatCard
          title="平均修复时长"
          value={formatDuration(avgRepairDuration)}
          icon={Timer}
          variant="primary"
          trend={{ value: -12, label: "较上周" }}
        />
        <StatCard
          title="超时未处理"
          value={urgentTickets.length}
          icon={AlertTriangle}
          variant="danger"
          subtext="超过24小时未闭环"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-500" />
              各状态工单数量
            </h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCounts} margin={{ top: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="name"
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
                  formatter={(value: number) => [`${value} 单`, "工单数量"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                  {statusCounts.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">未处理问题类型</h2>
          {issueTypeDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              <CheckCircle2 className="w-8 h-8 mr-2 text-success-400" />
              暂无未处理工单
            </div>
          ) : (
            <>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issueTypeDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {["#EF4444", "#F59E0B", "#1E6FED", "#10B981", "#8B5CF6"].map(
                        (color, i) => (
                          <Cell key={i} fill={color} />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {issueTypeDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-3 h-3 rounded-sm shrink-0"
                      style={{
                        background: ["#EF4444", "#F59E0B", "#1E6FED", "#10B981", "#8B5CF6"][idx],
                      }}
                    />
                    <span className="text-slate-600 flex-1">{item.name}</span>
                    <span className="font-semibold text-slate-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-warning-500" />
            各状态平均等待时长
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={durationByStatus}
                layout="vertical"
                margin={{ top: 5, right: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatDuration(v)}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={60}
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
                  formatter={(value: number) => [formatDuration(value), "平均时长"]}
                />
                <Bar dataKey="时长" radius={[0, 6, 6, 0]} barSize={28}>
                  {["#EF4444", "#F59E0B", "#1E6FED"].map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            近7日报修/完成趋势
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyTrend} margin={{ top: 5, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
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
                <Legend wrapperStyle={{ paddingTop: 5 }} />
                <Line
                  type="monotone"
                  dataKey="新增报修"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="已完成"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-primary-500" />
            各楼栋未处理工单分布
          </h2>
          {buildingDistribution.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {buildingDistribution.map((b) => (
                <div key={b.name}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="text-slate-700 font-medium">{b.name}</span>
                    <span className="font-semibold text-slate-800">
                      {b.未处理数} 单
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={clsx(
                        "h-full rounded-full transition-all",
                        b.未处理数 >= 5
                          ? "bg-gradient-to-r from-danger-400 to-danger-500"
                          : b.未处理数 >= 3
                          ? "bg-gradient-to-r from-warning-400 to-warning-500"
                          : "bg-gradient-to-r from-primary-400 to-primary-500"
                      )}
                      style={{
                        width: `${Math.min(
                          (b.未处理数 / Math.max(...buildingDistribution.map((x) => x.未处理数))) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="section-title flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              超时未处理工单 TOP
            </h2>
            <Link
              to="/repairs/tickets"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center"
            >
              全部工单 <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {openTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-success-400" />
              暂无待处理工单
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {openTickets.slice(0, 5).map((t) => {
                const station = useStationStore.getState().getStationById(t.stationId);
                const ageHours = Math.round(
                  (Date.now() - new Date(t.createdAt).getTime()) / 3600000
                );
                const isUrgent = ageHours > 24;
                return (
                  <div
                    key={t.id}
                    className={clsx(
                      "p-4 hover:bg-slate-50/60 transition-colors",
                      isUrgent && "bg-danger-50/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={clsx(
                          "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                          isUrgent
                            ? "bg-danger-100 animate-pulse-soft"
                            : "bg-warning-100"
                        )}
                      >
                        <AlertTriangle
                          className={clsx(
                            "w-4.5 h-4.5",
                            isUrgent ? "text-danger-600" : "text-warning-600"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-medium text-slate-800">
                            {t.ticketNo}
                          </span>
                          <RepairStatusBadge status={t.status} />
                          {isUrgent && (
                            <span className="badge-danger !py-0 !text-[10px]">
                              超时 {ageHours}h
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 line-clamp-1 mb-1">
                          {REPAIR_ISSUE_LABELS[t.issueType]}：{t.description}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>{station?.code || "-"}</span>
                          <span>{station?.building || "-"}</span>
                          <span>提交 {formatRelative(t.createdAt)}</span>
                        </div>
                      </div>
                      <Link
                        to={`/repairs/tickets/${t.id}`}
                        className="btn-ghost !p-1.5 !text-xs shrink-0"
                      >
                        处理
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="section-title mb-5">服务效率指标</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="p-5 rounded-xl bg-gradient-to-br from-success-50 to-white border border-success-100">
            <div className="text-xs text-slate-500 mb-2">工单完成率</div>
            <div className="font-display text-3xl font-bold text-success-600">
              {tickets.length > 0
                ? formatPercent(getTicketsByStatus("completed").length / tickets.length)
                : "0%"}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100">
            <div className="text-xs text-slate-500 mb-2">24小时闭环率</div>
            <div className="font-display text-3xl font-bold text-primary-600">
              {tickets.filter((t) => t.completedAt).length > 0
                ? formatPercent(
                    tickets.filter((t) => {
                      if (!t.completedAt) return false;
                      const dur =
                        (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) /
                        3600000;
                      return dur <= 24;
                    }).length / tickets.filter((t) => t.completedAt).length
                  )
                : "0%"}
            </div>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-warning-50 to-white border border-warning-100">
            <div className="text-xs text-slate-500 mb-2">巡检异常关联</div>
            <div className="font-display text-3xl font-bold text-warning-600">
              {abnormalRecords.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">待跟进处理</div>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-danger-50 to-white border border-danger-100">
            <div className="text-xs text-slate-500 mb-2">维修工单转化率</div>
            <div className="font-display text-3xl font-bold text-danger-600">
              {tickets.length > 0
                ? formatPercent(maintenanceRecords.length / tickets.length)
                : "0%"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

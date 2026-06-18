import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar,
  MapPin,
  ChevronRight,
  Award,
  Minus,
  MessageSquareWarning,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import StatCard from "../../components/ui/StatCard";
import { formatPercent, formatDate } from "../../utils/formatters";
import { clsx } from "clsx";

export default function FaultRate() {
  const navigate = useNavigate();
  const stations = useStationStore((s) => s.stations);
  const stats = useStationStore((s) => s.stats);
  const maintenanceRecords = useRepairStore((s) => s.maintenanceRecords);
  const tickets = useRepairStore((s) => s.tickets);
  const records = useInspectionStore((s: any) => s.records);

  const abnormalRecords = useMemo(() =>
    records.filter((r: any) => r.hasAbnormal).sort(
      (a: any, b: any) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime()
    ),
    [records]
  );

  const faultSourceBreakdown = useMemo(() => {
    const openTickets = tickets.filter(
      (t) => t.status === "pending" || t.status === "processing" || t.status === "maintenance"
    );
    const stationIdsFromRepair = new Set(openTickets.map((t) => t.stationId));
    const stationIdsFromInspection = new Set(
      abnormalRecords.map((r: any) => r.stationId)
    );

    const faultStations = stations.filter(
      (s) => s.status === "fault" || s.status === "maintenance"
    );

    const fromRepair = faultStations.filter((s) => stationIdsFromRepair.has(s.id));
    const fromInspection = faultStations.filter(
      (s) => !stationIdsFromRepair.has(s.id) && stationIdsFromInspection.has(s.id)
    );
    const other = faultStations.filter(
      (s) => !stationIdsFromRepair.has(s.id) && !stationIdsFromInspection.has(s.id)
    );

    return {
      total: faultStations.length,
      fromRepair: fromRepair.length,
      fromInspection: fromInspection.length,
      other: other.length,
      fromRepairStations: fromRepair,
      fromInspectionStations: fromInspection,
    };
  }, [stations, tickets, abnormalRecords]);

  const monthlyTrend = useMemo(() => {
    const months: { name: string; month: number; year: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    return months.map((m) => {
      const monthStart = new Date(m.year, m.month, 1);
      const monthEnd = new Date(m.year, m.month + 1, 0, 23, 59, 59);

      const monthTickets = tickets.filter((t) => {
        const d = new Date(t.createdAt);
        return d >= monthStart && d <= monthEnd;
      });
      const monthMaintenance = maintenanceRecords.filter((r) => {
        const d = new Date(r.completedAt);
        return d >= monthStart && d <= monthEnd;
      });

      const totalStations = stations.length;
      const affectedStations = new Set([
        ...monthTickets.map((t) => t.stationId),
        ...monthMaintenance.map((r) => r.stationId),
      ]).size;

      return {
        name: m.name.substring(5) + "月",
        报修次数: monthTickets.length,
        维修次数: monthMaintenance.length,
        故障率: totalStations > 0 ? ((affectedStations / totalStations) * 100).toFixed(1) : "0",
      };
    });
  }, [stations, tickets, maintenanceRecords]);

  const topFaultStations = useMemo(() => {
    const stationFaultMap = new Map<string, {
      stationId: string;
      ticketCount: number;
      maintenanceCount: number;
      abnormalCount: number;
      score: number;
    }>();

    stations.forEach((s) => {
      stationFaultMap.set(s.id, {
        stationId: s.id,
        ticketCount: 0,
        maintenanceCount: 0,
        abnormalCount: 0,
        score: 0,
      });
    });

    tickets.forEach((t) => {
      const entry = stationFaultMap.get(t.stationId);
      if (entry) {
        entry.ticketCount++;
        entry.score += 3;
      }
    });

    maintenanceRecords.forEach((r) => {
      const entry = stationFaultMap.get(r.stationId);
      if (entry) {
        entry.maintenanceCount++;
        entry.score += 2;
      }
    });

    abnormalRecords.forEach((r) => {
      const entry = stationFaultMap.get(r.stationId);
      if (entry) {
        entry.abnormalCount++;
        entry.score += 1;
      }
    });

    const faultStations = stations.filter(
      (s) => s.status === "fault" || s.status === "maintenance"
    );
    faultStations.forEach((s) => {
      const entry = stationFaultMap.get(s.id);
      if (entry) {
        entry.score += 5;
      }
    });

    return Array.from(stationFaultMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((e) => {
        const station = stations.find((s) => s.id === e.stationId)!;
        return {
          ...e,
          station,
        };
      })
      .filter((e) => e.score > 0);
  }, [stations, tickets, maintenanceRecords, abnormalRecords]);

  const overallFaultRate = stations.length > 0
    ? (topFaultStations.length > 0 ? topFaultStations[0].score / 100 : 0.056)
    : 0;

  const faultRateTrend = monthlyTrend.length >= 2
    ? (parseFloat(monthlyTrend[monthlyTrend.length - 1].故障率) -
        parseFloat(monthlyTrend[monthlyTrend.length - 2].故障率))
    : 0;

  const rankColors = [
    "from-red-400 to-red-500",
    "from-orange-400 to-orange-500",
    "from-amber-400 to-amber-500",
    "from-yellow-400 to-yellow-500",
    "from-lime-400 to-lime-500",
  ];

  const barData = topFaultStations.map((item, idx) => ({
    name: item.station.code,
    报修: item.ticketCount,
    维修: item.maintenanceCount,
    异常: item.abnormalCount,
    idx,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            故障率分析
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            掌握故障率趋势与高频故障桩分布，针对性优化运维策略
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/statistics/usage-peak" className="btn-ghost text-sm">
            使用高峰
          </Link>
          <Link to="/statistics/pending" className="btn-ghost text-sm">
            未处理报修
          </Link>
          <Link to="/statistics/low-efficiency" className="btn-ghost text-sm">
            低效桩分析
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="整体故障率"
          value={formatPercent(overallFaultRate)}
          icon={AlertTriangle}
          variant="danger"
          trend={{ value: faultRateTrend, label: "较上月" }}
          onClick={() => navigate("/maintenance/faults?source=all")}
        />
        <StatCard
          title="累计报修次数"
          value={tickets.length}
          icon={TrendingUp}
          variant="warning"
          subtext={`覆盖 ${new Set(tickets.map((t) => t.stationId)).size} 个桩位`}
          onClick={() => navigate("/maintenance/faults?source=repair")}
        />
        <StatCard
          title="累计维修次数"
          value={maintenanceRecords.length}
          icon={TrendingDown}
          variant="primary"
          subtext={`平均成本 ¥${maintenanceRecords.length > 0
            ? (maintenanceRecords.reduce((s, r) => s + r.totalCost, 0) / maintenanceRecords.length).toFixed(0)
            : 0}`}
        />
        <StatCard
          title="当前故障桩"
          value={topFaultStations.length}
          icon={Award}
          variant="warning"
          subtext={`${stats.fault + stats.maintenance} 个当前故障中`}
          onClick={() => navigate("/maintenance/faults?source=all")}
        />
      </div>

      <div>
        <h2 className="section-title flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          故障来源拆分
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            className="card p-6 border-danger-100 bg-gradient-to-br from-danger-50/50 to-white cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate("/maintenance/faults?source=repair")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-danger-100 flex items-center justify-center">
                  <MessageSquareWarning className="w-5 h-5 text-danger-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">居民报修来源</div>
                  <div className="text-xs text-slate-500">用户主动上报故障</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="font-display text-3xl font-bold text-danger-600 mb-1">
              {faultSourceBreakdown.fromRepair}
            </div>
            <div className="text-xs text-slate-500">
              占当前故障的 {faultSourceBreakdown.total > 0
                ? formatPercent(faultSourceBreakdown.fromRepair / faultSourceBreakdown.total)
                : "0%"}
            </div>
          </div>

          <div
            className="card p-6 border-warning-100 bg-gradient-to-br from-warning-50/50 to-white cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate("/maintenance/faults?source=inspection")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-warning-100 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">巡检异常来源</div>
                  <div className="text-xs text-slate-500">日常巡检发现异常</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="font-display text-3xl font-bold text-warning-600 mb-1">
              {faultSourceBreakdown.fromInspection}
            </div>
            <div className="text-xs text-slate-500">
              占当前故障的 {faultSourceBreakdown.total > 0
                ? formatPercent(faultSourceBreakdown.fromInspection / faultSourceBreakdown.total)
                : "0%"}
            </div>
          </div>

          <div
            className="card p-6 border-slate-100 bg-gradient-to-br from-slate-50/50 to-white cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            onClick={() => navigate("/maintenance/faults?source=all")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700">其他/待确认</div>
                  <div className="text-xs text-slate-500">历史遗留待核实</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-600 mb-1">
              {faultSourceBreakdown.other}
            </div>
            <div className="text-xs text-slate-500">
              占当前故障的 {faultSourceBreakdown.total > 0
                ? formatPercent(faultSourceBreakdown.other / faultSourceBreakdown.total)
                : "0%"}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" />
              近6个月故障率趋势
            </h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                报修次数
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                维修次数
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                故障率(%)
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: 10 }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="报修次数"
                  stroke="#1E6FED"
                  strokeWidth={3}
                  dot={{ fill: "#1E6FED", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="维修次数"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dot={{ fill: "#F59E0B", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="故障率"
                  stroke="#EF4444"
                  strokeWidth={3}
                  strokeDasharray="6 4"
                  dot={{ fill: "#EF4444", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">故障类型分布</h2>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: "硬件故障",
                    value: maintenanceRecords.filter((r) => r.faultCategory === "hardware").length,
                    color: "#EF4444",
                  },
                  {
                    name: "接口故障",
                    value: maintenanceRecords.filter((r) => r.faultCategory === "connector").length,
                    color: "#F59E0B",
                  },
                  {
                    name: "电路故障",
                    value: maintenanceRecords.filter((r) => r.faultCategory === "electrical").length,
                    color: "#1E6FED",
                  },
                  {
                    name: "网络故障",
                    value: maintenanceRecords.filter((r) => r.faultCategory === "network").length,
                    color: "#10B981",
                  },
                  {
                    name: "软件故障",
                    value: maintenanceRecords.filter((r) => r.faultCategory === "software").length,
                    color: "#8B5CF6",
                  },
                  {
                    name: "其他",
                    value: maintenanceRecords.filter(
                      (r) => !["hardware", "connector", "electrical", "network", "software"].includes(r.faultCategory)
                    ).length,
                    color: "#94A3B8",
                  },
                ]}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={70}
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
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {[
                    { color: "#EF4444" },
                    { color: "#F59E0B" },
                    { color: "#1E6FED" },
                    { color: "#10B981" },
                    { color: "#8B5CF6" },
                    { color: "#94A3B8" },
                  ].map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <Award className="w-5 h-5 text-warning-500" />
            TOP 10 高频故障桩排名
          </h2>
          <Link
            to="/maintenance/faults"
            className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center"
          >
            查看全部 <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {topFaultStations.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Minus className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            暂无故障记录
          </div>
        ) : (
          <div>
            <div className="p-5">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748B" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E2E8F0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    <Bar dataKey="报修" stackId="a" fill="#1E6FED" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="维修" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="异常" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {topFaultStations.map((item, idx) => (
                <div
                  key={item.stationId}
                  className="p-4 flex items-center gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div
                    className={clsx(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br",
                      rankColors[idx] || "from-slate-400 to-slate-500"
                    )}
                  >
                    {idx + 1}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-semibold text-slate-800">
                        {item.station.code}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.station.building}
                      </span>
                      {(item.station.status === "fault" ||
                        item.station.status === "maintenance") && (
                        <span className="badge-danger !py-0 !text-[10px]">
                          当前故障中
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.station.location} · {item.station.power}kW
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs shrink-0">
                    <div className="text-center">
                      <div className="font-semibold text-primary-600">
                        {item.ticketCount}
                      </div>
                      <div className="text-slate-400">报修</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-warning-600">
                        {item.maintenanceCount}
                      </div>
                      <div className="text-slate-400">维修</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-danger-600">
                        {item.abnormalCount}
                      </div>
                      <div className="text-slate-400">巡检异常</div>
                    </div>
                    <div className="w-20 text-right">
                      <div className="font-display text-lg font-bold text-slate-800">
                        {item.score}
                      </div>
                      <div className="text-[10px] text-slate-400">综合风险分</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

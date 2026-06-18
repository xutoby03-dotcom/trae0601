import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  TrendingDown,
  Building2,
  Zap,
  AlertCircle,
  Lightbulb,
  ChevronRight,
  Filter,
  X,
  MapPin,
  Calendar,
  Wrench,
  RotateCcw,
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
} from "recharts";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import StatCard from "../../components/ui/StatCard";
import { StationStatusBadge } from "../../components/ui/StatusBadge";
import { formatPercent, formatDate, formatMoney } from "../../utils/formatters";
import { clsx } from "clsx";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];

type SuggestionType = "relocate" | "maintenance" | "promote" | "remove";

interface Suggestion {
  type: SuggestionType;
  title: string;
  desc: string;
  priority: "high" | "medium" | "low";
}

function getSuggestion(rate: number, faultCount: number, ageDays: number): Suggestion {
  if (faultCount >= 3) {
    return {
      type: "maintenance",
      title: "深度检修",
      desc: "故障次数较多，建议进行全面深度检修，排查根因",
      priority: "high",
    };
  }
  if (ageDays > 730 && rate < 0.15) {
    return {
      type: "remove",
      title: "评估撤换",
      desc: "设备老旧且使用率极低，建议评估后撤换或迁移",
      priority: "high",
    };
  }
  if (rate < 0.15) {
    return {
      type: "relocate",
      title: "位置调整",
      desc: "使用率持续偏低，建议调研周边需求后考虑迁移位置",
      priority: "medium",
    };
  }
  if (rate < 0.3 && rate >= 0.15) {
    return {
      type: "promote",
      title: "运营推广",
      desc: "使用率偏低，建议进行优惠活动或指引宣传提升使用",
      priority: "low",
    };
  }
  return {
    type: "promote",
    title: "持续观察",
    desc: "当前状态尚可，建议持续观察使用趋势",
    priority: "low",
  };
}

export default function LowEfficiency() {
  const stations = useStationStore((s: any) => s.stations);
  const tickets = useRepairStore((s: any) => s.tickets);
  const maintenances = useRepairStore((s: any) => s.maintenanceRecords);
  const records = useInspectionStore((s: any) => s.records);

  const [filterBuilding, setFilterBuilding] = useState<string>("all");
  const [filterRateMax, setFilterRateMax] = useState<number>(0.3);
  const [includeOffline, setIncludeOffline] = useState(true);

  const lowEfficiencyStations = useMemo(() => {
    return stations
      .filter((s: any) => {
        const rate = s.usageRate || 0;
        if (rate > filterRateMax) return false;
        if (filterBuilding !== "all" && s.building !== filterBuilding) return false;
        if (!includeOffline && s.status === "offline") return false;
        return true;
      })
      .map((s: any) => {
        const stationTickets = tickets.filter((t: any) => t.stationId === s.id);
        const stationMaint = maintenances.filter((m: any) => m.stationId === s.id);
        const stationInspections = records.filter((r: any) => r.stationId === s.id);
        stationMaint.sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        stationInspections.sort((a: any, b: any) => new Date(b.inspectDate).getTime() - new Date(a.inspectDate).getTime());
        const rate = s.usageRate || 0;
        const faultCount = stationTickets.length + stationMaint.length;
        const ageDays = Math.floor(
          (Date.now() - new Date(s.installDate).getTime()) / 86400000
        );
        const suggestion = getSuggestion(rate, faultCount, ageDays);
        const totalMaintainCost = stationMaint.reduce((sum: number, m: any) => sum + m.totalCost, 0);

        return {
          station: s,
          rate,
          tickets: stationTickets,
          maintenance: stationMaint,
          inspections: stationInspections,
          faultCount,
          ageDays,
          suggestion,
          totalMaintainCost,
          efficiencyScore: Math.round(
            rate * 50 + Math.max(0, 1 - faultCount / 5) * 30 + Math.max(0, 1 - ageDays / 1825) * 20
          ),
        };
      })
      .sort((a, b) => a.rate - b.rate);
  }, [
    stations,
    filterBuilding,
    filterRateMax,
    includeOffline,
    tickets,
    maintenances,
    records,
  ]);

  const buildingStats = useMemo(() => {
    return BUILDINGS.map((b) => {
      const buildingStations = stations.filter((s) => s.building === b);
      const lowCount = buildingStations.filter(
        (s) => (s.usageRate || 0) < 0.3
      ).length;
      const avgRate =
        buildingStations.length > 0
          ? buildingStations.reduce((sum, s) => sum + (s.usageRate || 0), 0) /
            buildingStations.length
          : 0;
      return {
        name: b,
        低效桩数: lowCount,
        平均使用率: +(avgRate * 100).toFixed(1),
      };
    });
  }, [stations]);

  const pieData = useMemo(() => {
    const categories = [
      { name: "极低(<10%)", min: 0, max: 0.1, color: "#EF4444" },
      { name: "偏低(10-20%)", min: 0.1, max: 0.2, color: "#F59E0B" },
      { name: "较低(20-30%)", min: 0.2, max: 0.3, color: "#1E6FED" },
    ];
    return categories.map((c) => ({
      name: c.name,
      value: stations.filter((s) => {
        const r = s.usageRate || 0;
        return r >= c.min && r < c.max;
      }).length,
      color: c.color,
    }));
  }, [stations]);

  const totalCost = lowEfficiencyStations.reduce(
    (sum, s) => sum + s.totalMaintainCost,
    0
  );
  const avgRate =
    lowEfficiencyStations.length > 0
      ? lowEfficiencyStations.reduce((sum, s) => sum + s.rate, 0) /
        lowEfficiencyStations.length
      : 0;
  const highPriorityCount = lowEfficiencyStations.filter(
    (s) => s.suggestion.priority === "high"
  ).length;

  const hasFilters =
    filterBuilding !== "all" || filterRateMax !== 0.3 || !includeOffline;

  const clearFilters = () => {
    setFilterBuilding("all");
    setFilterRateMax(0.3);
    setIncludeOffline(true);
  };

  const getSuggestionBadge = (type: SuggestionType) => {
    const map: Record<SuggestionType, { className: string; icon: typeof Lightbulb }> = {
      relocate: { className: "badge-warning", icon: MapPin },
      maintenance: { className: "badge-danger", icon: Wrench },
      promote: { className: "badge-primary", icon: Zap },
      remove: { className: "badge-slate", icon: RotateCcw },
    };
    return map[type];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            长期低效桩分析
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            识别使用率低于30%的充电桩，优化资源配置与运营策略
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/statistics/fault-rate" className="btn-ghost text-sm">
            故障率
          </Link>
          <Link to="/statistics/usage-peak" className="btn-ghost text-sm">
            使用高峰
          </Link>
          <Link to="/statistics/pending" className="btn-ghost text-sm">
            未处理报修
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="低效充电桩"
          value={lowEfficiencyStations.length}
          icon={TrendingDown}
          variant="danger"
          subtext={`使用率 < ${formatPercent(filterRateMax)}`}
        />
        <StatCard
          title="平均使用率"
          value={formatPercent(avgRate)}
          icon={Zap}
          variant="warning"
          trend={{ value: -3.2, label: "较上月" }}
        />
        <StatCard
          title="需优先处理"
          value={highPriorityCount}
          icon={AlertCircle}
          variant="danger"
          subtext="高优先级建议"
        />
        <StatCard
          title="累计维护成本"
          value={formatMoney(totalCost)}
          icon={Wrench}
          variant="warning"
          subtext={`${lowEfficiencyStations.reduce(
            (s, x) => s + x.maintenance.length,
            0
          )} 次维修`}
        />
      </div>

      <div className="card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">筛选条件</span>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs text-slate-500 hover:text-danger-500 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              清除筛选
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="input-label">楼栋范围</label>
            <select
              className="input"
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
            >
              <option value="all">全部楼栋</option>
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="input-label">
              使用率上限：{formatPercent(filterRateMax)}
            </label>
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.05"
              value={filterRateMax}
              onChange={(e) => setFilterRateMax(parseFloat(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeOffline"
              checked={includeOffline}
              onChange={(e) => setIncludeOffline(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500/20"
            />
            <label htmlFor="includeOffline" className="text-sm text-slate-700">
              包含离线状态
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Building2 className="w-5 h-5 text-primary-500" />
            各楼栋低效桩分布
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={buildingStats} margin={{ top: 10, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
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
                <Legend wrapperStyle={{ paddingTop: 5 }} />
                <Bar
                  yAxisId="left"
                  dataKey="低效桩数"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                >
                  {buildingStats.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.低效桩数 >= 3
                          ? "#EF4444"
                          : entry.低效桩数 >= 2
                          ? "#F59E0B"
                          : "#1E6FED"
                      }
                    />
                  ))}
                </Bar>
                <Bar
                  yAxisId="right"
                  dataKey="平均使用率"
                  fill="#10B981"
                  radius={[4, 4, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title mb-5">使用率区间分布</h2>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{item.name}</span>
                <span className="font-semibold text-slate-800">{item.value} 台</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="section-title flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-danger-500" />
            低效桩详细列表
            <span className="ml-2 text-xs font-normal text-slate-500">
              按使用率升序
            </span>
          </h2>
          <div className="text-xs text-slate-500">
            共 {lowEfficiencyStations.length} 条记录
          </div>
        </div>

        {lowEfficiencyStations.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Zap className="w-12 h-12 mx-auto mb-3 text-success-400" />
            <div>当前筛选条件下没有低效充电桩</div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-primary-500 hover:text-primary-600"
              >
                清除筛选条件
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr className="text-left text-xs text-slate-500">
                  <th className="px-5 py-3 font-medium">桩号</th>
                  <th className="px-5 py-3 font-medium">位置</th>
                  <th className="px-5 py-3 font-medium">状态</th>
                  <th className="px-5 py-3 font-medium text-center">使用率</th>
                  <th className="px-5 py-3 font-medium text-center">故障/维修</th>
                  <th className="px-5 py-3 font-medium text-center">投入使用</th>
                  <th className="px-5 py-3 font-medium text-center">维护成本</th>
                  <th className="px-5 py-3 font-medium">优化建议</th>
                  <th className="px-5 py-3 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lowEfficiencyStations.slice(0, 20).map((item) => {
                  const { station, rate, suggestion } = item;
                  const badgeCfg = getSuggestionBadge(suggestion.type);
                  const SuggestionIcon = badgeCfg.icon;
                  const efficiencyColor =
                    rate < 0.1
                      ? "text-danger-600 bg-danger-50"
                      : rate < 0.2
                      ? "text-warning-600 bg-warning-50"
                      : "text-primary-600 bg-primary-50";

                  return (
                    <tr
                      key={station.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {station.code}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {station.power}kW · {station.socketCount}插座
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {station.building}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {station.location}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StationStatusBadge status={station.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-20 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={clsx(
                                "h-full rounded-full",
                                rate < 0.1
                                  ? "bg-danger-500"
                                  : rate < 0.2
                                  ? "bg-warning-500"
                                  : "bg-primary-500"
                              )}
                              style={{ width: `${(rate / 0.3) * 100}%` }}
                            />
                          </div>
                          <span
                            className={clsx(
                              "text-xs font-semibold px-2 py-0.5 rounded",
                              efficiencyColor
                            )}
                          >
                            {formatPercent(rate)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-slate-600">
                        <span className="text-danger-600 font-medium">
                          {item.tickets.length}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-warning-600 font-medium">
                          {item.maintenance.length}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-sm text-slate-600">
                        <div>{formatDate(station.installDate)}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.ageDays > 365
                            ? `${Math.floor(item.ageDays / 365)}年${item.ageDays % 365 > 30 ? Math.floor((item.ageDays % 365) / 30) + "月" : ""}`
                            : `${item.ageDays}天`}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                        {formatMoney(item.totalMaintainCost)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className={clsx(badgeCfg.className, "w-fit")}>
                            <SuggestionIcon className="w-3 h-3" />
                            {suggestion.title}
                            {suggestion.priority === "high" && (
                              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-current animate-pulse-soft" />
                            )}
                          </span>
                          <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]">
                            {suggestion.desc}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/stations/${station.id}`}
                          className="btn-ghost !p-1.5"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
            <Lightbulb className="w-6 h-6 text-primary-500" />
          </div>
          <div className="flex-1">
            <h2 className="section-title mb-3">优化运营建议</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-danger-50 to-white border border-danger-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-danger">
                    <AlertCircle className="w-3 h-3" />
                    紧急处理
                  </span>
                  <span className="font-semibold text-danger-700">
                    {highPriorityCount} 台需优先关注
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  高优先级设备建议在7个工作日内完成评估与处理，避免资源浪费或安全隐患
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-warning-50 to-white border border-warning-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-warning">
                    <MapPin className="w-3 h-3" />
                    位置优化
                  </span>
                  <span className="font-semibold text-warning-700">
                    楼栋间均衡布局
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  结合高峰使用热力图，考虑将低效桩迁移至高需求区域，提升整体利用率
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary-50 to-white border border-primary-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-primary">
                    <Zap className="w-3 h-3" />
                    运营推广
                  </span>
                  <span className="font-semibold text-primary-700">
                    引导用户使用
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  对使用率20-30%区间设备，开展新用户优惠、闲时特价等活动培养使用习惯
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-success-50 to-white border border-success-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-success">
                    <Calendar className="w-3 h-3" />
                    持续监控
                  </span>
                  <span className="font-semibold text-success-700">
                    月度评估复盘
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  建议每月初重新评估低效桩清单，跟踪优化措施执行效果，动态调整策略
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

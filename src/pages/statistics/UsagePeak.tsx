import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Clock,
  Zap,
  TrendingUp,
  Sun,
  Moon,
  Building2,
  ChevronRight,
  Calendar,
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import { useStationStore } from "../../store/stationStore";
import { useRepairStore } from "../../store/repairStore";
import { useInspectionStore } from "../../store/inspectionStore";
import StatCard from "../../components/ui/StatCard";
import { formatPercent } from "../../utils/formatters";
import { clsx } from "clsx";

const BUILDINGS = ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"];
const WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

function generateHourlyData(base: number, variance: number) {
  const data: { hour: string; value: number; rawValue: number }[] = [];
  for (let i = 0; i < 24; i++) {
    let factor = 0.2;
    if (i >= 6 && i < 9) factor = 0.7;
    else if (i >= 11 && i < 14) factor = 0.5;
    else if (i >= 17 && i < 22) factor = 1.0;
    else if (i >= 22 || i < 2) factor = 0.4;

    const value = Math.round(base * factor + (Math.random() - 0.5) * variance);
    data.push({
      hour: `${String(i).padStart(2, "0")}:00`,
      value: Math.max(0, value),
      rawValue: Math.max(0, value),
    });
  }
  return data;
}

export default function UsagePeak() {
  const stations = useStationStore((s) => s.stations);
  const stats = useStationStore((s) => s.stats);
  const tickets = useRepairStore((s) => s.tickets);
  const maintenanceRecords = useRepairStore((s) => s.maintenanceRecords);
  const inspectionRecords = useInspectionStore((s) => s.records);

  const [selectedBuilding, setSelectedBuilding] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"bar" | "heat">("bar");

  const hourlyData = useMemo(() => generateHourlyData(150, 40), []);

  const buildingHourlyData = useMemo(() => {
    return BUILDINGS.map((b) => ({
      building: b,
      ...Object.fromEntries(
        Array.from({ length: 24 }, (_, i) => [
          `h${i}`,
          Math.round(
            30 +
              (i >= 17 && i < 22 ? 60 : i >= 6 && i < 9 ? 40 : 15) +
              Math.random() * 20
          ),
        ])
      ),
    }));
  }, []);

  const weekdayData = useMemo(() => {
    return WEEKDAYS.map((day, idx) => {
      const isWeekend = idx >= 5;
      const base = isWeekend ? 160 : 130;
      return {
        day,
        充电次数: Math.round(base + Math.random() * 30),
        充电时长: Math.round((base + Math.random() * 30) * 1.5),
      };
    });
  }, []);

  const maxHour = hourlyData.reduce(
    (a, b) => (a.value > b.value ? a : b),
    hourlyData[0]
  );
  const minHour = hourlyData.reduce(
    (a, b) => (a.value < b.value ? a : b),
    hourlyData[0]
  );

  const totalDailyUsage = hourlyData.reduce((sum, h) => sum + h.value, 0);
  const avgHourlyUsage = Math.round(totalDailyUsage / 24);
  const peakHoursCount = hourlyData.filter(
    (h) => h.value > avgHourlyUsage * 1.3
  ).length;

  const filteredStations =
    selectedBuilding === "all"
      ? stations
      : stations.filter((s) => s.building === selectedBuilding);

  const avgUsageRate =
    filteredStations.length > 0
      ? filteredStations.reduce((sum, s) => sum + (s.usageRate || 0), 0) /
        filteredStations.length
      : 0;

  const getBarColor = (value: number) => {
    const max = maxHour.value;
    const ratio = value / max;
    if (ratio > 0.8) return "#EF4444";
    if (ratio > 0.6) return "#F59E0B";
    if (ratio > 0.4) return "#1E6FED";
    if (ratio > 0.2) return "#60A5FA";
    return "#93C5FD";
  };

  const getHeatColor = (value: number, maxVal: number) => {
    const ratio = value / maxVal;
    if (ratio > 0.85) return "bg-danger-500 text-white";
    if (ratio > 0.65) return "bg-warning-500 text-white";
    if (ratio > 0.45) return "bg-primary-500 text-white";
    if (ratio > 0.25) return "bg-primary-300 text-white";
    if (ratio > 0.1) return "bg-primary-100 text-primary-700";
    return "bg-slate-100 text-slate-500";
  };

  const heatMaxValue = Math.max(
    ...buildingHourlyData.flatMap((b) =>
      Array.from({ length: 24 }, (_, i) => b[`h${i}`] as number)
    )
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary-500" />
            使用高峰分析
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            分析充电使用时段分布，优化调度与资源配置
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/statistics/fault-rate" className="btn-ghost text-sm">
            故障率
          </Link>
          <Link to="/statistics/pending" className="btn-ghost text-sm">
            未处理报修
          </Link>
          <Link to="/statistics/low-efficiency" className="btn-ghost text-sm">
            低效桩分析
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="日均充电次数"
          value={totalDailyUsage.toLocaleString()}
          icon={Zap}
          variant="primary"
          trend={{ value: 8.5, label: "较上周" }}
        />
        <StatCard
          title="高峰时段"
          value={maxHour.hour}
          icon={TrendingUp}
          variant="warning"
          subtext={`峰值 ${maxHour.value} 次/小时`}
        />
        <StatCard
          title="低谷时段"
          value={minHour.hour}
          icon={Moon}
          variant="success"
          subtext={`谷值 ${minHour.value} 次/小时`}
        />
        <StatCard
          title="高峰时段数"
          value={`${peakHoursCount}h`}
          icon={Sun}
          variant="danger"
          subtext={`平均 ${avgHourlyUsage} 次/小时`}
        />
      </div>

      <div className="card p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700">楼栋筛选：</span>
              <select
                className="input !w-40"
                value={selectedBuilding}
                onChange={(e) => setSelectedBuilding(e.target.value)}
              >
                <option value="all">全部楼栋</option>
                {BUILDINGS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" />
              平均使用率
              <span className="font-semibold text-primary-600">
                {formatPercent(avgUsageRate)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100">
            <button
              onClick={() => setViewMode("bar")}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === "bar"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              柱状图
            </button>
            <button
              onClick={() => setViewMode("heat")}
              className={clsx(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                viewMode === "heat"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              热力图
            </button>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-500" />
            24小时使用分布
          </h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary-200" />
              低峰
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-primary-500" />
              平峰
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-warning-500" />
              次高峰
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-danger-500" />
              高峰
            </span>
          </div>
        </div>

        {viewMode === "bar" ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: "#64748B" }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
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
                  formatter={(value: number) => [`${value} 次`, "充电次数"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={22}>
                  {hourlyData.map((entry, idx) => (
                    <Cell key={idx} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 mb-2">
              楼栋 × 时段 热力图（颜色越深使用量越大）
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="flex mb-1.5">
                  <div className="w-20 shrink-0 text-xs text-slate-500 font-medium pl-1">
                    楼栋\时段
                  </div>
                  <div className="flex-1 flex">
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-1 text-center text-[10px] text-slate-400"
                      >
                        {String(i).padStart(2, "0")}
                      </div>
                    ))}
                  </div>
                </div>
                {buildingHourlyData.map((row) => (
                  <div key={row.building} className="flex mb-1">
                    <div className="w-20 shrink-0 text-xs text-slate-600 font-medium flex items-center pl-1">
                      {row.building}
                    </div>
                    <div className="flex-1 flex gap-0.5">
                      {Array.from({ length: 24 }, (_, i) => {
                        const v = row[`h${i}`] as number;
                        return (
                          <div
                            key={i}
                            className={clsx(
                              "flex-1 h-7 rounded text-[10px] flex items-center justify-center transition-all hover:scale-110 hover:z-10 cursor-default",
                              getHeatColor(v, heatMaxValue)
                            )}
                            title={`${row.building} ${String(i).padStart(2, "0")}:00 - ${v}次`}
                          >
                            {v > heatMaxValue * 0.6 ? v : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-primary-500" />
            周度使用趋势
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekdayData} margin={{ top: 10, right: 30 }}>
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
                <Legend wrapperStyle={{ paddingTop: 5 }} />
                <Line
                  type="monotone"
                  dataKey="充电次数"
                  stroke="#1E6FED"
                  strokeWidth={3}
                  fill="#DBEAFE"
                  dot={{ fill: "#1E6FED", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="充电时长"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ fill: "#10B981", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning-500" />
              高峰时段高负荷桩位
            </h2>
            <Link
              to="/stations"
              className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center"
            >
              桩位档案 <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {[...filteredStations]
              .sort((a, b) => (b.usageRate || 0) - (a.usageRate || 0))
              .slice(0, 6)
              .map((s, idx) => {
                const rate = s.usageRate || 0;
                return (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-primary-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={clsx(
                          "w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold text-white",
                          idx === 0 && "bg-gradient-to-br from-danger-400 to-danger-500",
                          idx === 1 && "bg-gradient-to-br from-warning-400 to-warning-500",
                          idx === 2 && "bg-gradient-to-br from-primary-400 to-primary-500",
                          idx > 2 && "bg-slate-400"
                        )}
                      >
                        {idx + 1}
                      </span>
                      <span className="font-medium text-slate-800 text-sm">
                        {s.code}
                      </span>
                      <span className="text-xs text-slate-500">{s.building}</span>
                      <span className="ml-auto text-sm font-display font-bold text-slate-800">
                        {formatPercent(rate)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all",
                          rate > 0.7
                            ? "bg-gradient-to-r from-danger-400 to-danger-500"
                            : rate > 0.5
                            ? "bg-gradient-to-r from-warning-400 to-warning-500"
                            : "bg-gradient-to-r from-primary-400 to-primary-500"
                        )}
                        style={{ width: `${rate * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-primary-50">
              <div className="text-xs text-primary-600 mb-1">巡检记录</div>
              <div className="font-display text-xl font-bold text-primary-700">
                {
                  inspectionRecords.filter(
                    (r) =>
                      selectedBuilding === "all" ||
                      stations.find((s) => s.id === r.stationId)?.building ===
                        selectedBuilding
                  ).length
                }
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning-50">
              <div className="text-xs text-warning-600 mb-1">报修工单</div>
              <div className="font-display text-xl font-bold text-warning-700">
                {
                  tickets.filter(
                    (t) =>
                      selectedBuilding === "all" ||
                      stations.find((s) => s.id === t.stationId)?.building ===
                        selectedBuilding
                  ).length
                }
              </div>
            </div>
            <div className="p-3 rounded-lg bg-success-50">
              <div className="text-xs text-success-600 mb-1">维修记录</div>
              <div className="font-display text-xl font-bold text-success-700">
                {
                  maintenanceRecords.filter(
                    (r) =>
                      selectedBuilding === "all" ||
                      stations.find((s) => s.id === r.stationId)?.building ===
                        selectedBuilding
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

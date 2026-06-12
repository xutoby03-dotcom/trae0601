import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sun,
  Sunrise,
  CloudSun,
  Cloud,
  Sunset,
  Moon,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  getWeeklyAbnormalData,
  getRetestStats,
  getTimeSlotDistribution,
} from "@/utils/bpUtils";
import RetestAlertBanner from "@/components/BPRecord/RetestAlertBanner";
import type { TimeSlot } from "@/types";
import { cn } from "@/lib/utils";

const SLOT_ICONS: Record<TimeSlot, typeof Sun> = {
  morning: Sunrise,
  forenoon: CloudSun,
  noon: Sun,
  afternoon: Cloud,
  evening: Sunset,
  night: Moon,
};

export default function Trends() {
  const { records, selectedElderId, profiles } = useAppStore();

  const elderRecords = useMemo(() => {
    return selectedElderId
      ? records.filter((r) => r.elderId === selectedElderId)
      : records;
  }, [records, selectedElderId]);

  const weeklyData = getWeeklyAbnormalData(elderRecords);
  const retestStats = getRetestStats(elderRecords);
  const timeSlotData = getTimeSlotDistribution(elderRecords);
  const selectedElder = profiles.find((p) => p.id === selectedElderId);

  const maxSlotCount = Math.max(...timeSlotData.map((d) => d.count), 1);
  const peakSlot = timeSlotData.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary-600" />
          趋势分析
        </h1>
        <p className="text-gray-500 mt-1">
          {selectedElder ? `${selectedElder.name}的血压趋势` : "全面了解血压变化规律"}
        </p>
      </div>

      <RetestAlertBanner />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">本周异常次数</p>
              <p className="text-2xl font-bold font-serif text-gray-900">
                {weeklyData.reduce((sum, d) => sum + d.count, 0)}
                <span className="text-sm font-normal text-gray-500 ml-1">次</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-primary-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">复测完成率</p>
              <p className="text-2xl font-bold font-serif text-gray-900">
                {retestStats.rate}
                <span className="text-sm font-normal text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-2xl bg-danger-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-danger-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">最易高血压时段</p>
              <p className="text-2xl font-bold font-serif text-gray-900">
                {peakSlot.count > 0 ? peakSlot.label.split(" ")[0] : "无数据"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            近7天异常次数
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value: number) => [`${value} 次`, "异常次数"]}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={40}>
                  {weeklyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.count > 0 ? "#F59E0B" : "#E5E7EB"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="section-title mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-500" />
            复测完成情况
          </h2>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-56 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: "已完成", value: retestStats.completed, fill: "#10B981" },
                    {
                      name: "未完成",
                      value: retestStats.total - retestStats.completed,
                      fill: "#EF4444",
                    },
                  ]}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={36}>
                    <Cell fill="#10B981" />
                    <Cell fill="#EF4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-8 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-success-500" />
                  <span className="text-sm text-gray-600">已完成复测</span>
                </div>
                <p className="text-3xl font-bold font-serif text-gray-900">
                  {retestStats.completed}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full bg-danger-500" />
                  <span className="text-sm text-gray-600">待复测</span>
                </div>
                <p className="text-3xl font-bold font-serif text-gray-900">
                  {retestStats.total - retestStats.completed}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">总体完成率</p>
                <p
                  className={cn(
                    "text-3xl font-bold font-serif",
                    retestStats.rate === 100
                      ? "text-success-600"
                      : retestStats.rate >= 70
                      ? "text-primary-600"
                      : "text-danger-600"
                  )}
                >
                  {retestStats.rate}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-600" />
          异常高发时段分布
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {timeSlotData.map((slot) => {
            const Icon = SLOT_ICONS[slot.slot];
            const intensity = slot.count / maxSlotCount;
            const isPeak = slot.count === maxSlotCount && slot.count > 0;

            return (
              <div
                key={slot.slot}
                className={cn(
                  "relative p-5 rounded-2xl border-2 transition-all",
                  isPeak
                    ? "border-danger-300 bg-gradient-to-br from-danger-50 to-white shadow-lg"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                {isPeak && (
                  <span className="absolute -top-2 -right-2 tag bg-danger-500 text-white text-[10px]">
                    最高
                  </span>
                )}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                    isPeak ? "bg-danger-100" : "bg-gray-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isPeak ? "text-danger-600" : "text-gray-500"
                    )}
                  />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {slot.label}
                </p>
                <div className="flex items-end gap-2">
                  <p
                    className={cn(
                      "text-2xl font-bold font-serif",
                      isPeak ? "text-danger-600" : "text-gray-900"
                    )}
                  >
                    {slot.count}
                  </p>
                  <span className="text-xs text-gray-500 pb-1">次异常</span>
                </div>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isPeak ? "bg-danger-500" : "bg-primary-400"
                    )}
                    style={{ width: `${intensity * 100}%` }}
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

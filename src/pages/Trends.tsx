import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronLeft,
  User,
  Heart,
  RefreshCw,
  XCircle,
  CheckCircle,
  ClipboardList,
} from "lucide-react";
import { useAppStore } from "@/store";
import {
  getWeeklyAbnormalData,
  getRetestStats,
  getTimeSlotDistribution,
  getTimeSlot,
  formatTime,
  isRetestOverdue,
  getRetestRemainingMinutes,
  formatDateTime,
  getFeelingEmoji,
} from "@/utils/bpUtils";
import RetestAlertBanner from "@/components/BPRecord/RetestAlertBanner";
import type { TimeSlot, BloodPressureRecord } from "@/types";
import { cn } from "@/lib/utils";
import { startOfDay, addDays, parseISO } from "date-fns";

const SLOT_ICONS: Record<TimeSlot, typeof Sun> = {
  morning: Sunrise,
  forenoon: CloudSun,
  noon: Sun,
  afternoon: Cloud,
  evening: Sunset,
  night: Moon,
};

const ALL_SLOTS: TimeSlot[] = ["morning", "forenoon", "noon", "afternoon", "evening", "night"];

export default function Trends() {
  const navigate = useNavigate();
  const { records, selectedElderId, profiles } = useAppStore();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const elderRecords = useMemo(() => {
    return selectedElderId
      ? records.filter((r) => r.elderId === selectedElderId)
      : records;
  }, [records, selectedElderId]);

  const weeklyData = getWeeklyAbnormalData(elderRecords);
  const retestStats = getRetestStats(elderRecords);
  const selectedElder = profiles.find((p) => p.id === selectedElderId);

  const weeklyAbnormalRecords = useMemo<BloodPressureRecord[]>(() => {
    const today = startOfDay(new Date());
    const weekAgo = addDays(today, -6);
    return elderRecords.filter(
      (r) =>
        !r.originalRecordId &&
        r.isAbnormal &&
        parseISO(r.measureTime) >= weekAgo
    );
  }, [elderRecords]);

  const timeSlotData = getTimeSlotDistribution(weeklyAbnormalRecords);

  const maxSlotCount = Math.max(...timeSlotData.map((d) => d.count), 1);
  const peakSlot = timeSlotData.reduce((max, curr) =>
    curr.count > max.count ? curr : max
  );

  const slotDetailRecords = useMemo<BloodPressureRecord[]>(() => {
    if (!selectedSlot) return [];
    return weeklyAbnormalRecords
      .filter((r) => getTimeSlot(r.measureTime) === selectedSlot)
      .sort(
        (a, b) => parseISO(b.measureTime).getTime() - parseISO(a.measureTime).getTime()
      );
  }, [weeklyAbnormalRecords, selectedSlot]);

  const getRetestStatus = (record: BloodPressureRecord) => {
    if (!record.needsRetest) return null;
    if (record.retestCompleted) {
      const retest = records.find((r) => r.id === record.retestRecordId);
      return {
        type: "done" as const,
        label: retest
          ? `已复测 ${formatTime(retest.measureTime)}`
          : "已完成复测",
        retest,
      };
    }
    const overdue = isRetestOverdue(record);
    const remaining = getRetestRemainingMinutes(record);
    return {
      type: overdue ? ("overdue" as const) : ("pending" as const),
      label: overdue
        ? "复测已超时"
        : remaining > 0
        ? `${remaining} 分钟内需复测`
        : "即将超时",
      retest: null,
    };
  };

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
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-600" />
            异常高发时段分布
          </h2>
          {selectedSlot && (
            <button
              onClick={() => setSelectedSlot(null)}
              className="flex items-center gap-1.5 text-sm text-primary-600 font-medium hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回全部时段
            </button>
          )}
        </div>

        {!selectedSlot ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              点击下方时段卡片，查看该时段内本周所有异常血压记录
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {timeSlotData.map((slot) => {
                const Icon = SLOT_ICONS[slot.slot];
                const intensity = slot.count / maxSlotCount;
                const isPeak = slot.count === maxSlotCount && slot.count > 0;
                const clickable = slot.count > 0;

                return (
                  <button
                    key={slot.slot}
                    onClick={() => clickable && setSelectedSlot(slot.slot)}
                    disabled={!clickable}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 transition-all text-left w-full",
                      isPeak
                        ? "border-danger-300 bg-gradient-to-br from-danger-50 to-white shadow-lg"
                        : clickable
                        ? "border-gray-100 bg-white hover:border-primary-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                        : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                    )}
                  >
                    {isPeak && (
                      <span className="absolute -top-2 -right-2 tag bg-danger-500 text-white text-[10px]">
                        最高
                      </span>
                    )}
                    {clickable && (
                      <span className="absolute top-3 right-3 text-xs text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        查看明细 →
                      </span>
                    )}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                        isPeak
                          ? "bg-danger-100"
                          : clickable
                          ? "bg-primary-50"
                          : "bg-gray-100"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-6 h-6",
                          isPeak
                            ? "text-danger-600"
                            : clickable
                            ? "text-primary-600"
                            : "text-gray-400"
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
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            {(() => {
              const slotInfo = timeSlotData.find((s) => s.slot === selectedSlot);
              const Icon = SLOT_ICONS[selectedSlot];
              return (
                <>
                  <div className="flex items-center gap-4 mb-5 p-4 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-100">
                    <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">时段明细</p>
                      <p className="text-xl font-bold font-serif text-gray-900">
                        {slotInfo?.label}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold font-serif text-primary-600">
                        {slotDetailRecords.length}
                      </p>
                      <p className="text-xs text-gray-500">本周异常次数</p>
                    </div>
                  </div>

                  {slotDetailRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">本周该时段暂无异常记录</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slotDetailRecords.map((record) => {
                        const elder = profiles.find((p) => p.id === record.elderId);
                        const retestStatus = getRetestStatus(record);

                        return (
                          <div
                            key={record.id}
                            className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-primary-200 hover:shadow-sm transition-all group"
                          >
                            <div className="flex-shrink-0">
                              {elder ? (
                                <img
                                  src={elder.avatar}
                                  alt={elder.name}
                                  className="w-12 h-12 rounded-xl object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-semibold text-gray-900">
                                  {elder?.name || "未知"}
                                </span>
                                <span className="text-2xl mr-0.5">
                                  {getFeelingEmoji(record.feeling)}
                                </span>
                                {record.isAbnormal && (
                                  <span className="tag bg-danger-100 text-danger-700 text-[11px] py-0.5">
                                    异常
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" />
                                  {formatDateTime(record.measureTime)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Heart className="w-3.5 h-3.5 text-danger-400" />
                                  高压 <b className="text-gray-900">{record.systolic}</b>
                                  <span className="text-gray-400 mx-0.5">/</span>
                                  低压 <b className="text-gray-900">{record.diastolic}</b>
                                  <span className="text-gray-400 ml-1">·</span>
                                  <span className="ml-1">心率 {record.heartRate}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-shrink-0">
                              {retestStatus && (
                                <div className="text-right">
                                  <p
                                    className={cn(
                                      "text-sm font-medium inline-flex items-center gap-1",
                                      retestStatus.type === "done" && "text-success-600",
                                      retestStatus.type === "overdue" &&
                                        "text-danger-600",
                                      retestStatus.type === "pending" &&
                                        "text-amber-600"
                                    )}
                                  >
                                    {retestStatus.type === "done" && (
                                      <CheckCircle className="w-4 h-4" />
                                    )}
                                    {retestStatus.type === "overdue" && (
                                      <XCircle className="w-4 h-4" />
                                    )}
                                    {retestStatus.type === "pending" && (
                                      <RefreshCw className="w-4 h-4" />
                                    )}
                                    {retestStatus.label}
                                  </p>
                                  {retestStatus.retest && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                      复测 {retestStatus.retest.systolic}/
                                      {retestStatus.retest.diastolic}
                                    </p>
                                  )}
                                </div>
                              )}

                              {record.needsRetest && !record.retestCompleted && (
                                <button
                                  onClick={() =>
                                    navigate(`/records/${record.id}/retest`)
                                  }
                                  className={cn(
                                    "px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95",
                                    retestStatus?.type === "overdue"
                                      ? "bg-danger-500 text-white hover:bg-danger-600 animate-pulse-red"
                                      : "bg-primary-600 text-white hover:bg-primary-700"
                                  )}
                                >
                                  <RefreshCw className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                                  去复测
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

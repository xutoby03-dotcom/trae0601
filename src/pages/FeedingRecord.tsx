import { useState, useMemo } from "react";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import FeedingModal from "@/components/feeding/FeedingModal";
import {
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  parseISO,
  isBefore,
  startOfDay,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  CalendarDays,
  ListChecks,
  Sun,
  Moon,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  leftoverMeta,
  fishStatusMeta,
  formatDate,
  formatTime,
  todayStr,
  periodLabel,
  weekdayName,
} from "@/utils/formatters";
import type { FeedingPeriod } from "@/types";
import { buildDailyPlanForAquarium } from "@/data/seedData";

export default function FeedingRecord() {
  const aquariums = useAquariumStore((s) => s.aquariums);
  const getPlanForDate = useFeedingStore((s) => s.getPlanForDate);
  const getRecordsForDate = useFeedingStore((s) => s.getRecordsForDate);
  const ensurePlanForDate = useFeedingStore((s) => s.ensurePlanForDate);
  const getAllRecords = useFeedingStore((s) => s.getAllRecords);

  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [cursor, setCursor] = useState(new Date());
  const [selectedAquarium, setSelectedAquarium] = useState<string>(
    aquariums[0]?.id || ""
  );
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [feedModal, setFeedModal] = useState<{
    open: boolean;
    aqId?: string;
    period?: FeedingPeriod;
  }>({ open: false });

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const a = aquariums.find((x) => x.id === selectedAquarium);

  const planFor = (dateStr: string) => {
    if (!a) return null;
    ensurePlanForDate(a.id, dateStr);
    return (
      getPlanForDate(a.id, dateStr) ||
      buildDailyPlanForAquarium(a, dateStr)
    );
  };

  const todayRecords = useMemo(
    () => (a ? getAllRecords(a.id).slice(0, 50) : []),
    [a, getAllRecords]
  );

  const weekdayHeader = ["一", "二", "三", "四", "五", "六", "日"];

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-900 flex items-center gap-2">
            <Utensils className="w-7 h-7 text-water-600" />
            喂食记录
          </h2>
          <p className="text-sm text-brand-600 mt-1">
            记录每次喂食，掌握鱼儿进食情况
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {aquariums.length > 0 && (
            <select
              value={selectedAquarium}
              onChange={(e) => setSelectedAquarium(e.target.value)}
              className="input-field !py-2.5 !w-auto"
            >
              {aquariums.map((aq) => (
                <option key={aq.id} value={aq.id}>
                  {aq.name}
                </option>
              ))}
            </select>
          )}
          <div className="p-1 rounded-xl bg-white/60 border border-brand-100 flex">
            <button
              onClick={() => setView("calendar")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                view === "calendar"
                  ? "bg-brand-800 text-white shadow"
                  : "text-brand-700"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" /> 月历视图
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                view === "list"
                  ? "bg-brand-800 text-white shadow"
                  : "text-brand-700"
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" /> 全部记录
            </button>
          </div>
          <button
            onClick={() =>
              setFeedModal({
                open: true,
                aqId: selectedAquarium || undefined,
              })
            }
            disabled={aquariums.length === 0}
            className="btn-primary"
          >
            + 记录喂食
          </button>
        </div>
      </div>

      {aquariums.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🐟</div>
          <h3 className="font-display font-bold text-xl mb-2">请先创建鱼缸档案</h3>
        </div>
      ) : view === "calendar" ? (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={() => setCursor((c) => subMonths(c, 1))}
                className="w-9 h-9 rounded-xl hover:bg-brand-100/60 flex items-center justify-center transition"
              >
                <ChevronLeft className="w-5 h-5 text-brand-700" />
              </button>
              <div className="text-center">
                <div className="font-display text-xl md:text-2xl font-bold text-brand-900">
                  {format(cursor, "yyyy年 M月", { locale: zhCN })}
                </div>
                <button
                  onClick={() => setCursor(new Date())}
                  className="text-xs text-brand-600 hover:text-brand-800 mt-0.5 underline decoration-dotted"
                >
                  回到今天
                </button>
              </div>
              <button
                onClick={() => setCursor((c) => addMonths(c, 1))}
                className="w-9 h-9 rounded-xl hover:bg-brand-100/60 flex items-center justify-center transition"
              >
                <ChevronRight className="w-5 h-5 text-brand-700" />
              </button>
            </div>

            <div className="grid grid-cols-7 text-[11px] font-semibold text-brand-600 text-center mb-2">
              {weekdayHeader.map((w) => (
                <div key={w} className="py-2">
                  {w}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const dateStr = format(d, "yyyy-MM-dd");
                const inMonth = isSameMonth(d, cursor);
                const isToday = isSameDay(d, new Date());
                const isSelected = dateStr === selectedDate;
                const plan = planFor(dateStr);
                const records = a ? getRecordsForDate(a.id, dateStr) : [];
                const isPast = isBefore(startOfDay(d), startOfDay(new Date()));
                const morningDone =
                  plan?.morning_done ||
                  records.some((r) => r.period === "morning");
                const eveningDone =
                  plan?.evening_done ||
                  records.some((r) => r.period === "evening");
                const morningMissed = isPast && plan && !morningDone;
                const eveningMissed = isPast && plan && !eveningDone;
                const hasLeftover = records.some(
                  (r) =>
                    r.leftover_level === "medium" ||
                    r.leftover_level === "lots"
                );

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`relative aspect-square md:aspect-[4/5] rounded-xl p-1.5 md:p-2 text-left transition-all ${
                      inMonth
                        ? "bg-white/60 hover:bg-white border border-white/60"
                        : "bg-white/20 border border-transparent opacity-50"
                    } ${
                      isSelected
                        ? "ring-2 ring-water-500 shadow-md scale-[1.02]"
                        : ""
                    } ${isToday ? "ring-2 ring-brand-400" : ""}`}
                  >
                    <div
                      className={`text-xs font-semibold ${
                        isToday
                          ? "inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-800 text-white"
                          : inMonth
                          ? "text-brand-800"
                          : "text-brand-400"
                      }`}
                    >
                      {format(d, "d")}
                    </div>

                    {inMonth && plan && (
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 space-y-1">
                        <div className="flex items-center gap-1 text-[10px]">
                          <Sun className="w-2.5 h-2.5 text-amber-500" />
                          {morningDone ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : morningMissed ? (
                            <AlertTriangle className="w-3 h-3 text-coral-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-brand-400" />
                          )}
                          <span className="truncate tabular-nums text-brand-700">
                            {plan.morning_grams.toFixed(1)}g
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px]">
                          <Moon className="w-2.5 h-2.5 text-indigo-500" />
                          {eveningDone ? (
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                          ) : eveningMissed ? (
                            <AlertTriangle className="w-3 h-3 text-coral-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-brand-400" />
                          )}
                          <span className="truncate tabular-nums text-brand-700">
                            {plan.evening_grams.toFixed(1)}g
                          </span>
                        </div>
                      </div>
                    )}

                    {hasLeftover && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-brand-100/60 flex flex-wrap gap-4 text-[11px] text-brand-600">
              <Legend icon={<Sun className="w-3.5 h-3.5 text-amber-500" />} label="早晨" />
              <Legend icon={<Moon className="w-3.5 h-3.5 text-indigo-500" />} label="傍晚" />
              <Legend
                icon={<CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                label="已喂"
              />
              <Legend
                icon={<AlertTriangle className="w-3.5 h-3.5 text-coral-500" />}
                label="漏喂"
              />
              <Legend
                icon={<span className="w-3 h-3 rounded-full bg-amber-400 block" />}
                label="有剩食"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-brand-600">
                    {weekdayName(selectedDate)}
                  </div>
                  <h4 className="font-display text-lg font-bold text-brand-900">
                    {formatDate(selectedDate)}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setFeedModal({
                        open: true,
                        aqId: selectedAquarium,
                        period: "morning",
                      })
                    }
                    className="chip bg-amber-50 text-amber-700 hover:bg-amber-100"
                  >
                    <Sun className="w-3 h-3" /> 记录早晨
                  </button>
                  <button
                    onClick={() =>
                      setFeedModal({
                        open: true,
                        aqId: selectedAquarium,
                        period: "evening",
                      })
                    }
                    className="chip bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    <Moon className="w-3 h-3" /> 记录傍晚
                  </button>
                </div>
              </div>
              {(() => {
                const plan = planFor(selectedDate);
                const records = a
                  ? getRecordsForDate(a.id, selectedDate)
                  : [];
                return (
                  <div className="space-y-3">
                    {plan && (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            period: "morning" as const,
                            icon: Sun,
                            plan_grams: plan.morning_grams,
                            done:
                              plan.morning_done ||
                              records.some((r) => r.period === "morning"),
                            color: "amber",
                          },
                          {
                            period: "evening" as const,
                            icon: Moon,
                            plan_grams: plan.evening_grams,
                            done:
                              plan.evening_done ||
                              records.some((r) => r.period === "evening"),
                            color: "indigo",
                          },
                        ].map((p) => {
                          const Icon = p.icon;
                          const recs = records.filter((r) => r.period === p.period);
                          const actual = recs.reduce(
                            (s, r) => s + r.actual_grams,
                            0
                          );
                          return (
                            <div
                              key={p.period}
                              className={`p-4 rounded-2xl border ${
                                p.done
                                  ? "bg-green-50/60 border-green-200"
                                  : `bg-${p.color}-50/60 border-${p.color}-100`
                              }`}
                            >
                              <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 mb-1">
                                <Icon className={`w-4 h-4 text-${p.color}-500`} />
                                {periodLabel[p.period]}
                                {p.done && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 ml-auto" />
                                )}
                              </div>
                              <div className="text-[11px] text-brand-600">
                                计划 {p.plan_grams.toFixed(1)}g
                              </div>
                              <div className="mt-1 font-bold tabular-nums text-brand-900">
                                实际 {actual.toFixed(1)}g
                                {recs.length > 1 && (
                                  <span className="text-[10px] text-red-500 ml-1 font-normal">
                                    ({recs.length}次)
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {records.length === 0 ? (
                      <div className="py-6 text-center text-xs text-brand-500">
                        这一天还没有喂食记录
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {records.map((r) => {
                          const lo = leftoverMeta[r.leftover_level];
                          const fs = fishStatusMeta[r.fish_status];
                          return (
                            <div
                              key={r.id}
                              className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-brand-100"
                            >
                              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-water-100 to-brand-100 flex items-center justify-center">
                                {r.period === "morning" ? (
                                  <Sun className="w-4 h-4 text-amber-500" />
                                ) : (
                                  <Moon className="w-4 h-4 text-indigo-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0 text-xs">
                                <div className="flex items-center gap-2 text-brand-900 font-semibold">
                                  {formatTime(r.datetime)} · 👤 {r.feeder}
                                </div>
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                  <span className="chip bg-brand-50 text-brand-700 !py-0.5 tabular-nums">
                                    {r.actual_grams.toFixed(1)}g
                                  </span>
                                  <span
                                    className={`chip ${lo.bg} ${lo.color} !py-0.5`}
                                  >
                                    {lo.label}
                                  </span>
                                  <span
                                    className={`chip ${fs.bg} ${fs.color} !py-0.5`}
                                  >
                                    {fs.emoji} {fs.label}
                                  </span>
                                </div>
                                {r.notes && (
                                  <div className="mt-1 text-brand-600 opacity-80 italic">
                                    “{r.notes}”
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-card p-5 md:p-6">
          <h4 className="font-display font-bold text-lg text-brand-900 mb-4">
            全部喂食记录（最近 {todayRecords.length} 条）
          </h4>
          {todayRecords.length === 0 ? (
            <div className="py-10 text-center text-sm text-brand-500">
              还没有记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-[11px] text-brand-500 border-b border-brand-100">
                    <th className="text-left py-2.5 px-3">日期</th>
                    <th className="text-left py-2.5 px-3">时段</th>
                    <th className="text-left py-2.5 px-3">喂食人</th>
                    <th className="text-right py-2.5 px-3">份量(g)</th>
                    <th className="text-left py-2.5 px-3">剩食</th>
                    <th className="text-left py-2.5 px-3">鱼状态</th>
                    <th className="text-left py-2.5 px-3">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {todayRecords.map((r) => {
                    const lo = leftoverMeta[r.leftover_level];
                    const fs = fishStatusMeta[r.fish_status];
                    return (
                      <tr key={r.id} className="hover:bg-brand-50/40">
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-brand-800">
                            {formatDate(r.datetime, "M月d日")}
                          </div>
                          <div className="text-[11px] text-brand-500">
                            {formatTime(r.datetime)} · {weekdayName(r.datetime)}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="chip bg-brand-50 text-brand-700">
                            {periodLabel[r.period]}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-brand-800">
                          👤 {r.feeder}
                        </td>
                        <td className="py-3 px-3 text-right font-bold tabular-nums text-brand-900">
                          {r.actual_grams.toFixed(1)}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`chip ${lo.bg} ${lo.color}`}>
                            {lo.label}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`chip ${fs.bg} ${fs.color}`}>
                            {fs.emoji} {fs.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-brand-600 max-w-[200px] truncate">
                          {r.notes || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <FeedingModal
        open={feedModal.open}
        onClose={() => setFeedModal({ open: false })}
        defaultAquariumId={feedModal.aqId}
        defaultPeriod={feedModal.period}
      />
    </div>
  );
}

function Legend({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      {icon}
      <span>{label}</span>
    </div>
  );
}

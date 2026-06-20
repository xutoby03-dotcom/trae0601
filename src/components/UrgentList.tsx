import type { DryingRecord } from "@/types";
import { useWeatherStore } from "@/store/weatherStore";
import {
  sortNeedCollectByUrgency,
  getOverdueCount,
  getNeedCollectCount,
  getPrimaryReason,
  getReasonText,
  getReasonColorClass,
  getReasonEmoji,
  hasWeatherWarning,
  getNeedCollectReasons,
} from "@/utils/stats";
import { formatRelativeTime, formatDateTime, isOverdue24h, getRemainingHours, isPastExpected } from "@/utils/time";
import { AlertTriangle, Clock, AlarmClock, CloudRain, Wind, Droplets } from "lucide-react";

interface Props {
  records: DryingRecord[];
  onCollect: (r: DryingRecord) => void;
}

export default function UrgentList({ records, onCollect }: Props) {
  const { weather } = useWeatherStore();
  const sorted = sortNeedCollectByUrgency(records, weather);
  const needCollectCount = getNeedCollectCount(records, weather);
  const overdueCount = getOverdueCount(records);
  const hasWarning = hasWeatherWarning(weather);

  const getWarningText = () => {
    if (weather.weatherType === "rainy") return "正在下雨";
    if (weather.weatherType === "windy") return "大风天气";
    if (weather.rainProbability >= 60) return `降雨${weather.rainProbability}%`;
    if (weather.humidity >= 80) return `湿度${weather.humidity}%`;
    if (weather.windSpeed >= 10) return `风速${weather.windSpeed}m/s`;
    return "天气预警";
  };

  const getCountBreakdown = () => {
    const parts: string[] = [];
    if (overdueCount > 0) parts.push(`超时${overdueCount}`);
    const weatherRelated = sorted.filter((r) => {
      const reasons = getNeedCollectReasons(r, weather);
      return reasons.some((rr) => ["rainy", "highRainProb", "windy", "highHumidity"].includes(rr));
    }).length;
    if (weatherRelated > 0) parts.push(`天气原因${weatherRelated}`);
    if (parts.length > 0) return ` · ${parts.join("，")}`;
    return "";
  };

  return (
    <div className={hasWarning || overdueCount > 0 ? "card-danger" : "card"}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              hasWarning || overdueCount > 0
                ? "bg-warn-red/15 text-warn-red animate-pulse"
                : "bg-warn-green/15 text-warn-green"
            }`}
          >
            {overdueCount > 0 ? <AlarmClock className="w-5 h-5" /> : hasWarning ? <AlertTriangle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-display text-xl text-sky-800">待收衣提醒</h2>
            <p className="text-xs text-sky-500 mt-0.5">
              {needCollectCount > 0
                ? `共 ${needCollectCount} 件需要收衣${getCountBreakdown()}`
                : "当前没有需要收的衣物"}
            </p>
          </div>
        </div>

        {hasWarning && (
          <div className="chip bg-warn-red/15 text-warn-red border border-warn-red/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{getWarningText()}</span>
          </div>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="py-10 text-center">
          <div className="text-5xl mb-3">🌤️</div>
          <p className="text-sky-600 font-medium">当前没有需要收的衣物</p>
          <p className="text-xs text-sky-400 mt-1">
            {hasWarning
              ? `已检查：${getWarningText()}，但暂无晾晒中衣物`
              : "天气良好，衣物还在正常晾晒中"}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {sorted.map((r) => {
            const overdue = isOverdue24h(r.startTime);
            const pastExpected = isPastExpected(r.expectedTime);
            const remain = getRemainingHours(r.expectedTime);
            const reason = getPrimaryReason(r, weather);
            const allReasons = getNeedCollectReasons(r, weather);

            const isWeatherReason =
              reason === "rainy" || reason === "highRainProb" || reason === "windy" || reason === "highHumidity";
            const isTimeReason = reason === "overdue24h" || reason === "pastExpected";

            return (
              <button
                key={r.id}
                onClick={() => onCollect(r)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all hover:shadow-md group ${
                  reason === "overdue24h"
                    ? "bg-warn-yellow/20 border-warn-yellow/50 hover:bg-warn-yellow/30"
                    : reason === "pastExpected"
                    ? "bg-warn-yellow/10 border-warn-yellow/40 hover:bg-warn-yellow/20"
                    : reason === "rainy" || reason === "windy" || reason === "highRainProb"
                    ? "bg-warn-red/8 border-warn-red/30 hover:bg-warn-red/15"
                    : reason === "highHumidity"
                    ? "bg-sky-100/50 border-sky-200/60 hover:bg-sky-100"
                    : "bg-white/60 border-sky-100 hover:bg-white/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      reason === "overdue24h"
                        ? "bg-warn-yellow/40"
                        : reason === "pastExpected"
                        ? "bg-warn-yellow/25"
                        : reason === "rainy" || reason === "highRainProb"
                        ? "bg-warn-red/15"
                        : reason === "windy"
                        ? "bg-warn-red/15"
                        : reason === "highHumidity"
                        ? "bg-sky-200/60"
                        : "bg-sky-100/60"
                    }`}
                  >
                    {reason ? getReasonEmoji(reason) : "👚"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sky-800">
                        {r.clothingType} × {r.quantity}
                      </span>
                      {reason && (
                        <span className={`chip text-[10px] ${getReasonColorClass(reason)}`}>
                          {getReasonText(reason)}
                        </span>
                      )}
                      {allReasons.length > 1 && (
                        <span className="chip text-[10px] bg-sky-100 text-sky-600">
                          +{allReasons.length - 1} 项原因
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-sky-600 mt-1 flex-wrap">
                      <span>👤 {r.owner}</span>
                      <span className="opacity-40">·</span>
                      <span>📍 {r.location}</span>
                    </div>
                    <div className="text-xs text-sky-500 mt-1">
                      开始 {formatRelativeTime(r.startTime)} · 预计 {formatDateTime(r.expectedTime)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-sky-400 group-hover:text-sky-600 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import type { DryingRecord } from "@/types";
import {
  formatRelativeTime,
  formatDateTime,
  getDurationHours,
  isOverdue24h,
  isPastExpected,
  getProgressPercent,
} from "@/utils/time";
import { getStatusText, getStatusChipClass, getNeedCollectReasons } from "@/utils/stats";
import { useMemberStore } from "@/store/memberStore";
import { useWeatherStore } from "@/store/weatherStore";
import { MapPin, Clock, User, Package, CheckCircle2, XCircle, AlarmClock, StickyNote } from "lucide-react";
import CollectModal from "./CollectModal";

interface Props {
  record: DryingRecord;
  compact?: boolean;
  onCollected?: () => void;
}

const clothingEmoji: Record<string, string> = {
  被套: "🛏️",
  床单: "🛌",
  枕套: "💤",
  毛巾: "🧻",
  浴巾: "🛁",
  T恤: "👕",
  衬衫: "👔",
  裤子: "👖",
  牛仔裤: "👖",
  内衣: "🩲",
  袜子: "🧦",
  毛衣: "🧥",
  外套: "🧥",
  羽绒服: "🧥",
  裙子: "👗",
  其他: "👚",
};

export default function DryingCard({ record, compact, onCollected }: Props) {
  const [showCollect, setShowCollect] = useState(false);
  const { members } = useMemberStore();
  const { weather } = useWeatherStore();
  const triggerReasons = getNeedCollectReasons(record, weather);

  const member = members.find((m) => m.id === record.ownerId);
  const overdue = isOverdue24h(record.startTime);
  const pastExpected = isPastExpected(record.expectedTime);
  const duration = getDurationHours(record.startTime, record.status !== "drying" ? record.collectedAt : undefined);
  const progress = getProgressPercent(record.startTime, record.expectedTime);

  const cardClass =
    record.status === "drying"
      ? overdue
        ? "card-warning"
        : pastExpected
        ? "bg-amber-50/80 backdrop-blur-sm rounded-2xl shadow-sm border-2 border-warn-yellow/50 p-5"
        : "card hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
      : "card opacity-90";

  const emoji = clothingEmoji[record.clothingType] || "👚";

  const handleCollected = () => {
    setShowCollect(false);
    onCollected?.();
  };

  return (
    <>
      <div className={`${cardClass} animate-slide-in-right relative overflow-hidden`}>
        {overdue && record.status === "drying" && (
          <div className="absolute top-2 right-2 flex items-center gap-1 chip bg-warn-red/20 text-warn-red border border-warn-red/30 animate-pulse">
            <AlarmClock className="w-3.5 h-3.5" />
            <span>超24小时！</span>
          </div>
        )}
        {pastExpected && !overdue && record.status === "drying" && (
          <div className="absolute top-2 right-2 flex items-center gap-1 chip bg-warn-yellow/30 text-amber-700 border border-warn-yellow/40">
            <Clock className="w-3.5 h-3.5" />
            <span>待收衣</span>
          </div>
        )}

        <div className={`flex gap-4 ${compact ? "" : "md:gap-5"}`}>
          <div className="flex-shrink-0">
            <div
              className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner"
              style={{
                background: member
                  ? `linear-gradient(135deg, ${member.color}20, ${member.color}05)`
                  : "bg-gradient-to-br from-sky-100 to-sky-50",
              }}
            >
              {record.photo ? (
                <img src={record.photo} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span>{emoji}</span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display text-xl text-sky-800">{record.clothingType}</h3>
                  <span className={`chip ${getStatusChipClass(record.status)}`}>
                    {getStatusText(record.status)}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-sky-600 text-sm">
                  <Package className="w-3.5 h-3.5" />
                  <span>共 {record.quantity} 件</span>
                  <span className="mx-1.5 opacity-40">·</span>
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{record.location}</span>
                </div>
              </div>
              {member && (
                <div
                  className="flex-shrink-0 flex flex-col items-center"
                  title={`负责人：${member.name}`}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-sm"
                    style={{ backgroundColor: `${member.color}25` }}
                  >
                    {member.avatar}
                  </div>
                  <span className="text-xs mt-0.5 text-sky-600">{member.name}</span>
                </div>
              )}
            </div>

            {!compact && (
              <div className="space-y-2 mt-3 text-sm">
                <div className="flex items-center gap-4 text-sky-600 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    开始：{formatDateTime(record.startTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    已晾 {duration} 小时
                  </span>
                </div>

                {record.status === "drying" && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-sky-500">预计收衣：{formatDateTime(record.expectedTime)}</span>
                      <span className={pastExpected ? "text-warn-red font-medium" : "text-sky-600"}>
                        {pastExpected ? "已超时" : `${Math.round(progress)}%`}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-sky-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          overdue
                            ? "bg-warn-red"
                            : pastExpected
                            ? "bg-warn-yellow"
                            : progress > 70
                            ? "bg-warn-green"
                            : "bg-sky-400"
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {record.status !== "drying" && record.collectedAt && (
                  <div className="space-y-2 pt-1">
                    <div className="flex flex-wrap gap-2">
                      <CollectStatusItem ok={record.isDry} okText="已干透" badText="未干透" />
                      <CollectStatusItem ok={!record.isDamp} okText="无返潮" badText="有返潮" />
                      <CollectStatusItem
                        ok={!record.needRewash}
                        okText="无需重洗"
                        badText="需重洗"
                        dangerWhenBad
                      />
                      <span className="chip bg-sky-100 text-sky-700">
                        收衣：{formatRelativeTime(record.collectedAt)}
                      </span>
                    </div>
                    {record.notes && (
                      <div className="flex items-start gap-2 p-2 rounded-xl bg-sky-50/60 border border-sky-100/60">
                        <StickyNote className="w-4 h-4 text-sun-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-sky-600 leading-relaxed">{record.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {record.status === "drying" && !compact && (
              <div className="flex gap-2 mt-4">
                <button className="btn-success text-sm flex-1" onClick={() => setShowCollect(true)}>
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  登记收衣
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCollect && (
        <CollectModal
          record={record}
          onClose={() => setShowCollect(false)}
          onSuccess={handleCollected}
          triggerReasons={triggerReasons}
        />
      )}
    </>
  );
}

function CollectStatusItem({
  ok,
  okText,
  badText,
  dangerWhenBad,
}: {
  ok?: boolean;
  okText: string;
  badText: string;
  dangerWhenBad?: boolean;
}) {
  return (
    <span
      className={`chip ${
        ok
          ? "bg-warn-green/15 text-emerald-700"
          : dangerWhenBad
          ? "bg-warn-red/15 text-warn-red"
          : "bg-warn-yellow/20 text-amber-700"
      }`}
    >
      {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {ok ? okText : badText}
    </span>
  );
}

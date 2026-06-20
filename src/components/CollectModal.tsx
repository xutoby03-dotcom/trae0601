import { useEffect, useState } from "react";
import type { DryingRecord } from "@/types";
import { useDryingStore } from "@/store/dryingStore";
import { useMemberStore } from "@/store/memberStore";
import type { NeedCollectReason } from "@/utils/stats";
import { getReasonText, getReasonColorClass, getReasonEmoji } from "@/utils/stats";
import { X, CheckCircle2, Droplets, Wind, RotateCcw, StickyNote } from "lucide-react";

interface Props {
  record: DryingRecord;
  onClose: () => void;
  onSuccess: () => void;
  triggerReasons?: NeedCollectReason[];
}

const reasonNotePlaceholders: Record<NeedCollectReason, string> = {
  overdue24h: "晾晒已超过24小时，注意检查是否有异味或需要重新晾晒~",
  pastExpected: "已超过预计收衣时间，检查下衣服状态吧",
  rainy: "正在下雨！注意检查衣物是否被淋湿，淋湿了记得勾选重洗",
  highRainProb: "降雨概率很高，尽快收衣避免被淋湿",
  windy: "大风天气，检查衣物是否被吹落或者沾了灰尘",
  highHumidity: "空气湿度大，衣物可能没干透，记得检查是否需要继续晾干",
};

export default function CollectModal({ record, onClose, onSuccess, triggerReasons = [] }: Props) {
  const { collectRecord } = useDryingStore();
  const { members } = useMemberStore();
  const member = members.find((m) => m.id === record.ownerId);

  const [isDry, setIsDry] = useState(true);
  const [isDamp, setIsDamp] = useState(false);
  const [needRewash, setNeedRewash] = useState(false);
  const [notes, setNotes] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const notePlaceholder =
    triggerReasons.length > 0
      ? reasonNotePlaceholders[triggerReasons[0]]
      : "记录收衣时的特殊情况，比如发现衣物有污渍等...";

  useEffect(() => {
    if (triggerReasons.includes("rainy") || triggerReasons.includes("highRainProb")) {
      setNeedRewash(true);
    }
    if (triggerReasons.includes("highHumidity")) {
      setIsDry(false);
      setIsDamp(true);
    }
  }, [triggerReasons]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = () => {
    collectRecord(record.id, { isDry, isDamp, needRewash, notes: notes.trim() || undefined });
    setShowSuccess(true);
    setTimeout(() => {
      onSuccess();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {showSuccess ? (
          <div className="p-12 text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-warn-green/15 flex items-center justify-center mb-4 animate-check-pop">
              <CheckCircle2 className="w-14 h-14 text-warn-green" />
            </div>
            <h3 className="font-display text-2xl text-sky-800 mb-2">收衣完成！</h3>
            <p className="text-sky-600 text-sm">
              {record.clothingType} × {record.quantity} 件已收衣登记
            </p>
          </div>
        ) : (
          <>
            <div
              className="p-5 pb-3"
              style={{
                background: member
                  ? `linear-gradient(135deg, ${member.color}15, transparent)`
                  : "bg-sky-50/50",
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-2xl text-sky-800">登记收衣</h3>
                    {triggerReasons.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {triggerReasons.map((r, i) => (
                          <span key={i} className={`chip text-xs ${getReasonColorClass(r)}`}>
                            <span className="mr-0.5">{getReasonEmoji(r)}</span>
                            {getReasonText(r)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sky-500 text-sm mt-1">
                    检查 {record.clothingType}（{record.quantity} 件）的晾晒状态
                  </p>
                  {triggerReasons.length > 0 && (
                    <p className="text-xs mt-1.5" style={{ color: triggerReasons.includes("overdue24h") || triggerReasons.includes("rainy") || triggerReasons.includes("windy") ? "#EE5253" : "#4A90D9" }}>
                      ⚠️ {reasonNotePlaceholders[triggerReasons[0]]}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl hover:bg-white/60 flex items-center justify-center text-sky-500 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <ToggleCard
                icon={<CheckCircle2 className="w-5 h-5" />}
                title="是否干透"
                description="摸起来完全干爽，没有潮气"
                value={isDry}
                onChange={setIsDry}
                okColor
              />
              <ToggleCard
                icon={<Droplets className="w-5 h-5" />}
                title="是否返潮"
                description="因潮湿/露水等原因重新变湿"
                value={isDamp}
                onChange={setIsDamp}
                warnWhenOn
              />
              <ToggleCard
                icon={<RotateCcw className="w-5 h-5" />}
                title="需要重洗"
                description="被雨淋/弄脏，需要重新清洗"
                value={needRewash}
                onChange={setNeedRewash}
                dangerWhenOn
              />

              <div>
                <label className="label-text flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-sky-500" />
                  备注（可选）
                </label>
                <textarea
                  rows={3}
                  className="input-field resize-none text-sm"
                  placeholder={notePlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="p-5 pt-2 flex gap-3 border-t border-sky-100/60">
              <button className="btn-secondary flex-1" onClick={onClose}>
                取消
              </button>
              <button className="btn-primary flex-1" onClick={handleSubmit}>
                <Wind className="w-4 h-4 inline mr-1" />
                确认收衣
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ToggleCard({
  icon,
  title,
  description,
  value,
  onChange,
  okColor,
  warnWhenOn,
  dangerWhenOn,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  okColor?: boolean;
  warnWhenOn?: boolean;
  dangerWhenOn?: boolean;
}) {
  const activeColor = dangerWhenOn
    ? "border-warn-red/50 bg-warn-red/5"
    : warnWhenOn
    ? "border-warn-yellow/60 bg-warn-yellow/10"
    : okColor
    ? "border-warn-green/50 bg-warn-green/10"
    : "border-sky-400/60 bg-sky-50";

  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
        value ? activeColor : "border-sky-100 bg-white/60 hover:border-sky-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            value
              ? dangerWhenOn
                ? "bg-warn-red/20 text-warn-red"
                : warnWhenOn
                ? "bg-warn-yellow/30 text-amber-600"
                : okColor
                ? "bg-warn-green/20 text-warn-green"
                : "bg-sky-400/20 text-sky-600"
              : "bg-sky-100 text-sky-500"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sky-800">{title}</h4>
            <div
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${
                value
                  ? dangerWhenOn
                    ? "bg-warn-red"
                    : warnWhenOn
                    ? "bg-warn-yellow"
                    : okColor
                    ? "bg-warn-green"
                    : "bg-sky-400"
                  : "bg-sky-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  value ? "translate-x-5" : ""
                }`}
              />
            </div>
          </div>
          <p className="text-xs text-sky-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}

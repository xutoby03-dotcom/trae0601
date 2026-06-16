import type { Aquarium } from "@/types";
import { Thermometer, Ruler, Fish } from "lucide-react";
import { useFeedingStore } from "@/store/useFeedingStore";
import { todayStr } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

interface Props {
  aquarium: Aquarium;
  onFeed?: (aqId: string, period: "morning" | "evening") => void;
  onEdit?: (aqId: string) => void;
  highlight?: boolean;
}

export default function AquariumCard({ aquarium: a, onFeed, onEdit, highlight }: Props) {
  const navigate = useNavigate();
  const getPlanForDate = useFeedingStore((s) => s.getPlanForDate);
  const plan = getPlanForDate(a.id, todayStr());
  const h = new Date().getHours();
  const currentPeriod: "morning" | "evening" = h < 14 ? "morning" : "evening";

  const morningDone = plan?.morning_done ?? false;
  const eveningDone = plan?.evening_done ?? false;
  const progress = ((morningDone ? 1 : 0) + (eveningDone ? 1 : 0)) / 2;

  const totalFish = a.fish_species.reduce((s, f) => s + f.count, 0);
  const dailyGrams =
    (plan?.morning_grams ?? 0) + (plan?.evening_grams ?? 0);

  return (
    <div
      className={`relative glass-card glass-card-hover overflow-hidden animate-fade-slide-up ${
        highlight ? "ring-2 ring-water-400/60" : ""
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-brand-500/30 via-water-400/20 to-transparent pointer-events-none" />

      <div className="relative p-5 flex gap-4">
        <div
          className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-brand-700 to-water-600 shadow-md ring-2 ring-white/50 cursor-pointer hover:scale-105 transition"
          onClick={() => navigate(`/aquariums/${a.id}`)}
          title="查看详情"
        >
          {a.photo_url ? (
            <img
              src={a.photo_url}
              alt={a.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              🐡
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => navigate(`/aquariums/${a.id}`)}
              className="text-left group"
            >
              <h3 className="font-display text-lg md:text-xl font-bold text-brand-900 group-hover:text-brand-700 transition">
                {a.name}
              </h3>
              <div className="text-[11px] text-brand-600 mt-0.5">
                {a.food_type}
              </div>
            </button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs text-brand-700">
            <div className="flex items-center gap-1">
              <Ruler className="w-3.5 h-3.5 text-brand-500" />
              <span className="font-semibold tabular-nums">{a.size_liters}</span>L
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold tabular-nums">{a.water_temp}</span>
              ℃
            </div>
            <div className="flex items-center gap-1">
              <Fish className="w-3.5 h-3.5 text-water-600" />
              <span className="font-semibold">{totalFish}</span>
              <span className="opacity-60">只</span>
            </div>
            <div className="flex items-center gap-1 text-brand-600">
              日需
              <span className="font-semibold tabular-nums text-brand-800">
                {dailyGrams.toFixed(1)}
              </span>
              <span>g</span>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-brand-600 mb-1.5">
              <span>今日喂食进度</span>
              <span className="font-semibold tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-brand-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 via-water-500 to-water-400 transition-all duration-700 relative overflow-hidden"
                style={{ width: `${progress * 100}%` }}
              >
                <div className="absolute inset-0 wave-pattern bg-bottom animate-ripple-bg opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 grid grid-cols-2 gap-3">
        {[
          {
            period: "morning" as const,
            label: "早晨",
            emoji: "🌅",
            grams: plan?.morning_grams ?? 0,
            done: morningDone,
          },
          {
            period: "evening" as const,
            label: "傍晚",
            emoji: "🌆",
            grams: plan?.evening_grams ?? 0,
            done: eveningDone,
          },
        ].map((p) => {
          const isCurrent = p.period === currentPeriod;
          return (
            <button
              key={p.period}
              onClick={() => !p.done && onFeed?.(a.id, p.period)}
              disabled={p.done}
              className={`relative text-left p-3 rounded-xl border transition ${
                p.done
                  ? "bg-green-50/80 border-green-200 text-green-700"
                  : isCurrent
                  ? "bg-gradient-to-br from-brand-50 to-water-50 border-water-300 text-brand-900 hover:shadow-md hover:-translate-y-0.5"
                  : "bg-white/60 border-brand-100 text-brand-700 hover:bg-white"
              }`}
            >
              {isCurrent && !p.done && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] px-2 py-0.5 rounded-full bg-water-600 text-white shadow animate-pulse-soft">
                  建议现在
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-xs font-bold">{p.label}</span>
                </div>
                <div className="text-xs tabular-nums font-semibold">
                  {p.grams.toFixed(1)}g
                </div>
              </div>
              <div className="mt-2 text-[11px]">
                {p.done ? (
                  <span className="inline-flex items-center gap-1 font-semibold">
                    ✓ 已喂食
                  </span>
                ) : (
                  <span className="opacity-70">点击记录喂食 →</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

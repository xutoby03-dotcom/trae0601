import { useEffect, useState } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import type {
  Aquarium,
  FeedingPeriod,
  LeftoverLevel,
  FishStatus,
  FeedingRecord,
} from "@/types";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import { leftoverMeta, fishStatusMeta, periodLabel, round1 } from "@/utils/formatters";
import { buildDailyPlanForAquarium } from "@/data/seedData";

interface Props {
  open: boolean;
  onClose: () => void;
  defaultAquariumId?: string;
  defaultPeriod?: FeedingPeriod;
  onSuccess?: (record: FeedingRecord, duplicate: boolean) => void;
}

const leftoverOptions: LeftoverLevel[] = ["none", "little", "medium", "lots"];
const statusOptions: FishStatus[] = ["normal", "active", "sluggish", "sick"];

export default function FeedingModal({
  open,
  onClose,
  defaultAquariumId,
  defaultPeriod,
  onSuccess,
}: Props) {
  const aquariums = useAquariumStore((s) => s.aquariums);
  const addRecord = useFeedingStore((s) => s.addRecord);
  const getPlanForDate = useFeedingStore((s) => s.getPlanForDate);

  const [aquariumId, setAquariumId] = useState<string>("");
  const [period, setPeriod] = useState<FeedingPeriod>("morning");
  const [feeder, setFeeder] = useState<string>("");
  const [grams, setGrams] = useState<string>("");
  const [leftover, setLeftover] = useState<LeftoverLevel>("none");
  const [status, setStatus] = useState<FishStatus>("normal");
  const [notes, setNotes] = useState("");
  const [suggested, setSuggested] = useState<number>(0);
  const [bubbles, setBubbles] = useState<number[]>([]);
  const [showDuplicateWarn, setShowDuplicateWarn] = useState(false);

  useEffect(() => {
    if (open) {
      setAquariumId(defaultAquariumId || aquariums[0]?.id || "");
      setPeriod(defaultPeriod || (new Date().getHours() < 14 ? "morning" : "evening"));
      const prevFeeders = JSON.parse(localStorage.getItem("recent_feeders") || "[]");
      setFeeder(prevFeeders[0] || "");
      setLeftover("none");
      setStatus("normal");
      setNotes("");
      setShowDuplicateWarn(false);
      setBubbles([]);
    }
  }, [open, defaultAquariumId, defaultPeriod, aquariums]);

  useEffect(() => {
    if (!aquariumId) {
      setSuggested(0);
      setGrams("");
      return;
    }
    const a = aquariums.find((x) => x.id === aquariumId);
    if (!a) return;
    const plan =
      getPlanForDate(aquariumId, new Date().toISOString().slice(0, 10)) ||
      buildDailyPlanForAquarium(a);
    const s = period === "morning" ? plan.morning_grams : plan.evening_grams;
    setSuggested(s);
    if (!grams) setGrams(String(s));
  }, [aquariumId, period, aquariums, getPlanForDate]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aquariumId || !feeder || !grams) return;
    const res = addRecord({
      aquarium_id: aquariumId,
      period,
      feeder,
      actual_grams: round1(parseFloat(grams) || 0),
      leftover_level: leftover,
      fish_status: status,
      notes: notes || undefined,
    });
    const recent = JSON.parse(localStorage.getItem("recent_feeders") || "[]");
    const next = [feeder, ...recent.filter((x: string) => x !== feeder)].slice(0, 5);
    localStorage.setItem("recent_feeders", JSON.stringify(next));
    setShowDuplicateWarn(res.duplicate);
    if (!res.duplicate) {
      setBubbles(Array.from({ length: 8 }, (_, i) => Date.now() + i));
    }
    setTimeout(() => {
      onSuccess?.(res.record, res.duplicate);
      if (!res.duplicate) onClose();
    }, res.duplicate ? 0 : 900);
  };

  const recentFeeders: string[] = JSON.parse(
    localStorage.getItem("recent_feeders") || '["爸爸","妈妈"]'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm animate-fade-slide-up"
        onClick={() => !showDuplicateWarn && onClose()}
      />
      <div className="relative w-full max-w-lg glass-card overflow-hidden animate-scale-in">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-brand-600/30 via-water-500/20 to-transparent pointer-events-none wave-pattern bg-bottom" />
        {bubbles.length > 0 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {bubbles.map((b, i) => (
              <span
                key={b}
                className="absolute bottom-16 animate-bubble-up block w-3 h-3 rounded-full bg-white/80 shadow-inner"
                style={{
                  left: `${15 + i * 10}%`,
                  animationDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>
        )}

        <div className="relative flex items-center justify-between px-6 py-5 border-b border-white/50">
          <div>
            <div className="text-xs text-brand-600">记录喂食</div>
            <h3 className="font-display text-xl font-bold text-brand-900">
              🐟 喂鱼啦~
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-brand-900/5 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-brand-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {showDuplicateWarn && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 animate-fade-slide-up">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 animate-pulse-soft" />
              <div className="text-sm">
                <div className="font-semibold">该时段已记录过喂食</div>
                <div className="opacity-80 mt-0.5">
                  是否确认再次投喂？重复喂食可能导致坏水。
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-outline text-xs py-2 px-4"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn-danger text-xs py-2 px-4"
                  >
                    仍要记录
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDuplicateWarn ? null : (
            <>
              <div>
                <label className="label-field">选择鱼缸</label>
                <select
                  value={aquariumId}
                  onChange={(e) => setAquariumId(e.target.value)}
                  className="input-field"
                  required
                >
                  {aquariums.length === 0 && (
                    <option value="">请先创建鱼缸档案</option>
                  )}
                  {aquariums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}（{a.size_liters}L）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-field">喂食时段</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["morning", "evening"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={`p-4 rounded-2xl border transition text-left ${
                        period === p
                          ? "bg-gradient-to-br from-brand-700 to-water-600 text-white border-transparent shadow-md"
                          : "bg-white/70 border-brand-100 text-brand-800 hover:bg-white"
                      }`}
                    >
                      <div className="text-2xl mb-1">
                        {p === "morning" ? "🌅" : "🌆"}
                      </div>
                      <div className="font-bold">{periodLabel[p]}</div>
                      <div className="text-xs opacity-80">
                        建议 {p === "morning" ? "8:00 - 10:00" : "18:00 - 20:00"}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label-field">喂食人</label>
                <input
                  value={feeder}
                  onChange={(e) => setFeeder(e.target.value)}
                  placeholder="例如：爸爸、妈妈、小明"
                  className="input-field"
                  required
                />
                {recentFeeders.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {recentFeeders.slice(0, 5).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFeeder(f)}
                        className={`chip transition ${
                          feeder === f
                            ? "bg-brand-700 text-white"
                            : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-end justify-between mb-1.5">
                  <label className="label-field mb-0">实际份量（克）</label>
                  {suggested > 0 && (
                    <button
                      type="button"
                      onClick={() => setGrams(String(suggested))}
                      className="text-xs text-water-700 font-semibold hover:underline"
                    >
                      使用建议值 {suggested}g
                    </button>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  className="input-field text-lg font-bold text-brand-900 tabular-nums"
                  placeholder="0.0"
                  required
                />
                {suggested > 0 && (
                  <div className="mt-2 h-2 rounded-full bg-brand-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        parseFloat(grams) > suggested * 1.3
                          ? "bg-red-400"
                          : parseFloat(grams) > suggested * 1.1
                          ? "bg-coral-500"
                          : "bg-gradient-to-r from-brand-500 to-water-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          ((parseFloat(grams) || 0) / (suggested * 1.5)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="label-field">剩食情况</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {leftoverOptions.map((lv) => {
                    const meta = leftoverMeta[lv];
                    const selected = leftover === lv;
                    return (
                      <button
                        key={lv}
                        type="button"
                        onClick={() => setLeftover(lv)}
                        className={`p-3 rounded-xl text-xs font-semibold transition text-center ${
                          selected
                            ? `${meta.bg} ${meta.color} ring-2 ring-offset-2 ring-current/40`
                            : "bg-white/60 text-brand-600 hover:bg-white"
                        }`}
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full mx-auto mb-1.5 ${meta.dot}`}
                        />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-field">鱼只状态</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {statusOptions.map((st) => {
                    const meta = fishStatusMeta[st];
                    const selected = status === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatus(st)}
                        className={`p-3 rounded-xl text-xs font-semibold transition ${
                          selected
                            ? `${meta.bg} ${meta.color} ring-2 ring-offset-2 ring-current/40`
                            : "bg-white/60 text-brand-600 hover:bg-white"
                        }`}
                      >
                        <div className="text-lg mb-0.5">{meta.emoji}</div>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-field">备注（选填）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="例如：换了新鱼粮、加了硝化细菌等"
                />
              </div>
            </>
          )}
        </form>

        {!showDuplicateWarn && (
          <div className="relative px-6 py-4 border-t border-white/50 flex gap-3 bg-white/40">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-outline"
            >
              取消
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!aquariumId || !feeder || !grams}
              className="flex-1 btn-primary"
            >
              <Check className="w-4 h-4" /> 保存记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

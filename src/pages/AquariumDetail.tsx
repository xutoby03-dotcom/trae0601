import { useParams, useNavigate, Link } from "react-router-dom";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import { useWaterStore } from "@/store/useWaterStore";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Thermometer,
  Ruler,
  Filter,
  Fish,
  CalendarDays,
  Droplets,
  Beaker,
  AlertCircle,
} from "lucide-react";
import {
  formatDate,
  formatTime,
  leftoverMeta,
  fishStatusMeta,
  periodLabel,
  weekdayName,
} from "@/utils/formatters";
import AquariumForm from "@/components/aquarium/AquariumForm";
import FeedingModal from "@/components/feeding/FeedingModal";
import { useState } from "react";
import { calcStockDaysLeft } from "@/utils/alertChecker";
import { useStockStore } from "@/store/useStockStore";

export default function AquariumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const a = useAquariumStore((s) => s.aquariums.find((x) => x.id === id));
  const updateAquarium = useAquariumStore((s) => s.updateAquarium);
  const removeAquarium = useAquariumStore((s) => s.removeAquarium);
  const records = useFeedingStore((s) =>
    id ? s.getAllRecords(id).slice(0, 30) : []
  );
  const getPlanForDate = useFeedingStore((s) => s.getPlanForDate);
  const waterChanges = useWaterStore((s) =>
    id ? s.getWaterChanges(id).slice(0, 5) : []
  );
  const waterTests = useWaterStore((s) =>
    id ? s.getWaterTests(id).slice(0, 5) : []
  );
  const stocks = useStockStore((s) => s.stocks);

  const [editing, setEditing] = useState(false);
  const [feedModal, setFeedModal] = useState<{
    open: boolean;
    aqId?: string;
    period?: "morning" | "evening";
  }>({ open: false });

  if (!a) {
    return (
      <div className="glass-card p-12 text-center animate-fade-slide-up">
        <AlertCircle className="w-12 h-12 mx-auto text-coral-500 mb-4" />
        <h3 className="font-display font-bold text-xl mb-2">鱼缸不存在</h3>
        <button onClick={() => navigate("/aquariums")} className="btn-outline mt-3">
          返回列表
        </button>
      </div>
    );
  }

  if (editing) {
    return <AquariumForm />;
  }

  const totalFish = a.fish_species.reduce((s, f) => s + f.count, 0);
  const dailyTotal = a.fish_species.reduce(
    (s, f) => s + f.count * f.daily_grams_per_fish,
    0
  );
  const stockDays = calcStockDaysLeft(a.food_type);
  const stock = stocks.find((s) => s.food_type === a.food_type);

  const handleDelete = () => {
    if (confirm(`确定要删除鱼缸「${a.name}」吗？相关记录不会被自动清除。`)) {
      removeAquarium(a.id);
      navigate("/aquariums");
    }
  };

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate(-1)} className="btn-ghost !p-2.5" title="返回">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-900 truncate">
            {a.name}
          </h2>
          <div className="text-sm text-brand-600 mt-0.5">
            创建于 {formatDate(a.created_at)} · 更新于 {formatDate(a.updated_at)}
          </div>
        </div>
        <button
          onClick={() => setFeedModal({ open: true, aqId: a.id })}
          className="btn-water"
        >
          🐟 记录喂食
        </button>
        <button onClick={() => setEditing(true)} className="btn-outline">
          <Edit3 className="w-4 h-4" /> 编辑
        </button>
        <button onClick={handleDelete} className="btn-danger">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card overflow-hidden">
            <div className="aspect-[4/3] bg-gradient-to-br from-brand-600/20 to-water-500/20">
              {a.photo_url ? (
                <img
                  src={a.photo_url}
                  alt={a.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  🐡
                </div>
              )}
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Ruler, label: "水容量", value: `${a.size_liters} L` },
                  { icon: Thermometer, label: "水温", value: `${a.water_temp}℃` },
                ].map((it) => {
                  const Icon = it.icon;
                  return (
                    <div
                      key={it.label}
                      className="p-3 rounded-xl bg-gradient-to-br from-brand-50 to-water-50 border border-brand-100"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-brand-600 mb-1">
                        <Icon className="w-3.5 h-3.5" />
                        {it.label}
                      </div>
                      <div className="font-bold text-brand-900">{it.value}</div>
                    </div>
                  );
                })}
              </div>

              <div>
                <div className="text-[11px] text-brand-600 mb-1.5 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" /> 过滤设备
                </div>
                <div className="p-3 rounded-xl bg-white/60 border border-brand-100 text-sm text-brand-800">
                  {a.filter_type || "—"}
                </div>
              </div>

              <div>
                <div className="text-[11px] text-brand-600 mb-1.5">鱼粮类型</div>
                <div className="p-3 rounded-xl bg-water-50 border border-water-200 text-sm text-water-800 font-semibold">
                  🌿 {a.food_type}
                  {stock && (
                    <div className="mt-1 text-[11px] font-normal text-water-600">
                      库存 {stock.current_grams}g
                      {stockDays !== null && ` · 约撑 ${stockDays} 天`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h4 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
              <Fish className="w-5 h-5 text-water-600" />
              鱼种明细（共 {totalFish} 只）
            </h4>
            {a.fish_species.length === 0 ? (
              <div className="text-sm text-brand-500 py-4 text-center">
                暂无鱼种配置
              </div>
            ) : (
              <div className="space-y-2.5">
                {a.fish_species.map((f) => {
                  const total = f.count * f.daily_grams_per_fish;
                  const ratio = (f.count / Math.max(1, totalFish)) * 100;
                  return (
                    <div
                      key={f.id}
                      className="p-3 rounded-xl bg-white/60 border border-brand-100"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-brand-900 text-sm">
                          {f.species_name}
                        </span>
                        <span className="text-xs font-bold tabular-nums text-brand-700">
                          {f.count} 只
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-brand-100 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-water-500 to-brand-500 rounded-full"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <div className="mt-2 text-[11px] text-brand-600 flex justify-between">
                        <span>
                          {f.daily_grams_per_fish.toFixed(2)}g / 只 / 天
                        </span>
                        <span className="font-semibold text-brand-800">
                          合计 {total.toFixed(2)}g / 天
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-brand-800 to-water-700 text-white">
              <div className="text-xs opacity-80">每日建议总食量</div>
              <div className="font-display text-3xl font-bold tabular-nums mt-0.5">
                {dailyTotal.toFixed(2)}g
              </div>
              <div className="text-xs opacity-75 mt-1 flex gap-3">
                <span>
                  早晨{" "}
                  <span className="font-bold tabular-nums">
                    {(dailyTotal * a.morning_ratio).toFixed(2)}g
                  </span>
                </span>
                <span>
                  傍晚{" "}
                  <span className="font-bold tabular-nums">
                    {(dailyTotal * a.evening_ratio).toFixed(2)}g
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-water-600" />
                最近喂食记录
              </h4>
              <Link
                to={`/feeding?aquarium=${a.id}`}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                查看全部 →
              </Link>
            </div>
            {records.length === 0 ? (
              <div className="text-sm text-brand-500 py-10 text-center">
                还没有喂食记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[11px] text-brand-500 border-b border-brand-100">
                      <th className="text-left py-2.5 px-2">日期</th>
                      <th className="text-left py-2.5 px-2">时段</th>
                      <th className="text-left py-2.5 px-2">喂食人</th>
                      <th className="text-right py-2.5 px-2">份量</th>
                      <th className="text-left py-2.5 px-2">剩食</th>
                      <th className="text-left py-2.5 px-2">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-50">
                    {records.map((r) => {
                      const lo = leftoverMeta[r.leftover_level];
                      const fs = fishStatusMeta[r.fish_status];
                      return (
                        <tr key={r.id} className="hover:bg-brand-50/40 transition">
                          <td className="py-3 px-2">
                            <div className="font-semibold text-brand-800">
                              {formatDate(r.datetime, "M月d日")}
                            </div>
                            <div className="text-[11px] text-brand-500">
                              {formatTime(r.datetime)} ·{" "}
                              {weekdayName(r.datetime)}
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="chip bg-brand-50 text-brand-700">
                              {periodLabel[r.period]}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-brand-800">
                            👤 {r.feeder}
                          </td>
                          <td className="py-3 px-2 text-right font-bold tabular-nums text-brand-900">
                            {r.actual_grams.toFixed(1)}g
                          </td>
                          <td className="py-3 px-2">
                            <span className={`chip ${lo.bg} ${lo.color}`}>
                              {lo.label}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            <span className={`chip ${fs.bg} ${fs.color}`}>
                              {fs.emoji} {fs.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-5">
              <h4 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
                <Droplets className="w-5 h-5 text-sky-500" />
                最近换水
              </h4>
              {waterChanges.length === 0 ? (
                <div className="text-sm text-brand-500 py-8 text-center">
                  暂无换水记录
                </div>
              ) : (
                <div className="space-y-2">
                  {waterChanges.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-sky-50 to-brand-50 border border-sky-100"
                    >
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center">
                        💧
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-brand-800">
                          {formatDate(w.date)}
                        </div>
                        <div className="text-[11px] text-brand-600">
                          换水 {w.changed_liters}L · {w.changed_percent || 0}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to={`/water?aquarium=${a.id}`}
                className="block mt-4 text-xs font-semibold text-brand-700 hover:text-brand-900 text-right"
              >
                更多 →
              </Link>
            </div>

            <div className="glass-card p-5">
              <h4 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
                <Beaker className="w-5 h-5 text-purple-500" />
                最近水质检测
              </h4>
              {waterTests.length === 0 ? (
                <div className="text-sm text-brand-500 py-8 text-center">
                  暂无检测记录
                </div>
              ) : (
                <div className="space-y-2.5">
                  {waterTests.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-white/60 border border-brand-100"
                    >
                      <div className="flex justify-between text-xs mb-2">
                        <span className="font-semibold text-brand-800">
                          {formatDate(t.date)}
                        </span>
                        <span className="text-brand-500 tabular-nums">
                          pH {t.ph.toFixed(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-[11px]">
                        <div className="text-center p-1.5 rounded-lg bg-red-50 text-red-600 font-semibold tabular-nums">
                          NH₃ {t.ammonia?.toFixed(1)}
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-amber-50 text-amber-600 font-semibold tabular-nums">
                          NO₂ {t.nitrite?.toFixed(1)}
                        </div>
                        <div className="text-center p-1.5 rounded-lg bg-brand-50 text-brand-700 font-semibold tabular-nums">
                          NO₃ {t.nitrate}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <FeedingModal
        open={feedModal.open}
        onClose={() => setFeedModal({ open: false })}
        defaultAquariumId={feedModal.aqId}
        defaultPeriod={feedModal.period}
      />
    </div>
  );
}

export { AquariumForm };

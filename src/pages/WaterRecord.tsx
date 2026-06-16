import { useState } from "react";
import WaterStockForms from "@/components/water/WaterStockForms";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useWaterStore } from "@/store/useWaterStore";
import { useStockStore } from "@/store/useStockStore";
import {
  Droplets,
  Beaker,
  Package,
  Trash2,
  Plus,
  CalendarDays,
} from "lucide-react";
import { formatDate } from "@/utils/formatters";
import type { WaterChange, WaterTest, FoodStock } from "@/types";
import { calcStockDaysLeft, calcAvgDailyUsageByType } from "@/utils/alertChecker";

type Tab = "change" | "test" | "stock";

export default function WaterRecord() {
  const aquariums = useAquariumStore((s) => s.aquariums);
  const { getWaterChanges, removeWaterChange, getWaterTests, removeWaterTest } =
    useWaterStore();
  const { stocks, removeStock } = useStockStore();
  const [tab, setTab] = useState<Tab>("change");
  const [filter, setFilter] = useState<string>("all");

  const waterChanges = getWaterChanges(
    filter === "all" ? undefined : filter
  ).slice(0, 50);
  const waterTests = getWaterTests(filter === "all" ? undefined : filter).slice(
    0,
    50
  );

  const tabs: { key: Tab; label: string; icon: typeof Droplets; color: string }[] = [
    { key: "change", label: "换水记录", icon: Droplets, color: "from-sky-600 to-brand-600" },
    { key: "test", label: "水质检测", icon: Beaker, color: "from-purple-600 to-brand-600" },
    { key: "stock", label: "鱼粮库存", icon: Package, color: "from-coral-500 to-amber-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-slide-up">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-900">
            换水 · 水质 · 库存 🌊
          </h2>
          <p className="text-sm text-brand-600 mt-1">
            记录日常维护，跟踪水质变化
          </p>
        </div>
        {tab !== "stock" && (
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field !py-2.5 !w-auto"
          >
            <option value="all">全部鱼缸</option>
            {aquariums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <WaterStockForms defaultTab={tab} />

      <div className="flex border-b border-white/60">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 md:flex-none px-5 md:px-6 py-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
                active
                  ? `text-white bg-gradient-to-r ${t.color} border-transparent`
                  : "text-brand-600 hover:text-brand-900 border-transparent hover:bg-brand-50/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "change" && (
        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-sky-500" />
              换水记录
              <span className="text-xs font-normal text-brand-500">
                （显示最近 {waterChanges.length} 条）
              </span>
            </h3>
          </div>
          {waterChanges.length === 0 ? (
            <EmptyState emoji="💧" text="还没有换水记录" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {waterChanges.map((w, idx) => (
                <WaterChangeCard
                  key={w.id}
                  wc={w}
                  aq={aquariums.find((x) => x.id === w.aquarium_id)}
                  onDelete={() => removeWaterChange(w.id)}
                  delay={idx * 50}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "test" && (
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
            <Beaker className="w-5 h-5 text-purple-500" />
            水质检测记录
            <span className="text-xs font-normal text-brand-500">
              （显示最近 {waterTests.length} 条）
            </span>
          </h3>
          {waterTests.length === 0 ? (
            <EmptyState emoji="🧪" text="还没有水质检测记录" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[11px] text-brand-500 border-b border-brand-100">
                    <th className="text-left py-2.5 px-3">日期</th>
                    <th className="text-left py-2.5 px-3">鱼缸</th>
                    <th className="text-center py-2.5 px-3">pH</th>
                    <th className="text-center py-2.5 px-3">
                      氨氮
                      <div className="text-[9px] text-brand-400 font-normal">
                        NH₃
                      </div>
                    </th>
                    <th className="text-center py-2.5 px-3">
                      亚硝酸盐
                      <div className="text-[9px] text-brand-400 font-normal">
                        NO₂
                      </div>
                    </th>
                    <th className="text-center py-2.5 px-3">
                      硝酸盐
                      <div className="text-[9px] text-brand-400 font-normal">
                        NO₃
                      </div>
                    </th>
                    <th className="text-left py-2.5 px-3">备注</th>
                    <th className="py-2.5 px-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {waterTests.map((t) => {
                    const aq = aquariums.find((x) => x.id === t.aquarium_id);
                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-brand-50/40 transition animate-fade-slide-up"
                      >
                        <td className="py-3 px-3 font-semibold text-brand-800 whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        <td className="py-3 px-3 text-brand-800">
                          {aq?.name || "—"}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Chip
                            value={t.ph.toFixed(1)}
                            ok={t.ph >= 6.5 && t.ph <= 8}
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Chip
                            value={(t.ammonia ?? 0).toFixed(1)}
                            ok={(t.ammonia ?? 0) < 0.5}
                            danger={(t.ammonia ?? 0) >= 1}
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Chip
                            value={(t.nitrite ?? 0).toFixed(1)}
                            ok={(t.nitrite ?? 0) < 0.3}
                            danger={(t.nitrite ?? 0) >= 1}
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Chip
                            value={String(t.nitrate ?? 0)}
                            ok={(t.nitrate ?? 0) < 40}
                            danger={(t.nitrate ?? 0) >= 80}
                          />
                        </td>
                        <td className="py-3 px-3 text-xs text-brand-600 max-w-[180px] truncate">
                          {t.notes || "—"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => removeWaterTest(t.id)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {tab === "stock" && (
        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-coral-500" />
              鱼粮库存
            </h3>
          </div>
          {stocks.length === 0 ? (
            <EmptyState emoji="📦" text="暂无库存" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stocks.map((s, i) => (
                <StockCard
                  key={s.id}
                  stock={s}
                  delay={i * 60}
                  onDelete={() => removeStock(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Chip({
  value,
  ok,
  danger,
}: {
  value: string;
  ok?: boolean;
  danger?: boolean;
}) {
  const cls = danger
    ? "bg-red-100 text-red-700"
    : ok
    ? "bg-green-100 text-green-700"
    : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${cls}`}>
      {value}
    </span>
  );
}

function EmptyState({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="py-14 text-center">
      <div className="text-5xl mb-3">{emoji}</div>
      <div className="text-sm text-brand-500">{text}</div>
    </div>
  );
}

function WaterChangeCard({
  wc,
  aq,
  onDelete,
  delay,
}: {
  wc: WaterChange;
  aq: ReturnType<typeof useAquariumStore.getState>["aquariums"][0] | undefined;
  onDelete: () => void;
  delay: number;
}) {
  return (
    <div
      className="relative group overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-sky-50 to-brand-50 border border-sky-100 animate-fade-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-brand-500 text-white flex items-center justify-center shadow-md">
          <Droplets className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs text-brand-500">换水</div>
          <div className="font-bold text-brand-900">{aq?.name || "—"}</div>
        </div>
      </div>
      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-2xl font-display font-bold tabular-nums text-sky-700">
            {wc.changed_liters}
            <span className="text-sm font-normal ml-0.5">L</span>
          </div>
          <div className="text-[11px] text-brand-500">
            {wc.changed_percent ??
              Math.round(
                (wc.changed_liters / (aq?.size_liters || 1)) * 100
              )}
            % 水量
          </div>
        </div>
        <div className="text-xs text-brand-600 text-right">
          <div className="font-semibold">{formatDate(wc.date)}</div>
        </div>
      </div>
      {wc.notes && (
        <div className="mt-2 p-2.5 rounded-lg bg-white/60 text-xs text-brand-700 italic">
          "{wc.notes}"
        </div>
      )}
    </div>
  );
}

function StockCard({
  stock,
  delay,
  onDelete,
}: {
  stock: FoodStock;
  delay: number;
  onDelete: () => void;
}) {
  const avg = calcAvgDailyUsageByType();
  const daily = avg[stock.food_type] ?? 0;
  const daysLeft = calcStockDaysLeft(stock.food_type);
  const pct = Math.min(100, (stock.current_grams / 1000) * 100);
  const low = (daysLeft !== null && daysLeft <= 14) || stock.current_grams < 100;

  return (
    <div
      className={`relative group overflow-hidden rounded-2xl p-5 border animate-fade-slide-up ${
        low
          ? "bg-gradient-to-br from-red-50 to-coral-50 border-red-100"
          : "bg-gradient-to-br from-white/70 to-water-50 border-water-100"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-white/70 opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${
            low
              ? "bg-gradient-to-br from-red-500 to-coral-500"
              : "bg-gradient-to-br from-water-600 to-brand-600"
          } text-white`}
        >
          📦
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="font-bold text-brand-900 truncate">
            {stock.food_name}
          </div>
          <div className="text-[11px] text-brand-500">{stock.food_type}</div>
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-brand-600">当前库存</span>
          <span
            className={`tabular-nums ${
              low ? "text-red-600" : "text-brand-900"
            }`}
          >
            {stock.current_grams}g
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-white/70 overflow-hidden border border-white shadow-inner">
          <div
            className={`h-full rounded-full transition-all ${
              low
                ? "bg-gradient-to-r from-red-400 to-coral-400"
                : "bg-gradient-to-r from-water-500 to-brand-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="p-2.5 rounded-lg bg-white/70 text-xs">
          <div className="text-brand-500">日均消耗</div>
          <div className="font-bold tabular-nums text-brand-800 mt-0.5">
            {daily ? daily.toFixed(2) : "—"}g
          </div>
        </div>
        <div
          className={`p-2.5 rounded-lg text-xs ${
            low ? "bg-red-100/80" : "bg-water-100/70"
          }`}
        >
          <div className={low ? "text-red-600" : "text-water-700"}>
            还能维持
          </div>
          <div
            className={`font-bold tabular-nums mt-0.5 ${
              low ? "text-red-700" : "text-water-800"
            }`}
          >
            {daysLeft !== null ? `${daysLeft} 天` : "—"}
            {low && (
              <span className="ml-1 text-[9px]">⚠️ 补货</span>
            )}
          </div>
        </div>
      </div>
      {stock.last_purchase_date && (
        <div className="mt-3 pt-3 border-t border-brand-100/60 text-[11px] text-brand-500 flex justify-between">
          <span>上次采购</span>
          <span>{formatDate(stock.last_purchase_date)}</span>
        </div>
      )}
    </div>
  );
}

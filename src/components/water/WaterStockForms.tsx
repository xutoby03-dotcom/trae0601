import { useState } from "react";
import { useWaterStore } from "@/store/useWaterStore";
import { useStockStore } from "@/store/useStockStore";
import type { WaterChange, WaterTest, FoodStock } from "@/types";
import { todayStr } from "@/utils/formatters";
import { useAquariumStore } from "@/store/useAquariumStore";
import { Droplets, Beaker, PackagePlus } from "lucide-react";

type Tab = "change" | "test" | "stock";

interface Props {
  defaultTab?: Tab;
  defaultAquariumId?: string;
  onDone?: () => void;
  onClose?: () => void;
}

export default function WaterStockForms({
  defaultTab = "change",
  defaultAquariumId,
  onDone,
  onClose,
}: Props) {
  const aquariums = useAquariumStore((s) => s.aquariums);
  const addWaterChange = useWaterStore((s) => s.addWaterChange);
  const addWaterTest = useWaterStore((s) => s.addWaterTest);
  const addStock = useStockStore((s) => s.addStock);
  const addStockQuantity = useStockStore((s) => s.addStockQuantity);
  const stocks = useStockStore((s) => s.stocks);

  const [tab, setTab] = useState<Tab>(defaultTab);
  const [aqId, setAqId] = useState(defaultAquariumId || aquariums[0]?.id || "");

  const [wc, setWc] = useState<Omit<WaterChange, "id">>({
    aquarium_id: defaultAquariumId || aquariums[0]?.id || "",
    date: todayStr(),
    changed_liters: 0,
    changed_percent: 30,
    notes: "",
  });

  const [wt, setWt] = useState<Omit<WaterTest, "id">>({
    aquarium_id: defaultAquariumId || aquariums[0]?.id || "",
    date: todayStr(),
    ph: 7,
    ammonia: 0,
    nitrite: 0,
    nitrate: 10,
    notes: "",
  });

  const [stockMode, setStockMode] = useState<"add" | "create">("add");
  const [existingStockId, setExistingStockId] = useState(stocks[0]?.id || "");
  const [stockAddGrams, setStockAddGrams] = useState<number>(100);
  const [newStock, setNewStock] = useState<Omit<FoodStock, "id">>({
    food_name: "",
    food_type: "",
    current_grams: 0,
    last_purchase_date: todayStr(),
    notes: "",
  });

  const handleWC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wc.aquarium_id) return;
    addWaterChange({
      ...wc,
      changed_percent:
        wc.changed_percent ||
        Math.round(
          (wc.changed_liters /
            (aquariums.find((x) => x.id === wc.aquarium_id)?.size_liters || 1)) *
            100
        ),
    });
    onDone?.();
  };

  const handleWT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wt.aquarium_id) return;
    addWaterTest(wt);
    onDone?.();
  };

  const handleStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockMode === "add" && existingStockId) {
      addStockQuantity(existingStockId, stockAddGrams);
    } else if (stockMode === "create" && newStock.food_name) {
      addStock(newStock);
    }
    onDone?.();
  };

  const currentAq = aquariums.find((x) => x.id === aqId);

  const tabs: { key: Tab; label: string; icon: typeof Droplets; color: string }[] = [
    { key: "change", label: "换水", icon: Droplets, color: "from-brand-600 to-water-500" },
    { key: "test", label: "水质检测", icon: Beaker, color: "from-purple-600 to-brand-600" },
    { key: "stock", label: "鱼粮入库", icon: PackagePlus, color: "from-coral-500 to-amber-500" },
  ];

  return (
    <div className="glass-card overflow-hidden animate-fade-slide-up">
      <div className="flex border-b border-white/60">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-4 px-3 md:px-5 text-sm font-semibold flex items-center justify-center gap-2 transition ${
                active
                  ? `text-white bg-gradient-to-r ${t.color}`
                  : "text-brand-600 hover:text-brand-900 hover:bg-brand-50/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-5 md:p-6">
        {tab === "change" && (
          <form onSubmit={handleWC} className="space-y-4 md:grid md:grid-cols-2 md:gap-5">
            <div>
              <label className="label-field">鱼缸</label>
              <select
                value={wc.aquarium_id}
                onChange={(e) => setWc({ ...wc, aquarium_id: e.target.value })}
                className="input-field"
                required
              >
                {aquariums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">日期</label>
              <input
                type="date"
                value={wc.date}
                onChange={(e) => setWc({ ...wc, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">换水量（升）</label>
              <input
                type="number"
                min={0}
                value={wc.changed_liters}
                onChange={(e) => {
                  const l = parseFloat(e.target.value) || 0;
                  setWc({
                    ...wc,
                    changed_liters: l,
                    changed_percent: currentAq
                      ? Math.round((l / currentAq.size_liters) * 100)
                      : wc.changed_percent,
                  });
                }}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-field">
                换水比例（%）
                {currentAq && (
                  <span className="ml-2 text-brand-500 font-normal">
                    容量 {currentAq.size_liters}L
                  </span>
                )}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={wc.changed_percent}
                onChange={(e) =>
                  setWc({
                    ...wc,
                    changed_percent: parseFloat(e.target.value) || 0,
                  })
                }
                className="input-field"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">备注（选填）</label>
              <input
                value={wc.notes}
                onChange={(e) => setWc({ ...wc, notes: e.target.value })}
                placeholder="例如：添加硝化细菌、清洗滤材等"
                className="input-field"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              {onClose && (
                <button type="button" onClick={onClose} className="btn-outline">
                  取消
                </button>
              )}
              <button type="submit" className="btn-primary">
                <Droplets className="w-4 h-4" /> 记录换水
              </button>
            </div>
          </form>
        )}

        {tab === "test" && (
          <form onSubmit={handleWT} className="space-y-4 md:grid md:grid-cols-2 md:gap-5">
            <div>
              <label className="label-field">鱼缸</label>
              <select
                value={wt.aquarium_id}
                onChange={(e) => setWt({ ...wt, aquarium_id: e.target.value })}
                className="input-field"
                required
              >
                {aquariums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">检测日期</label>
              <input
                type="date"
                value={wt.date}
                onChange={(e) => setWt({ ...wt, date: e.target.value })}
                className="input-field"
              />
            </div>
            {[
              { k: "ph", label: "pH 值", min: 5, max: 9, step: 0.1 },
              { k: "ammonia", label: "氨氮 NH₃", min: 0, max: 5, step: 0.1 },
              { k: "nitrite", label: "亚硝酸盐 NO₂", min: 0, max: 5, step: 0.1 },
              { k: "nitrate", label: "硝酸盐 NO₃", min: 0, max: 200, step: 1 },
            ].map((p) => (
              <div key={p.k}>
                <label className="label-field">{p.label}</label>
                <input
                  type="number"
                  step={p.step}
                  min={p.min}
                  max={p.max}
                  value={(wt as any)[p.k]}
                  onChange={(e) =>
                    setWt({
                      ...wt,
                      [p.k]: parseFloat(e.target.value) || 0,
                    } as any)
                  }
                  className="input-field"
                />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="label-field">备注（选填）</label>
              <input
                value={wt.notes}
                onChange={(e) => setWt({ ...wt, notes: e.target.value })}
                className="input-field"
                placeholder="如检测试剂、观察到的异常等"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              {onClose && (
                <button type="button" onClick={onClose} className="btn-outline">
                  取消
                </button>
              )}
              <button type="submit" className="btn-water">
                <Beaker className="w-4 h-4" /> 保存检测
              </button>
            </div>
          </form>
        )}

        {tab === "stock" && (
          <form onSubmit={handleStock} className="space-y-4 md:grid md:grid-cols-2 md:gap-5">
            <div className="md:col-span-2 flex gap-2 p-1 rounded-xl bg-brand-50/80 border border-brand-100">
              <button
                type="button"
                onClick={() => setStockMode("add")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  stockMode === "add"
                    ? "bg-white shadow text-brand-800"
                    : "text-brand-600"
                }`}
              >
                补充现有库存
              </button>
              <button
                type="button"
                onClick={() => setStockMode("create")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  stockMode === "create"
                    ? "bg-white shadow text-brand-800"
                    : "text-brand-600"
                }`}
              >
                新增鱼粮品类
              </button>
            </div>

            {stockMode === "add" ? (
              <>
                <div className="md:col-span-2">
                  <label className="label-field">选择鱼粮</label>
                  <select
                    value={existingStockId}
                    onChange={(e) => setExistingStockId(e.target.value)}
                    className="input-field"
                    required
                  >
                    {stocks.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.food_name}（剩余 {s.current_grams}g）
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">入库数量（克）</label>
                  <input
                    type="number"
                    min={0}
                    value={stockAddGrams}
                    onChange={(e) =>
                      setStockAddGrams(parseFloat(e.target.value) || 0)
                    }
                    className="input-field text-lg font-bold"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <label className="label-field">鱼粮名称 *</label>
                  <input
                    value={newStock.food_name}
                    onChange={(e) =>
                      setNewStock({ ...newStock, food_name: e.target.value })
                    }
                    placeholder="例如：德彩热带鱼颗粒粮"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">鱼粮类型</label>
                  <input
                    value={newStock.food_type}
                    onChange={(e) =>
                      setNewStock({ ...newStock, food_type: e.target.value })
                    }
                    placeholder="与鱼缸配置的 food_type 对应"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">初始克数</label>
                  <input
                    type="number"
                    min={0}
                    value={newStock.current_grams}
                    onChange={(e) =>
                      setNewStock({
                        ...newStock,
                        current_grams: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field"
                  />
                </div>
              </>
            )}

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              {onClose && (
                <button type="button" onClick={onClose} className="btn-outline">
                  取消
                </button>
              )}
              <button type="submit" className="btn-water">
                <PackagePlus className="w-4 h-4" /> 保存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

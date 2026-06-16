import { useEffect, useState } from "react";
import type { Aquarium, FishSpecies } from "@/types";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft, ImagePlus } from "lucide-react";
import { uid } from "@/utils/formatters";

interface Form {
  name: string;
  size_liters: number;
  water_temp: number;
  filter_type: string;
  photo_url: string;
  food_type: string;
  morning_ratio: number;
  evening_ratio: number;
  fish_species: FishSpecies[];
}

const emptyFish = (): FishSpecies => ({
  id: uid(),
  species_name: "",
  count: 1,
  daily_grams_per_fish: 0.1,
  notes: "",
});

export default function AquariumForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addAquarium = useAquariumStore((s) => s.addAquarium);
  const updateAquarium = useAquariumStore((s) => s.updateAquarium);
  const existing = useAquariumStore((s) =>
    id ? s.aquariums.find((a) => a.id === id) : undefined
  );

  const isEdit = !!existing;

  const [form, setForm] = useState<Form>({
    name: "",
    size_liters: 60,
    water_temp: 25,
    filter_type: "",
    photo_url: "",
    food_type: "",
    morning_ratio: 0.6,
    evening_ratio: 0.4,
    fish_species: [emptyFish()],
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        size_liters: existing.size_liters,
        water_temp: existing.water_temp,
        filter_type: existing.filter_type,
        photo_url: existing.photo_url || "",
        food_type: existing.food_type,
        morning_ratio: existing.morning_ratio,
        evening_ratio: existing.evening_ratio,
        fish_species: existing.fish_species.length
          ? existing.fish_species
          : [emptyFish()],
      });
    }
  }, [existing]);

  const update = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const updateFish = (fid: string, patch: Partial<FishSpecies>) =>
    setForm((s) => ({
      ...s,
      fish_species: s.fish_species.map((f) =>
        f.id === fid ? { ...f, ...patch } : f
      ),
    }));

  const addFish = () =>
    setForm((s) => ({ ...s, fish_species: [...s.fish_species, emptyFish()] }));

  const removeFish = (fid: string) =>
    setForm((s) => ({
      ...s,
      fish_species:
        s.fish_species.length > 1
          ? s.fish_species.filter((f) => f.id !== fid)
          : [emptyFish()],
    }));

  const updateRatio = (period: "morning" | "evening", value: number) => {
    const v = Math.max(0.1, Math.min(0.9, value));
    if (period === "morning") {
      update("morning_ratio", v);
      update("evening_ratio", Math.round((1 - v) * 100) / 100);
    } else {
      update("evening_ratio", v);
      update("morning_ratio", Math.round((1 - v) * 100) / 100);
    }
  };

  const dailyTotal = form.fish_species.reduce(
    (s, f) => s + (f.species_name ? f.count * f.daily_grams_per_fish : 0),
    0
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const cleaned: Form = {
      ...form,
      fish_species: form.fish_species.filter((f) => f.species_name.trim()),
    };
    if (isEdit && existing) {
      updateAquarium(existing.id, cleaned);
    } else {
      addAquarium(cleaned);
    }
    navigate("/aquariums");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-slide-up">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost !p-2.5"
          title="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="text-xs text-brand-600">
            {isEdit ? "编辑鱼缸档案" : "新增鱼缸档案"}
          </div>
          <h2 className="font-display text-2xl font-bold text-brand-900">
            {isEdit ? form.name || "鱼缸档案" : "添加一个新的鱼缸 🐟"}
          </h2>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="glass-card p-5">
              <div className="label-field">鱼缸照片</div>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-600/20 to-water-500/20 border-2 border-dashed border-brand-200 flex items-center justify-center group">
                {form.photo_url ? (
                  <>
                    <img
                      src={form.photo_url}
                      alt="鱼缸"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => update("photo_url", "")}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center text-brand-500">
                    <ImagePlus className="w-10 h-10 mx-auto mb-2 opacity-60" />
                    <div className="text-xs">暂无照片</div>
                  </div>
                )}
              </div>
              <input
                type="url"
                value={form.photo_url}
                onChange={(e) => update("photo_url", e.target.value)}
                placeholder="粘贴图片URL（可选）"
                className="input-field mt-3 text-xs"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-5 md:p-6 space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label-field">鱼缸名称 *</label>
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="例如：客厅大鱼缸"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label-field">水容量（升）</label>
                  <input
                    type="number"
                    min={1}
                    value={form.size_liters}
                    onChange={(e) =>
                      update("size_liters", parseFloat(e.target.value) || 0)
                    }
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-field">水温（℃）</label>
                  <input
                    type="number"
                    step="0.5"
                    value={form.water_temp}
                    onChange={(e) =>
                      update("water_temp", parseFloat(e.target.value) || 0)
                    }
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">过滤设备</label>
                  <input
                    value={form.filter_type}
                    onChange={(e) => update("filter_type", e.target.value)}
                    placeholder="例如：外置过滤桶 + 充氧泵"
                    className="input-field"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label-field">鱼粮类型</label>
                  <input
                    value={form.food_type}
                    onChange={(e) => update("food_type", e.target.value)}
                    placeholder="例如：颗粒型热带鱼粮"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="glass-card p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-bold text-brand-900">
                  鱼种配置
                </h4>
                <button
                  type="button"
                  onClick={addFish}
                  className="btn-outline !py-2 !px-3 !text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加鱼种
                </button>
              </div>

              <div className="space-y-3">
                {form.fish_species.map((f, idx) => (
                  <div
                    key={f.id}
                    className="grid grid-cols-12 gap-2 md:gap-3 p-3 rounded-xl bg-white/60 border border-brand-100"
                  >
                    <div className="col-span-5 md:col-span-5">
                      <label className="text-[10px] text-brand-600 font-semibold">
                        名称
                      </label>
                      <input
                        value={f.species_name}
                        onChange={(e) =>
                          updateFish(f.id, { species_name: e.target.value })
                        }
                        placeholder={`鱼/虾 ${idx + 1}`}
                        className="input-field !py-2 text-xs mt-1"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <label className="text-[10px] text-brand-600 font-semibold">
                        数量
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={f.count}
                        onChange={(e) =>
                          updateFish(f.id, {
                            count: parseInt(e.target.value) || 0,
                          })
                        }
                        className="input-field !py-2 text-xs mt-1 tabular-nums"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-3">
                      <label className="text-[10px] text-brand-600 font-semibold">
                        每只克数/天
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={f.daily_grams_per_fish}
                        onChange={(e) =>
                          updateFish(f.id, {
                            daily_grams_per_fish:
                              parseFloat(e.target.value) || 0,
                          })
                        }
                        className="input-field !py-2 text-xs mt-1 tabular-nums"
                      />
                    </div>
                    <div className="col-span-2 md:col-span-2 flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removeFish(f.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-brand-50 to-water-50 border border-brand-100">
                <div className="text-xs text-brand-600">每日建议总食量</div>
                <div className="text-2xl font-display font-bold text-brand-900 mt-0.5 tabular-nums">
                  {dailyTotal.toFixed(2)}g / 天
                </div>
                <div className="mt-3 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-brand-700 mb-1.5">
                      <span>早晨比例</span>
                      <span className="font-semibold tabular-nums">
                        {(form.morning_ratio * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={form.morning_ratio}
                      onChange={(e) =>
                        updateRatio("morning", parseFloat(e.target.value))
                      }
                      className="w-full accent-brand-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs text-brand-700">
                    <div className="p-2.5 rounded-lg bg-white/70">
                      早晨建议{" "}
                      <span className="font-bold tabular-nums text-brand-900">
                        {(dailyTotal * form.morning_ratio).toFixed(2)}g
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/70">
                      傍晚建议{" "}
                      <span className="font-bold tabular-nums text-brand-900">
                        {(dailyTotal * form.evening_ratio).toFixed(2)}g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end sticky bottom-4 z-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline"
          >
            取消
          </button>
          <button type="submit" className="btn-primary">
            <Save className="w-4 h-4" />
            {isEdit ? "保存修改" : "创建档案"}
          </button>
        </div>
      </form>
    </div>
  );
}

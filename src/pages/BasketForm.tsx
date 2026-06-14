import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Camera,
  Tag,
  Ruler,
  MapPin,
  Scale,
  Palette,
  Box,
  Star,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import type { BasketSize, BasketStatus } from "@/types";
import { BASKET_COLORS, LOCATIONS } from "@/types";
import { sizeLoadMap } from "@/utils/format";
import { BASKET_PLACEHOLDER_IMG } from "@/data/mockData";

export default function BasketForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const baskets = useStore((s) => s.baskets);
  const addBasket = useStore((s) => s.addBasket);
  const updateBasket = useStore((s) => s.updateBasket);

  const existing = isEdit ? baskets.find((b) => b.id === id) : null;

  const [code, setCode] = useState(existing?.code || "");
  const [size, setSize] = useState<BasketSize>(existing?.size || "M");
  const [colorName, setColorName] = useState(existing?.color || "深海蓝");
  const [colorHex, setColorHex] = useState(existing?.colorHex || "#1e3a5f");
  const [defaultLocation, setDefaultLocation] = useState(
    existing?.defaultLocation || LOCATIONS[0]
  );
  const [maxLoadKg, setMaxLoadKg] = useState(existing?.maxLoadKg || 15);
  const [status, setStatus] = useState<BasketStatus>(existing?.status || "available");
  const [hasValuableTag, setHasValuableTag] = useState(existing?.hasValuableTag || false);
  const [photoUrl, setPhotoUrl] = useState(existing?.photoUrl || "");
  const [previewColor, setPreviewColor] = useState(existing?.color || "深海蓝");

  useEffect(() => {
    const match = BASKET_COLORS.find((c) => c.name === colorName);
    if (match) setColorHex(match.hex);
  }, [colorName]);

  useEffect(() => {
    setMaxLoadKg(sizeLoadMap[size]);
  }, [size]);

  const sizes: BasketSize[] = ["S", "M", "L", "XL"];
  const statuses: BasketStatus[] = ["available", "lent", "repair", "scrapped"];
  const statusLabels: Record<BasketStatus, string> = {
    available: "可用",
    lent: "借出中",
    repair: "维修中",
    scrapped: "已报废",
  };

  const previewPhoto =
    photoUrl || BASKET_PLACEHOLDER_IMG(previewColor, sizeLabelText(size));

  function sizeLabelText(s: BasketSize) {
    return s === "S"
      ? "small"
      : s === "M"
      ? "medium"
      : s === "L"
      ? "large"
      : "extra large";
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("请填写篮子编号");
      return;
    }
    const payload = {
      code: code.trim(),
      size,
      color: colorName,
      colorHex,
      defaultLocation,
      maxLoadKg,
      status,
      photoUrl: previewPhoto,
      hasValuableTag,
    };
    if (isEdit && existing) {
      updateBasket(existing.id, payload);
    } else {
      addBasket(payload);
    }
    navigate("/baskets");
  };

  return (
    <div className="animate-slide-up max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <Link
          to="/baskets"
          className="p-2 rounded-md hover:bg-white hover:shadow-card transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-slate2-600" />
        </Link>
        <div>
          <h2 className="font-display font-bold text-xl text-slate2-800">
            {isEdit ? "编辑储物篮档案" : "新增储物篮档案"}
          </h2>
          <p className="text-xs text-slate2-400 mt-0.5">
            {isEdit ? `修改档案 #${existing?.code}` : "录入新篮子的基础信息"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1 card p-5 space-y-4 sticky top-24 h-fit">
          <div>
            <label className="label-base flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              篮子照片
            </label>
            <div
              className="aspect-[4/3] rounded-lg border-2 border-dashed border-slate2-200 bg-slate2-50 overflow-hidden relative"
              style={{ background: colorHex + "10" }}
            >
              <img
                src={previewPhoto}
                alt="预览"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0.4";
                }}
              />
              <div className="absolute inset-0 bg-grid-texture bg-grid-20 opacity-40 pointer-events-none" />
              <div
                className="absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-white shadow-md"
                style={{ background: colorHex }}
              />
            </div>
            <input
              type="text"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="输入图片URL（可选，留空使用默认图）"
              className="input-base mt-3 text-xs"
            />
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate2-100">
            {BASKET_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setColorName(c.name);
                  setPreviewColor(c.name);
                }}
                title={c.name}
                className={`aspect-square rounded-md border-2 transition-all relative ${
                  previewColor === c.name
                    ? "border-steel-500 scale-110 shadow-md"
                    : "border-slate2-200 hover:border-slate2-300"
                }`}
                style={{ background: c.hex }}
              >
                {previewColor === c.name && (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate2-400 text-center">
            已选：<b className="text-slate2-600">{previewColor}</b>
          </p>
        </div>

        <div className="lg:col-span-2 card p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label-base flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                篮子编号 <span className="text-signal-500">*</span>
              </label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="如 STB-2024-016"
                className="input-base font-mono"
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" />
                尺寸规格
              </label>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`py-2.5 rounded-md text-sm font-mono font-bold transition-all border-2 ${
                      size === s
                        ? "bg-steel-600 border-steel-600 text-white shadow-industrial"
                        : "bg-white border-slate2-200 text-slate2-600 hover:border-steel-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate2-400 mt-1.5">
                S ≤8kg · M ≤15kg · L ≤25kg · XL ≤40kg
              </p>
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                最大承重 (kg)
              </label>
              <input
                type="number"
                min={1}
                value={maxLoadKg}
                onChange={(e) => setMaxLoadKg(Number(e.target.value))}
                className="input-base font-mono"
              />
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5" />
                颜色名称
              </label>
              <select
                value={colorName}
                onChange={(e) => {
                  setColorName(e.target.value);
                  setPreviewColor(e.target.value);
                }}
                className="input-base"
              >
                {BASKET_COLORS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                默认存放点
              </label>
              <select
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
                className="input-base"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5" />
                当前状态
              </label>
              <div className="grid grid-cols-2 gap-2">
                {statuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`py-2 rounded-md text-xs font-semibold transition-all border ${
                      status === st
                        ? "bg-steel-600 border-steel-600 text-white"
                        : "bg-white border-slate2-200 text-slate2-600 hover:border-steel-300"
                    }`}
                  >
                    {statusLabels[st]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/50">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasValuableTag}
                onChange={(e) => setHasValuableTag(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate2-300 text-amber-500 focus:ring-amber-400"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  贵重物品专用标记
                </div>
                <p className="text-xs text-amber-700/80 mt-0.5">
                  勾选后该篮子会特别标记，用于存放贵重物品，借出和归还时需重点核验
                </p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate2-100">
            <Link to="/baskets" className="btn-secondary">
              取消
            </Link>
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              {isEdit ? "保存修改" : "录入档案"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Image } from "lucide-react";
import { useStore } from "@/store";
import { CATEGORIES, STORAGE_BOXES } from "@/data/constants";
import type { EquipmentCategory, EquipmentStatus } from "@/types";

interface FormData {
  code: string;
  name: string;
  category: EquipmentCategory;
  brand: string;
  purchaseDate: string;
  storageBox: string;
  storageBoxCustom: string;
  photo: string;
  batteryLevel: number;
  notes: string;
}

const DEFAULT_FORM: FormData = {
  code: "",
  name: "",
  category: "tent",
  brand: "",
  purchaseDate: "",
  storageBox: STORAGE_BOXES[0],
  storageBoxCustom: "",
  photo: "",
  batteryLevel: 100,
  notes: "",
};

export default function EquipmentForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id !== undefined && id !== "new";

  const { addEquipment, updateEquipment, getEquipment } = useStore();
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const equipment = getEquipment(id);
      if (equipment) {
        const isCustomBox = !STORAGE_BOXES.includes(equipment.storageBox);
        setForm({
          code: equipment.code,
          name: equipment.name,
          category: equipment.category,
          brand: equipment.brand || "",
          purchaseDate: equipment.purchaseDate || "",
          storageBox: isCustomBox ? "custom" : equipment.storageBox,
          storageBoxCustom: isCustomBox ? equipment.storageBox : "",
          photo: equipment.photo || "",
          batteryLevel: equipment.batteryLevel ?? 100,
          notes: equipment.notes || "",
        });
      }
    }
  }, [isEdit, id, getEquipment]);

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = "请输入装备编号";
    if (!form.name.trim()) next.name = "请输入装备名称";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const actualStorageBox =
      form.storageBox === "custom" ? form.storageBoxCustom.trim() : form.storageBox;

    const data = {
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || undefined,
      purchaseDate: form.purchaseDate || "",
      storageBox: actualStorageBox || STORAGE_BOXES[0],
      photo: form.photo.trim() || undefined,
      notes: form.notes.trim() || undefined,
      batteryLevel: form.category === "lighting" ? form.batteryLevel : undefined,
      status: "available" as EquipmentStatus,
    };

    if (isEdit && id) {
      updateEquipment(id, data);
    } else {
      addEquipment(data);
    }
    navigate("/equipment");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/equipment"
          className="btn btn-ghost !p-2.5"
          aria-label="返回"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-900">
            {isEdit ? "编辑装备" : "新增装备"}
          </h1>
          <p className="text-forest-600 mt-1">
            {isEdit ? "修改装备的档案信息" : "添加一件新的露营装备到档案"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">
              装备编号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.code}
              onChange={(e) => setField("code", e.target.value)}
              placeholder="如：TENT-001"
              className={`input ${errors.code ? "border-red-400 focus:ring-red-400" : ""}`}
            />
            {errors.code && (
              <p className="text-xs text-red-500 mt-1">{errors.code}</p>
            )}
          </div>
          <div>
            <label className="label">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="如：MSR Hubba Hubba"
              className={`input ${errors.name ? "border-red-400 focus:ring-red-400" : ""}`}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">类别</label>
            <select
              value={form.category}
              onChange={(e) =>
                setField("category", e.target.value as EquipmentCategory)
              }
              className="input"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.emoji} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">品牌</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setField("brand", e.target.value)}
              placeholder="如：MSR、Naturehike"
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">购买日期</label>
            <input
              type="date"
              value={form.purchaseDate}
              onChange={(e) => setField("purchaseDate", e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">存放箱</label>
            <select
              value={form.storageBox}
              onChange={(e) => setField("storageBox", e.target.value)}
              className="input mb-2"
            >
              {STORAGE_BOXES.map((box) => (
                <option key={box} value={box}>
                  {box}
                </option>
              ))}
              <option value="custom">✏️ 自定义...</option>
            </select>
            {form.storageBox === "custom" && (
              <input
                type="text"
                value={form.storageBoxCustom}
                onChange={(e) => setField("storageBoxCustom", e.target.value)}
                placeholder="输入自定义存放箱名称"
                className="input"
              />
            )}
          </div>
        </div>

        <div>
          <label className="label">
            <Image className="w-4 h-4 inline mr-1" />
            照片 URL
          </label>
          <input
            type="text"
            value={form.photo}
            onChange={(e) => setField("photo", e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="input mb-3"
          />
          {form.photo.trim() && (
            <div className="relative rounded-xl overflow-hidden border border-forest-200 bg-forest-50 h-48">
              <img
                src={form.photo}
                alt="预览"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  const parent = (e.target as HTMLImageElement)
                    .parentElement as HTMLDivElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="flex flex-col items-center justify-center h-full text-forest-500"><span class="text-4xl mb-2">🖼️</span><span class="text-sm">图片加载失败，请检查 URL</span></div>';
                  }
                }}
              />
            </div>
          )}
        </div>

        {form.category === "lighting" && (
          <div>
            <label className="label">
              电池电量：<span className="font-semibold">{form.batteryLevel}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={form.batteryLevel}
              onChange={(e) => setField("batteryLevel", Number(e.target.value))}
              className="w-full h-2 bg-forest-100 rounded-lg appearance-none cursor-pointer accent-forest-700"
            />
            <div className="flex justify-between text-xs text-forest-500 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        <div>
          <label className="label">备注</label>
          <textarea
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="记录装备的特殊说明、使用注意事项等..."
            rows={4}
            className="input resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-forest-100">
          <button
            type="button"
            onClick={() => navigate("/equipment")}
            className="btn btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="btn btn-primary">
            <Save className="w-4 h-4" />
            {isEdit ? "保存修改" : "创建装备"}
          </button>
        </div>
      </form>
    </div>
  );
}

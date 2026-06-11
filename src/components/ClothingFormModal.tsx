import { useState, useEffect } from "react";
import { X, Upload, Camera } from "lucide-react";
import type {
  Clothing,
  ColorCategory,
  MaterialCategory,
  ClothingCategory,
} from "@/types";
import {
  MATERIAL_LABELS,
  COLOR_CATEGORY_LABELS,
  CATEGORY_LABELS,
  CATEGORY_EMOJIS,
} from "@/types";
import { useStore } from "@/store/useStore";

interface ClothingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingClothing?: Clothing | null;
}

const PRESET_COLORS: { name: string; category: ColorCategory; hex: string }[] = [
  { name: "白色", category: "light", hex: "#FAFAFA" },
  { name: "米白", category: "light", hex: "#F5F5DC" },
  { name: "浅粉", category: "light", hex: "#FFC0CB" },
  { name: "浅蓝", category: "light", hex: "#ADD8E6" },
  { name: "灰色", category: "medium", hex: "#808080" },
  { name: "紫色", category: "medium", hex: "#9370DB" },
  { name: "蓝色", category: "medium", hex: "#4169E1" },
  { name: "绿色", category: "medium", hex: "#32CD32" },
  { name: "黑色", category: "dark", hex: "#212121" },
  { name: "深蓝", category: "dark", hex: "#00008B" },
  { name: "红色", category: "dark", hex: "#DC143C" },
  { name: "棕色", category: "dark", hex: "#8B4513" },
];

export default function ClothingFormModal({
  isOpen,
  onClose,
  editingClothing,
}: ClothingFormModalProps) {
  const members = useStore((s) => s.members);
  const addClothing = useStore((s) => s.addClothing);
  const updateClothing = useStore((s) => s.updateClothing);

  const [formData, setFormData] = useState({
    name: "",
    color: "白色",
    colorCategory: "light" as ColorCategory,
    material: "cotton" as MaterialCategory,
    colorfast: false,
    suggestedTemp: 30,
    memberId: members[0]?.id || "",
    photoUrl: "",
    category: "top" as ClothingCategory,
  });

  const [imgPreview, setImgPreview] = useState("");

  useEffect(() => {
    if (editingClothing) {
      setFormData({
        name: editingClothing.name,
        color: editingClothing.color,
        colorCategory: editingClothing.colorCategory,
        material: editingClothing.material,
        colorfast: editingClothing.colorfast,
        suggestedTemp: editingClothing.suggestedTemp,
        memberId: editingClothing.memberId,
        photoUrl: editingClothing.photoUrl,
        category: editingClothing.category,
      });
      setImgPreview(editingClothing.photoUrl);
    } else {
      resetForm();
    }
  }, [editingClothing, isOpen]);

  const resetForm = () => {
    setFormData({
      name: "",
      color: "白色",
      colorCategory: "light",
      material: "cotton",
      colorfast: false,
      suggestedTemp: 30,
      memberId: members[0]?.id || "",
      photoUrl: "",
      category: "top",
    });
    setImgPreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const finalPhotoUrl =
      formData.photoUrl ||
      `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
        `${formData.color} ${MATERIAL_LABELS[formData.material]} ${
          CATEGORY_LABELS[formData.category]
        } clothing on white background product photo`
      )}&image_size=square`;

    if (editingClothing) {
      updateClothing(editingClothing.id, { ...formData, photoUrl: finalPhotoUrl });
    } else {
      addClothing({ ...formData, photoUrl: finalPhotoUrl });
    }
    onClose();
    resetForm();
  };

  const handleColorSelect = (color: { name: string; category: ColorCategory; hex: string }) => {
    setFormData((prev) => ({
      ...prev,
      color: color.name,
      colorCategory: color.category,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImgPreview(result);
        setFormData((prev) => ({ ...prev, photoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-elevated scrollbar-thin">
        <div className="sticky top-0 flex items-center justify-between border-b border-neutral-100 bg-white/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-xl font-bold text-neutral-800">
            {editingClothing ? "编辑衣物" : "添加新衣物"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-5">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                衣物照片
              </label>
              <div className="relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50/50">
                {imgPreview ? (
                  <img
                    src={imgPreview}
                    alt="预览"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-primary-400">
                    <Camera className="h-12 w-12" />
                    <span className="text-sm">照片预览</span>
                  </div>
                )}
                <label className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-full bg-primary-500 px-3 py-1.5 text-xs font-medium text-white shadow-card transition-all hover:bg-primary-600">
                  <Upload className="h-3.5 w-3.5" />
                  上传
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                不上传将自动生成示意图
              </p>
            </div>

            <div className="space-y-4 md:col-span-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  衣物名称 <span className="text-accent-danger">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="例如：白色纯棉T恤"
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  衣物类型
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.keys(CATEGORY_LABELS) as ClothingCategory[]).map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, category: cat }))
                        }
                        className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-xs transition-all ${
                          formData.category === cat
                            ? "border-primary-400 bg-primary-50 text-primary-700"
                            : "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300"
                        }`}
                      >
                        <span className="text-lg">{CATEGORY_EMOJIS[cat]}</span>
                        {CATEGORY_LABELS[cat]}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                  颜色
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => handleColorSelect(color)}
                      title={`${color.name} - ${COLOR_CATEGORY_LABELS[color.category]}`}
                      className={`aspect-square rounded-full border-2 transition-all hover:scale-110 ${
                        formData.color === color.name
                          ? "border-primary-500 ring-2 ring-primary-200"
                          : "border-white shadow-soft"
                      }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-neutral-500">
                  已选：<span className="font-medium text-neutral-700">{formData.color}</span>
                  （{COLOR_CATEGORY_LABELS[formData.colorCategory]}）
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                材质
              </label>
              <select
                value={formData.material}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    material: e.target.value as MaterialCategory,
                  }))
                }
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                {(Object.keys(MATERIAL_LABELS) as MaterialCategory[]).map(
                  (m) => (
                    <option key={m} value={m}>
                      {MATERIAL_LABELS[m]}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                所属成员
              </label>
              <select
                value={formData.memberId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, memberId: e.target.value }))
                }
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm transition-all focus:border-primary-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.avatar} {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                建议水温：
                <span className="font-bold text-primary-600">
                  {formData.suggestedTemp}°C
                </span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={formData.suggestedTemp}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    suggestedTemp: Number(e.target.value),
                  }))
                }
                className="w-full accent-primary-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
                <span>冷水 10°</span>
                <span>温水 40°</span>
                <span>热水 90°</span>
              </div>
            </div>

            <div className="flex items-end">
              <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 transition-all hover:bg-neutral-100">
                <span className="text-sm font-medium text-neutral-700">
                  这件衣服容易掉色
                </span>
                <input
                  type="checkbox"
                  checked={formData.colorfast}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colorfast: e.target.checked,
                    }))
                  }
                  className="h-5 w-5 accent-primary-500"
                />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3 text-sm font-medium text-white shadow-card transition-all hover:shadow-elevated hover:from-primary-600 hover:to-primary-700"
            >
              {editingClothing ? "保存修改" : "添加衣物"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

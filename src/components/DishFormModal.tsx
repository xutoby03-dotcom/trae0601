import { useEffect, useState } from "react";
import type { Dish, DishType, MealType } from "@/types";
import { DISH_TYPE_LABELS, MEAL_TYPE_LABELS, ALLERGEN_OPTIONS } from "@/types";
import { cn } from "@/lib/utils";
import Modal from "@/components/Modal";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  onSubmit: (dish: Omit<Dish, "id">) => void;
  initialData?: Dish | null;
  defaultDate: string;
  defaultMealType: MealType;
}

export default function DishFormModal({
  open,
  onClose,
  title,
  onSubmit,
  initialData,
  defaultDate,
  defaultMealType,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DishType>("mixed");
  const [price, setPrice] = useState<number>(10);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [maxQuantity, setMaxQuantity] = useState<number>(50);
  const [image, setImage] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [customAllergen, setCustomAllergen] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setPrice(initialData.price);
      setAllergens(initialData.allergens);
      setMaxQuantity(initialData.maxQuantity);
      setImage(initialData.image);
      setDate(initialData.date);
      setMealType(initialData.mealType);
    } else if (open) {
      setName("");
      setType("mixed");
      setPrice(10);
      setAllergens([]);
      setMaxQuantity(50);
      setImage("");
      setDate(defaultDate);
      setMealType(defaultMealType);
    }
    setCustomAllergen("");
  }, [initialData, open, defaultDate, defaultMealType]);

  const toggleAllergen = (a: string) => {
    setAllergens((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const addCustomAllergen = () => {
    const t = customAllergen.trim();
    if (t && !allergens.includes(t)) {
      setAllergens([...allergens, t]);
    }
    setCustomAllergen("");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      type,
      price,
      allergens,
      maxQuantity,
      image:
        image ||
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          `${name} chinese food dish, appetizing food photography, warm lighting`
        )}&image_size=square`,
      date,
      mealType,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-2xl"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleSubmit} className="btn-primary">
            {initialData ? "保存修改" : "添加菜品"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label-field">菜品名称 *</label>
            <input
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：红烧狮子头"
              required
            />
          </div>

          <div>
            <label className="label-field">荤素类型</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(DISH_TYPE_LABELS) as DishType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    type === t
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-brand-200 bg-white text-brand-700 hover:border-brand-300"
                  )}
                >
                  {DISH_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-field">餐别</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setMealType(t)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm font-medium transition-all",
                    mealType === t
                      ? "border-brand-500 bg-brand-500 text-white"
                      : "border-brand-200 bg-white text-brand-700 hover:border-brand-300"
                  )}
                >
                  {MEAL_TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-field">价格（元）</label>
            <input
              type="number"
              min={0}
              step={0.5}
              className="input-field"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label-field">可订份数上限</label>
            <input
              type="number"
              min={1}
              className="input-field"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="label-field">所属日期</label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field">图片URL（可选）</label>
            <input
              className="input-field"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="留空将自动生成"
            />
          </div>
        </div>

        <div>
          <label className="label-field">过敏原标签</label>
          <div className="mb-2 flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAllergen(a)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  allergens.includes(a)
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-brand-200 bg-white text-brand-600 hover:border-red-200"
                )}
              >
                {allergens.includes(a) ? "✓ " : ""}
                <AlertTriangle className="mr-0.5 inline h-3 w-3" />
                {a}
              </button>
            ))}
            {allergens
              .filter((a) => !ALLERGEN_OPTIONS.includes(a))
              .map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAllergen(a)}
                  className="rounded-full border border-red-400 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                >
                  ✓ {a} ✕
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="自定义过敏原"
              value={customAllergen}
              onChange={(e) => setCustomAllergen(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAllergen();
                }
              }}
            />
            <button type="button" onClick={addCustomAllergen} className="btn-secondary">
              添加
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

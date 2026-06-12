import { useEffect, useMemo, useState } from "react";
import type {
  MealType,
  DeliveryType,
  OrderItem,
  Dish,
} from "@/types";
import {
  MEAL_TYPE_LABELS,
  DELIVERY_TYPE_LABELS,
  BUILDING_OPTIONS,
  CANCEL_DEADLINES,
} from "@/types";
import { cn } from "@/lib/utils";
import Modal from "@/components/Modal";
import MealTypeTabs from "@/components/MealTypeTabs";
import { Minus, Plus, Phone, MapPin, AlertTriangle } from "lucide-react";
import { formatCurrency, formatTime } from "@/utils/format";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    elderlyName: string;
    building: string;
    mealDate: string;
    mealType: MealType;
    dietaryNote: string;
    deliveryType: DeliveryType;
    phone: string;
    items: OrderItem[];
  }) => void;
  dishes: Dish[];
  mealDate: string;
}

export default function OrderFormModal({
  open,
  onClose,
  onSubmit,
  dishes,
  mealDate,
}: Props) {
  const [step, setStep] = useState<number>(1);
  const [mealType, setMealType] = useState<MealType>("lunch");
  const [selectedDishes, setSelectedDishes] = useState<Map<string, number>>(new Map());
  const [elderlyName, setElderlyName] = useState("");
  const [building, setBuilding] = useState(BUILDING_OPTIONS[0]);
  const [dietaryNote, setDietaryNote] = useState("");
  const [deliveryType, setDeliveryType] = useState<DeliveryType>("dine_in");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      setStep(1);
      setMealType("lunch");
      setSelectedDishes(new Map());
      setElderlyName("");
      setBuilding(BUILDING_OPTIONS[0]);
      setDietaryNote("");
      setDeliveryType("dine_in");
      setPhone("");
    }
  }, [open]);

  const availableDishes = useMemo(() => {
    return dishes.filter((d) => d.date === mealDate && d.mealType === mealType);
  }, [dishes, mealDate, mealType]);

  const totalPrice = useMemo(() => {
    let sum = 0;
    selectedDishes.forEach((qty, dishId) => {
      const d = dishes.find((x) => x.id === dishId);
      if (d) sum += d.price * qty;
    });
    return sum;
  }, [selectedDishes, dishes]);

  const itemCount = useMemo(() => {
    let count = 0;
    selectedDishes.forEach((q) => (count += q));
    return count;
  }, [selectedDishes]);

  const updateQty = (dishId: string, delta: number) => {
    setSelectedDishes((prev) => {
      const next = new Map(prev);
      const cur = next.get(dishId) || 0;
      const newQty = Math.max(0, cur + delta);
      if (newQty === 0) next.delete(dishId);
      else next.set(dishId, newQty);
      return next;
    });
  };

  const canSubmitStep1 = itemCount > 0;
  const canSubmitStep2 = elderlyName.trim() && phone.trim();

  const handleSubmit = () => {
    if (!canSubmitStep1 || !canSubmitStep2) return;
    const items: OrderItem[] = [];
    selectedDishes.forEach((qty, dishId) => {
      const d = dishes.find((x) => x.id === dishId);
      if (d) items.push({ dishId, dishName: d.name, quantity: qty, price: d.price });
    });
    onSubmit({
      elderlyName: elderlyName.trim(),
      building,
      mealDate,
      mealType,
      dietaryNote: dietaryNote.trim(),
      deliveryType,
      phone: phone.trim(),
      items,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="新建订餐"
      maxWidth="max-w-3xl"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">
              上一步
            </button>
          )}
          {step < 2 && (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !canSubmitStep1}
              className="btn-primary disabled:opacity-50"
            >
              下一步
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleSubmit}
              disabled={!canSubmitStep2}
              className="btn-primary disabled:opacity-50"
            >
              确认下单（{formatCurrency(totalPrice)}）
            </button>
          )}
        </>
      }
    >
      {/* 步骤指示器 */}
      <div className="mb-5 flex items-center justify-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                step >= s
                  ? "bg-brand-500 text-white"
                  : "bg-brand-100 text-brand-500"
              )}
            >
              {s}
            </div>
            <span
              className={cn(
              "text-sm font-medium",
              step >= s ? "text-brand-800" : "text-brand-400"
            )}
            >
              {s === 1 ? "选择菜品" : "填写信息"}
            </span>
            {s < 2 && <div className="ml-3 h-px w-10 bg-brand-200" />}
          </div>
        ))}
      </div>

      {step === 1 ? (
        <div className="space-y-4">
          {/* 餐别选择 */}
          <div className="flex justify-center">
            <MealTypeTabs value={mealType} onChange={setMealType} />
          </div>

          <div className="text-xs text-brand-500">
            ⚠️ 取消截止时间：
            <span className="font-medium text-brand-700">
              {mealDate.slice(5).replace("-", "月")}日 {CANCEL_DEADLINES[mealType]}
            </span>{" "}
            前可免费取消
          </div>

          {/* 菜品选择 */}
          {availableDishes.length === 0 ? (
            <div className="py-10 text-center text-brand-500">
              {mealDate.slice(5).replace("-", "/")}{" "}
              {MEAL_TYPE_LABELS[mealType]}暂无菜品，请先在菜单管理中添加
            </div>
          ) : (
            <div className="grid max-h-[400px] grid-cols-1 gap-3 overflow-y-auto pr-2 scrollbar-thin sm:grid-cols-2">
              {availableDishes.map((d) => {
                const qty = selectedDishes.get(d.id) || 0;
                return (
                  <div
                    key={d.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-all",
                      qty > 0
                        ? "border-brand-400 bg-brand-50"
                        : "border-brand-100 bg-white"
                    )}
                  >
                    <img
                      src={d.image}
                      alt={d.name}
                      className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-brand-900">
                          {d.name}
                        </span>
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {d.allergens.map((a) => (
                          <span className="inline-flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            {a}
                          </span>
                        ))}
                      </div>
                      <div className="mt-1 text-sm font-semibold text-brand-600">
                        {formatCurrency(d.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(d.id, -1)}
                        disabled={qty === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-brand-200 bg-white text-brand-600 transition-colors hover:bg-brand-50 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-brand-800">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQty(d.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 已选菜品摘要 */}
          <div className="rounded-xl bg-brand-50 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-brand-700">
              已选 {itemCount} 份菜品
              </span>
              <span className="font-semibold text-brand-600">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Array.from(selectedDishes.entries()).map(([dishId, qty]) => {
                const d = dishes.find((x) => x.id === dishId);
                return d ? (
                  <span
                    key={dishId} className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 text-xs text-brand-700">
                    {d.name} × {qty}
                  </span>
                ) : null;
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-field">老人姓名 *</label>
              <input
                className="input-field"
                value={elderlyName}
                onChange={(e) => setElderlyName(e.target.value)}
                placeholder="例如：张奶奶"
              />
            </div>

            <div>
              <label className="label-field">
                <Phone className="mr-1 inline h-4 w-4" />
                联系电话 *
              </label>
              <input
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
              />
            </div>

            <div>
              <label className="label-field">
                <MapPin className="mr-1 inline h-4 w-4" />
                楼栋
              </label>
              <select
                className="input-field"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              >
                {BUILDING_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-field">配送方式</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(DELIVERY_TYPE_LABELS) as DeliveryType[]).map((dt) => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setDeliveryType(dt)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-all",
                      deliveryType === dt
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-brand-200 bg-white text-brand-700 hover:border-brand-300"
                    )}
                  >
                    {DELIVERY_TYPE_LABELS[dt]}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="label-field">忌口说明</label>
              <textarea
                className="input-field min-h-[72px] resize-none"
                value={dietaryNote}
                onChange={(e) => setDietaryNote(e.target.value)}
                placeholder="例如：不吃辣、少盐、海鲜过敏等"
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

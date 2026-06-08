import { useState } from "react";
import { useFridgeStore } from "@/store/useFridgeStore";
import type { ShoppingItem, FoodCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { CATEGORY_ICONS } from "@/data/foodIcons";
import { Trash2, Plus, Check, ShoppingBag } from "lucide-react";

const UNIT_OPTIONS = ["个", "斤", "袋", "瓶", "盒", "包"] as const;

export default function Shopping() {
  const shoppingList = useFridgeStore((s) => s.shoppingList);
  const addShoppingItem = useFridgeStore((s) => s.addShoppingItem);
  const removeShoppingItem = useFridgeStore((s) => s.removeShoppingItem);
  const purchaseShoppingItem = useFridgeStore((s) => s.purchaseShoppingItem);

  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<string>("个");
  const [showPurchased, setShowPurchased] = useState(false);

  const unpurchased = shoppingList.filter((s) => !s.purchased);
  const purchased = shoppingList.filter((s) => s.purchased);

  const handleAdd = () => {
    if (!name.trim()) return;
    addShoppingItem({
      name: name.trim(),
      category: "other" as FoodCategory,
      targetQuantity: quantity,
      unit,
    });
    setName("");
    setQuantity(1);
    setUnit("个");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">🛒 购物清单</h1>
          {unpurchased.length > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#4ECDC4] px-2 text-xs font-bold text-white">
              {unpurchased.length}
            </span>
          )}
        </div>
      </div>

      {shoppingList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ShoppingBag className="mb-4 h-16 w-16 stroke-1" />
          <p className="text-lg font-medium">清单空空的，冰箱食材充足~</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {unpurchased.map((item) => (
              <ShoppingCard
                key={item.id}
                item={item}
                onPurchase={() => purchaseShoppingItem(item.id)}
                onRemove={() => removeShoppingItem(item.id)}
              />
            ))}
          </div>

          {purchased.length > 0 && (
            <div>
              <button
                onClick={() => setShowPurchased(!showPurchased)}
                className="mb-2 flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-600"
              >
                <span>已购买 ({purchased.length})</span>
                {showPurchased ? (
                  <span className="text-xs">▲</span>
                ) : (
                  <span className="text-xs">▼</span>
                )}
              </button>
              {showPurchased && (
                <div className="space-y-2">
                  {purchased.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"
                    >
                      <span className="text-lg opacity-40">
                        {CATEGORY_ICONS[item.category] || "📦"}
                      </span>
                      <span className="flex-1 text-sm text-gray-400 line-through">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-300 line-through">
                        {item.targetQuantity}{item.unit}
                      </span>
                      <button
                        onClick={() => removeShoppingItem(item.id)}
                        className="text-gray-300 transition-colors hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-gray-600">手动添加</h3>
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="食材名称"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-[#4ECDC4]"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="w-16 rounded-lg border border-gray-200 px-2 py-2 text-center text-sm outline-none transition-colors focus:border-[#4ECDC4]"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded-lg border border-gray-200 px-2 py-2 text-sm outline-none transition-colors focus:border-[#4ECDC4]"
          >
            {UNIT_OPTIONS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!name.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4ECDC4] text-white transition-colors hover:bg-[#3dbdb5] disabled:opacity-40"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ShoppingCard({
  item,
  onPurchase,
  onRemove,
}: {
  item: ShoppingItem;
  onPurchase: () => void;
  onRemove: () => void;
}) {
  const icon = CATEGORY_ICONS[item.category] || "📦";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={onPurchase}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#4ECDC4] text-transparent transition-colors hover:bg-[#4ECDC4]/10"
      >
        <Check className="h-3.5 w-3.5" />
      </button>
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
        <p className="text-xs text-gray-400">
          {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
        </p>
      </div>
      <span className="shrink-0 text-sm text-gray-500">
        {item.targetQuantity}{item.unit}
      </span>
      <button
        onClick={onRemove}
        className="shrink-0 text-gray-300 transition-colors hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

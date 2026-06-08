import { useState } from "react";
import { useFridgeStore } from "@/store/useFridgeStore";
import ExpiryBanner from "@/components/ExpiryBanner";
import FridgeView from "@/components/FridgeView";
import FoodDetailModal from "@/components/FoodDetailModal";
import { Plus, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import type { FoodItem } from "@/types";

export default function Home() {
  const consumeFood = useFridgeStore((s) => s.consumeFood);
  const removeFoodItem = useFridgeStore((s) => s.removeFoodItem);
  const removeAsWaste = useFridgeStore((s) => s.removeAsWaste);
  const foodItems = useFridgeStore((s) => s.foodItems);
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);

  const activeCount = foodItems.filter((f) => !f.consumed && f.quantity > 0).length;
  const shoppingCount = useFridgeStore((s) => s.shoppingList.filter((si) => !si.purchased).length);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            🧊 我的冰箱
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            共 {activeCount} 样食材在库
          </p>
        </div>
      </div>

      <ExpiryBanner />

      <FridgeView
        onConsume={(id) => consumeFood(id)}
        onItemClick={(item) => setSelectedItem(item)}
      />

      <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 md:bottom-8 md:right-8">
        <Link
          to="/add"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4ECDC4] text-white shadow-lg shadow-[#4ECDC4]/30 transition-transform hover:scale-110 active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </Link>
        <Link
          to="/shopping"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-600 shadow-lg transition-transform hover:scale-110 active:scale-95"
        >
          <ShoppingCart className="h-6 w-6" />
          {shoppingCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {shoppingCount}
            </span>
          )}
        </Link>
      </div>

      <FoodDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onConsume={(id) => {
          consumeFood(id);
          setSelectedItem(null);
        }}
        onRemove={(id) => {
          removeFoodItem(id);
          setSelectedItem(null);
        }}
        onWaste={(id, reason) => {
          removeAsWaste(id, reason);
          setSelectedItem(null);
        }}
      />
    </div>
  );
}

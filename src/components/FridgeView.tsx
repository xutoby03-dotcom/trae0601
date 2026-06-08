import { useMemo } from "react";
import { useFridgeStore } from "@/store/useFridgeStore";
import { LOCATION_LABELS, type StorageLocation, type FoodItem } from "@/types";
import FoodCard from "@/components/FoodCard";

const SECTIONS: { location: StorageLocation; bg: string; label: string }[] = [
  { location: "fridge", bg: "bg-[#E3F2FD]", label: LOCATION_LABELS.fridge },
  { location: "door", bg: "bg-[#E8F5E9]", label: LOCATION_LABELS.door },
  { location: "drawer", bg: "bg-[#FFF8E1]", label: LOCATION_LABELS.drawer },
  { location: "freezer", bg: "bg-[#BBDEFB]", label: LOCATION_LABELS.freezer },
];

interface FridgeViewProps {
  onConsume: (id: string) => void;
  onItemClick: (item: FoodItem) => void;
}

export default function FridgeView({ onConsume, onItemClick }: FridgeViewProps) {
  const foodItems = useFridgeStore((s) => s.foodItems);

  const itemsByLocation = useMemo(() => {
    const map: Record<StorageLocation, FoodItem[]> = {
      fridge: [],
      freezer: [],
      door: [],
      drawer: [],
    };
    for (const f of foodItems) {
      if (!f.consumed && f.quantity > 0) {
        map[f.storageLocation].push(f);
      }
    }
    return map;
  }, [foodItems]);

  return (
    <div
      className="w-full rounded-3xl overflow-hidden border-2 border-gray-300 relative"
      style={{
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.4)",
        background:
          "linear-gradient(180deg, #e8e8e8 0%, #f5f5f5 3%, #ffffff 6%)",
      }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-2 bg-gray-400/60 rounded-b-lg" />

      <div className="flex flex-col">
        {SECTIONS.map((section, index) => {
          const items = itemsByLocation[section.location];

          return (
            <div key={section.location}>
              {index === SECTIONS.length - 1 && (
                <div className="h-1 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300" />
              )}

              <div className={`${section.bg} px-4 py-3`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {section.location === "drawer" && (
                      <div className="w-8 h-1.5 rounded-full bg-amber-700/50" />
                    )}
                    <span className="text-sm font-semibold text-gray-700">
                      {section.label}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 bg-white/60 rounded-full px-2 py-0.5">
                    {items.length}件
                  </span>
                </div>

                {items.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {items.map((item) => (
                      <FoodCard key={item.id} item={item} onConsume={onConsume} onClick={onItemClick} />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-6 text-gray-400 text-sm">
                    空空如也~
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { X, Trash2, UtensilsCrossed } from "lucide-react";
import type { FoodItem } from "@/types";
import { CATEGORY_LABELS, LOCATION_LABELS } from "@/types";
import {
  getDaysRemaining,
  getExpiryStatus,
  getFreshnessPercent,
  getExpiryLabel,
  getExpiryBadgeColor,
} from "@/utils/expiry";

interface FoodDetailModalProps {
  item: FoodItem | null;
  onClose: () => void;
  onConsume: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function FoodDetailModal({
  item,
  onClose,
  onConsume,
  onRemove,
}: FoodDetailModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (item) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [item]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!item) return null;

  const days = getDaysRemaining(item.purchaseDate, item.shelfLifeDays);
  const status = getExpiryStatus(item.purchaseDate, item.shelfLifeDays);
  const freshness = getFreshnessPercent(item.purchaseDate, item.shelfLifeDays);
  const badgeColor = getExpiryBadgeColor(status);
  const label = getExpiryLabel(status, days);

  const progressColor =
    status === "expired"
      ? "bg-red-500"
      : status === "expiring"
        ? "bg-orange-400"
        : status === "warning"
          ? "bg-yellow-400"
          : "bg-emerald-400";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      />

      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 transition-all duration-300 ease-out"
        style={{
          transform: visible ? "translateY(0)" : "translateY(100%)",
          opacity: visible ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <div className="flex flex-col items-center mb-5">
          <span className="text-5xl mb-2">{item.icon}</span>
          <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
          <span
            className={`mt-1.5 text-xs font-medium rounded-full px-3 py-1 ${badgeColor}`}
          >
            {label}
          </span>
        </div>

        <div className="space-y-3 mb-5">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">分类</span>
            <span className="text-gray-800 font-medium">
              {CATEGORY_LABELS[item.category]}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">数量</span>
            <span className="text-gray-800 font-medium">
              {item.quantity} {item.unit}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">购买日期</span>
            <span className="text-gray-800 font-medium">
              {item.purchaseDate}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">保质期</span>
            <span className="text-gray-800 font-medium">
              {item.shelfLifeDays}天
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">存储位置</span>
            <span className="text-gray-800 font-medium">
              {LOCATION_LABELS[item.storageLocation]}
            </span>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">新鲜度</span>
            <span className="text-gray-800 font-medium">
              {Math.round(freshness)}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${freshness}%` }}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              onConsume(item.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white font-semibold transition-all"
          >
            <UtensilsCrossed className="w-4 h-4" />
            吃掉1份
          </button>
          <button
            onClick={() => {
              onRemove(item.id);
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.97] text-red-500 font-semibold transition-all"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>
    </div>
  );
}

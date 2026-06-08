import type { FoodItem } from "@/types";
import {
  getDaysRemaining,
  getExpiryStatus,
  getFreshnessPercent,
  getExpiryBadgeColor,
  getExpiryLabel,
} from "@/utils/expiry";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  item: FoodItem;
  onConsume: (id: string) => void;
  onClick: (item: FoodItem) => void;
}

const BORDER_COLORS: Record<string, string> = {
  expired: "border-l-red-500",
  expiring: "border-l-orange-400",
  warning: "border-l-yellow-400",
  fresh: "border-l-emerald-400",
};

const PROGRESS_COLORS: Record<string, string> = {
  expired: "bg-red-500",
  expiring: "bg-orange-400",
  warning: "bg-yellow-400",
  fresh: "bg-emerald-400",
};

export default function FoodCard({ item, onConsume, onClick }: FoodCardProps) {
  const status = getExpiryStatus(item.purchaseDate, item.shelfLifeDays);
  const daysRemaining = getDaysRemaining(item.purchaseDate, item.shelfLifeDays);
  const freshness = getFreshnessPercent(item.purchaseDate, item.shelfLifeDays);

  return (
    <div
      onClick={() => onClick(item)}
      className={cn(
        "group relative cursor-pointer rounded-xl border-l-[3px] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
        BORDER_COLORS[status],
        status === "expiring" && "animate-[breathe_2s_ease-in-out_infinite]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{item.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-sm font-semibold text-gray-800">
              {item.name}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
                getExpiryBadgeColor(status)
              )}
            >
              {getExpiryLabel(status, daysRemaining)}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">
            {item.quantity} {item.unit}
          </p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                PROGRESS_COLORS[status]
              )}
              style={{ width: `${freshness}%` }}
            />
          </div>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onConsume(item.id);
        }}
        className="mt-3 w-full rounded-full bg-[#4ECDC4]/10 py-1.5 text-xs font-medium text-[#4ECDC4] transition-colors duration-200 hover:bg-[#4ECDC4]/20 active:bg-[#4ECDC4]/30"
      >
        吃掉
      </button>
    </div>
  );
}

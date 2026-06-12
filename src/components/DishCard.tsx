import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import type { Dish, Order } from "@/types";
import {
  formatCurrency,
  getDishTypeColor,
  getDishTypeLabel,
  getOrderedCount,
} from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  dish: Dish;
  orders: Order[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function DishCard({ dish, orders, onEdit, onDelete }: Props) {
  const ordered = getOrderedCount(dish.id, orders);
  const remaining = Math.max(0, dish.maxQuantity - ordered);
  const percent = Math.min(100, (ordered / dish.maxQuantity) * 100);
  const isLow = remaining <= 5;
  const isSoldOut = remaining === 0;

  return (
    <div className="card card-hover group overflow-hidden">
      {/* 图片区域 */}
      <div className="relative h-44 w-full overflow-hidden bg-brand-100">
        <img
          src={dish.image}
          alt={dish.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* 荤素标签 */}
        <div
          className={cn(
            "absolute left-3 top-3 badge border backdrop-blur-sm",
            getDishTypeColor(dish.type)
          )}
        >
          {getDishTypeLabel(dish.type)}
        </div>
        {/* 操作按钮 */}
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-brand-700 shadow-sm transition-all hover:bg-white hover:shadow"
            title="编辑"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-red-600 shadow-sm transition-all hover:bg-red-50 hover:shadow"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-900/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-red-600">
              已售罄
            </span>
          </div>
        )}
      </div>

      {/* 内容区 */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-brand-900">{dish.name}</h3>
          <span className="text-lg font-bold text-brand-600">{formatCurrency(dish.price)}</span>
        </div>

        {/* 过敏原 */}
        {dish.allergens.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {dish.allergens.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600"
              >
                <AlertTriangle className="h-3 w-3" />
                {a}
              </span>
            ))}
          </div>
        )}

        {/* 份数进度 */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={cn("font-medium", isLow ? "text-red-600" : "text-brand-600")}>
              剩余 {remaining} 份
            </span>
            <span className="text-brand-500">
              已订 {ordered}/{dish.maxQuantity}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isSoldOut
                  ? "bg-red-400"
                  : isLow
                  ? "bg-gradient-to-r from-amber-400 to-red-400"
                  : "bg-gradient-to-r from-brand-400 to-brand-500"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Snowflake, Check, ShoppingCart, Camera, Clock } from 'lucide-react';
import { CATEGORY_EMOJI, STATUS_COLOR } from '@/types';
import type { FoodItem } from '@/types';

interface FoodCardProps {
  item: FoodItem;
  onClaim: (item: FoodItem) => void;
  onMarkPurchased: (item: FoodItem) => void;
  onMarkOutOfStock: (item: FoodItem) => void;
  onSubstitute: (item: FoodItem) => void;
}

export default function FoodCard({ item, onClaim, onMarkPurchased, onMarkOutOfStock, onSubstitute }: FoodCardProps) {
  const categoryEmoji = CATEGORY_EMOJI[item.category];
  const statusColor = STATUS_COLOR[item.status];

  return (
    <div className="flex bg-white rounded-xl shadow-sm overflow-hidden">
      <img
        src={item.referenceImage}
        alt={item.name}
        className="w-[120px] h-[120px] object-cover rounded-l-xl flex-shrink-0"
      />

      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2D2A26] text-sm truncate">{item.name}</span>
            {item.needsRefrigeration && (
              <Snowflake className="w-3.5 h-3.5 text-[#4AA8D8] flex-shrink-0" />
            )}
          </div>

          {item.substitute && (
            <div className="text-xs text-[#8B5E3C] mt-0.5 truncate">
              替换: {item.substitute.substituteName} ¥{item.substitute.substituteCost}
            </div>
          )}

          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#2D2A26]/8 text-[10px] text-[#2D2A26]/70">
              {categoryEmoji} {item.category}
            </span>
            <span className="text-xs text-[#8B5E3C] font-semibold">¥{item.budget}</span>
            <span className="text-xs text-[#2D2A26]/40">{item.suggestedQuantity}</span>
          </div>

          {item.status === '已买到' && item.claim && (
            <div className="flex items-center gap-1 mt-1">
              <Check className="w-3 h-3 text-[#5A8F5C]" />
              <span className="text-xs text-[#5A8F5C]">
                {item.claim.buyer} · ¥{item.claim.cost}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {item.status === '未认领' && (
            <button
              onClick={() => onClaim(item)}
              className="px-3 py-1 rounded-full bg-[#E8652E] text-white text-xs font-medium hover:bg-[#d4581f] transition-colors"
            >
              认领
            </button>
          )}

          {item.status === '已认领' && (
            <>
              <button
                onClick={() => onMarkPurchased(item)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#4AA8D8] text-white text-xs font-medium hover:bg-[#3a9ac8] transition-colors"
              >
                <ShoppingCart className="w-3 h-3" />
                已买到
              </button>
              <button
                onClick={() => onMarkOutOfStock(item)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#D4A017] text-white text-xs font-medium hover:bg-[#c09015] transition-colors"
              >
                <Clock className="w-3 h-3" />
                缺货
              </button>
              {item.claim && !item.claim.receiptPhoto && (
                <span className="flex items-center gap-0.5 text-[10px] text-[#8B5E3C]">
                  <Camera className="w-3 h-3" />
                  上传小票
                </span>
              )}
            </>
          )}

          {item.status === '已买到' && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
              style={{ backgroundColor: statusColor }}
            >
              <Check className="w-3 h-3" />
              已买到
            </span>
          )}

          {item.status === '临时缺货' && (
            <>
              <button
                onClick={() => onSubstitute(item)}
                className="px-3 py-1 rounded-full bg-[#D94F4F] text-white text-xs font-medium hover:bg-[#c44040] transition-colors"
              >
                替换
              </button>
              <button
                onClick={() => onClaim(item)}
                className="px-3 py-1 rounded-full bg-[#E8652E] text-white text-xs font-medium hover:bg-[#d4581f] transition-colors"
              >
                重新认领
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

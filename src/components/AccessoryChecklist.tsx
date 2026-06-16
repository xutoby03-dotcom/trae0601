import { Layout, GitBranch, Minus, Pin, Package, type LucideIcon } from 'lucide-react';
import type { AccessoryType, BorrowItem } from '@/types';
import { ACCESSORY_META } from '@/types';

const ICONS: Record<AccessoryType, LucideIcon> = {
  tarp: Layout,
  pole: GitBranch,
  bar: Minus,
  stake: Pin,
  bag: Package,
};

interface AccessoryChecklistProps {
  items: BorrowItem;
  onChange: (items: BorrowItem) => void;
  maxItems?: BorrowItem;
  readOnly?: boolean;
  highlightDiff?: boolean;
  compareItems?: BorrowItem;
}

export default function AccessoryChecklist({
  items,
  onChange,
  maxItems,
  readOnly = false,
  highlightDiff = false,
  compareItems,
}: AccessoryChecklistProps) {
  const types: AccessoryType[] = ['tarp', 'pole', 'bar', 'stake', 'bag'];

  const updateQty = (type: AccessoryType, delta: number) => {
    if (readOnly) return;
    const max = maxItems ? maxItems[type] : 99;
    const newValue = Math.max(0, Math.min(max, items[type] + delta));
    onChange({ ...items, [type]: newValue });
  };

  const setQty = (type: AccessoryType, value: number) => {
    if (readOnly) return;
    const max = maxItems ? maxItems[type] : 99;
    const newValue = Math.max(0, Math.min(max, value));
    onChange({ ...items, [type]: newValue });
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {types.map((type) => {
        const Icon = ICONS[type];
        const meta = ACCESSORY_META[type];
        const qty = items[type];
        const max = maxItems ? maxItems[type] : null;
        const compareQty = compareItems ? compareItems[type] : null;
        const isDiff = highlightDiff && compareQty !== null && compareQty !== qty;

        return (
          <div
            key={type}
            className={`rounded-xl border-2 p-4 flex flex-col items-center transition-all ${
              isDiff
                ? 'border-red-300 bg-red-50'
                : qty > 0
                ? 'border-primary-200 bg-primary-50/50'
                : 'border-gray-200 bg-white'
            } ${readOnly ? '' : 'hover:border-primary-300'}`}
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                qty > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon size={20} />
            </div>
            <div className="text-sm font-medium text-gray-800 mb-2">{meta.name}</div>

            {readOnly ? (
              <div className="text-2xl font-bold text-gray-900">
                {qty}
                {max !== null && <span className="text-sm font-normal text-gray-400">/{max}</span>}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateQty(type, -1)}
                  className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center justify-center"
                >
                  -
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(type, parseInt(e.target.value) || 0)}
                  className="w-12 h-7 text-center border border-gray-200 rounded-md text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min={0}
                  max={max || undefined}
                />
                <button
                  type="button"
                  onClick={() => updateQty(type, 1)}
                  className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold flex items-center justify-center"
                >
                  +
                </button>
              </div>
            )}

            {isDiff && (
              <div className="text-xs text-red-600 mt-1 font-medium">
                少了 {compareQty! - qty} 件
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

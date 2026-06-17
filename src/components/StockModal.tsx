import { useState, useEffect } from 'react';
import Modal from './Modal';
import { Package, Plus, Minus, ShoppingCart } from 'lucide-react';
import type { BatterySize } from '@/types';
import { useStore } from '@/store/useStore';

interface StockModalProps {
  open: boolean;
  onClose: () => void;
  defaultSize?: BatterySize;
}

export default function StockModal({ open, onClose, defaultSize }: StockModalProps) {
  const batteryStock = useStore((s) => s.batteryStock);
  const updateBatteryStock = useStore((s) => s.updateBatteryStock);
  const setBatteryStock = useStore((s) => s.setBatteryStock);

  const [selectedSize, setSelectedSize] = useState<BatterySize>(
    defaultSize ?? '312',
  );
  const [addAmount, setAddAmount] = useState(10);

  useEffect(() => {
    if (defaultSize) {
      setSelectedSize(defaultSize);
    }
  }, [defaultSize, open]);

  const currentStock =
    batteryStock.find((s) => s.size === selectedSize)?.quantity ?? 0;

  const handleAdd = (amount: number) => {
    updateBatteryStock(selectedSize, amount);
  };

  const commonPackSizes = [5, 10, 20, 30];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`📦 ${defaultSize ? `#${defaultSize}号电池` : '电池库存'}补货`}
      subtitle="快速补充电池库存，避免换电时才发现缺货"
    >
      <div className="space-y-6">
        <div>
          <label className="label mb-3">选择电池规格</label>
          <div className="grid grid-cols-4 gap-2">
            {(['10', '13', '312', '675'] as BatterySize[]).map((size) => {
              const stock = batteryStock.find((s) => s.size === size)?.quantity ?? 0;
              const isLow = stock <= 5;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`p-4 rounded-2xl font-bold transition-all border-2 ${
                    selectedSize === size
                      ? isLow
                        ? 'bg-accent-red/10 border-accent-red shadow-soft'
                        : 'bg-brand-50 border-brand-400 shadow-soft'
                      : 'bg-warm-50 border-transparent hover:bg-white hover:border-warm-200'
                  }`}
                >
                  <p className="text-2xl">#{size}</p>
                  <p
                    className={`text-xs mt-1 font-medium ${
                      isLow ? 'text-accent-red' : 'text-warm-400'
                    }`}
                  >
                    {stock} 颗
                  </p>
                  {isLow && <p className="text-[10px] text-accent-red mt-0.5">库存低</p>}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className={`p-5 rounded-2xl ${
            currentStock <= 2
              ? 'bg-accent-red/10 border-2 border-accent-red/30'
              : currentStock <= 5
              ? 'bg-accent-orange/10 border-2 border-accent-orange/30'
              : 'bg-brand-50 border-2 border-brand-100'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package
                size={20}
                className={
                  currentStock <= 2
                    ? 'text-accent-red'
                    : currentStock <= 5
                    ? 'text-accent-orange'
                    : 'text-brand-600'
                }
              />
              <span className="font-bold text-accent-blue">当前库存</span>
            </div>
            <span
              className={`text-3xl font-bold ${
                currentStock <= 2
                  ? 'text-accent-red animate-pulse-soft'
                  : currentStock <= 5
                  ? 'text-accent-orange'
                  : 'text-brand-600'
              }`}
            >
              {currentStock}
            </span>
          </div>
          <p className="text-sm text-warm-500">
            {currentStock === 0
              ? '⚠️ 已完全缺货！请立即补货'
              : currentStock <= 2
              ? '⚠️ 库存严重不足，建议立即补货'
              : currentStock <= 5
              ? '⚠️ 库存偏低，建议尽快补货'
              : '✅ 库存充足'}
          </p>
        </div>

        <div>
          <label className="label mb-3">快速补货</label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {commonPackSizes.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleAdd(num)}
                className="p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold shadow-soft hover:shadow-hover hover:-translate-y-0.5 transition-all"
              >
                +{num}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAddAmount(Math.max(1, addAmount - 1))}
              className="w-12 h-12 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center text-accent-blue transition-all"
            >
              <Minus size={20} />
            </button>
            <div className="flex-1 relative">
              <input
                type="number"
                min="1"
                className="input text-center text-xl font-bold"
                value={addAmount}
                onChange={(e) =>
                  setAddAmount(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm">
                颗
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAddAmount(addAmount + 1)}
              className="w-12 h-12 rounded-xl bg-warm-100 hover:bg-warm-200 flex items-center justify-center text-accent-blue transition-all"
            >
              <Plus size={20} />
            </button>
            <button
              type="button"
              onClick={() => handleAdd(addAmount)}
              className="h-12 px-6 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold flex items-center gap-2 shadow-soft hover:shadow-hover transition-all"
            >
              <Plus size={18} />
              添加
            </button>
          </div>
        </div>

        <div>
          <label className="label mb-3">手动设置库存</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              className="input"
              defaultValue={currentStock}
              onBlur={(e) =>
                setBatteryStock(selectedSize, Number(e.target.value) || 0)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setBatteryStock(selectedSize, Number((e.target as HTMLInputElement).value) || 0);
                }
              }}
            />
            <button
              type="button"
              onClick={() => setBatteryStock(selectedSize, 0)}
              className="px-4 py-3 rounded-xl bg-red-50 text-accent-red hover:bg-red-100 transition-all text-sm font-medium"
            >
              清零
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-warm-50 border border-warm-100">
          <p className="text-sm text-warm-500 flex items-start gap-2">
            <ShoppingCart size={18} className="text-brand-500 mt-0.5 flex-shrink-0" />
            <span>
              💡 助听器电池通常一板有 6 颗或 10 颗。建议至少保持 <strong className="text-brand-600">2 周用量</strong> 的安全库存（每台助听器每周约 1 颗）。
            </span>
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-primary">
            完成
          </button>
        </div>
      </div>
    </Modal>
  );
}

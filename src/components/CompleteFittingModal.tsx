import { useState } from 'react';
import { X, ShoppingBag, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { QueueItem } from '../../shared/types';

interface Props {
  item: QueueItem;
  onClose: () => void;
}

export default function CompleteFittingModal({ item, onClose }: Props) {
  const { completeFitting } = useStore();
  const [purchasedCount, setPurchasedCount] = useState(0);
  const [exchangedCount, setExchangedCount] = useState(0);
  const [leftItemsInput, setLeftItemsInput] = useState('');
  const [cleaned, setCleaned] = useState(false);

  const handleSubmit = async () => {
    const leftItems = leftItemsInput.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
    await completeFitting(item.id, {
      purchasedCount,
      exchangedCount,
      leftItems,
      cleaned,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-cream-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-burgundy-700 px-6 py-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-white">试衣完成登记</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-cream-100 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-champagne-400 flex items-center justify-center font-display text-xl font-bold text-charcoal-800">
                {item.queueNumber}
              </div>
              <div>
                <p className="font-medium text-charcoal-800">
                  {item.customerName || `尾号${item.phoneLast4}`}
                </p>
                <p className="text-sm text-charcoal-500">
                  试衣间 {item.roomNumber} · 拿入 {item.itemsCount} 件
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                <ShoppingBag className="w-4 h-4 inline mr-1" />
                购买件数
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPurchasedCount(Math.max(0, purchasedCount - 1))}
                  className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={purchasedCount}
                  onChange={(e) => setPurchasedCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 input-field text-center text-xl font-bold"
                />
                <button
                  onClick={() => setPurchasedCount(purchasedCount + 1)}
                  className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                <RefreshCw className="w-4 h-4 inline mr-1" />
                换码件数
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setExchangedCount(Math.max(0, exchangedCount - 1))}
                  className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="0"
                  value={exchangedCount}
                  onChange={(e) => setExchangedCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 input-field text-center text-xl font-bold"
                />
                <button
                  onClick={() => setExchangedCount(exchangedCount + 1)}
                  className="w-10 h-10 rounded-lg bg-cream-300 text-charcoal-700 font-bold text-xl hover:bg-cream-400 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1 text-yellow-600" />
              遗落物品（逗号分隔）
            </label>
            <input
              type="text"
              placeholder="如：口红、手机、雨伞"
              value={leftItemsInput}
              onChange={(e) => setLeftItemsInput(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-cream-100 rounded-lg">
            <input
              type="checkbox"
              id="cleaned"
              checked={cleaned}
              onChange={(e) => setCleaned(e.target.checked)}
              className="w-5 h-5 rounded text-burgundy-700 focus:ring-burgundy-500"
            />
            <label htmlFor="cleaned" className="text-charcoal-700">
              <Sparkles className="w-4 h-4 inline mr-1 text-champagne-600" />
              房间已清洁
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="btn-outline flex-1">
              取消
            </button>
            <button onClick={handleSubmit} className="btn-primary flex-1">
              确认完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
